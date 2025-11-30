"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectToSSEvents, getCourseEmbeddingStatus, retryEmbedding } from "../lib/embedding-status-api";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { cn } from "@/lib/utils";

interface EmbeddingStatusBannerProps {
  courseId: string;
}

export function EmbeddingStatusBanner({ courseId }: EmbeddingStatusBannerProps) {
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch initial status once (no polling)
  const { data, isLoading, error } = useQuery({
    queryKey: ["embedding-status", courseId],
    queryFn: async () => {
      const result = await getCourseEmbeddingStatus(courseId);
      return result;
    },
    refetchOnMount: true,
    retry: 1,
  });

  // Retry mutation to try embedding process again
  // We do not show a toast per-mutation here to avoid spamming; handle toasts in the bulk handler.
  const retryMutation = useMutation({
    mutationFn: (docId: string) => retryEmbedding(docId),
  });

  // Connect to Server-Sent Events for real-time updates
  useEffect(() => {
    const eventSource = connectToSSEvents(courseId, queryClient);

    return () => {
      eventSource.close();
    };
  }, [courseId, queryClient]);

  // retry all failed docs in parallel
  async function handleRetryAll() {
    if (!data) return;
    const failedDocs = data.documents.filter((d) => d.embeddingStatus === "FAILED" || d.status === "failed");
    if (failedDocs.length === 0) return;

    setIsRetrying(true);
    toast.info("Retry attempts submitted");
    try {
      // Ensure we have latest state before starting
      await queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] });

      // Retry all in parallel. Each promise invalidates query once finished so UI/SSE/consumers can pick up changes.
      const promises = failedDocs.map((doc) =>
        retryMutation
          .mutateAsync(doc.docId)
          .then(() => queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] }))
          .catch((err) => {
            console.error("Retry failed for doc", doc.docId, err);
            // swallow - continue other retries
          }),
      );

      await Promise.all(promises);

      // Final refresh request to ensure UI is consistent
      await queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] });
    } catch (err) {
      toast.error("Failed to submit retries");
    } finally {
      setIsRetrying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="border-b bg-muted/50 px-6 py-3">
        <Loader text="Checking embedding status..." />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching embedding status:", error);
    return (
      <div className="border-b bg-destructive/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">Failed to check embedding status</p>
        </div>
      </div>
    );
  }

  // If no data or no documents, don't show banner
  if (!data || data.documents.length === 0) {
    return null;
  }

  // Don't show banner if all documents are successfully embedded
  if (data.allCompleted && !data.hasFailed) {
    return null;
  }

  // A document is pending if BOTH database status is PENDING AND job status is waiting/active
  // If database shows FAILED, it's failed regardless of job status
  const pendingDocs = data.documents.filter((doc) => {
    const isPending =
      doc.embeddingStatus === "PENDING" && (doc.status === "waiting" || doc.status === "active");
    return isPending;
  });

  const failedDocs = data.documents.filter((doc) => doc.embeddingStatus === "FAILED" || doc.status === "failed");

  return (
    <div className="border-b bg-muted/50 px-6 py-3 mt-4">
      {/* Processing State */}
      {pendingDocs.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Loader text="Processing course documents..." />
            <p className="text-xs text-muted-foreground">
              {pendingDocs.length} of {data.documents.length} documents being embedded. This may take a few moments.
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Failed State */}
      {failedDocs.length > 0 && pendingDocs.length === 0 && (
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Embedding failed for {failedDocs.length} document(s)</p>
            <p className="text-xs text-muted-foreground">
              {failedDocs[0].error || "An error occurred during processing"}
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={handleRetryAll} disabled={isRetrying}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")}
            />
            {isRetrying ? "Retrying..." : "Retry All"}
          </Button>
        </div>
      )}

      {/* Processing Details (Expandable) */}
      {pendingDocs.length > 0 && (
        <div className="mt-2 space-y-1">
          {pendingDocs.slice(0, 3).map((doc) => (
            <div key={doc.docId} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span className="truncate max-w-md">{doc.fileUrl.split("/").pop()}</span>
              {doc.status === "active" && <span className="text-primary font-medium">Processing...</span>}
              {doc.status === "waiting" && <span className="text-muted-foreground">Waiting...</span>}
            </div>
          ))}
          {pendingDocs.length > 3 && <p className="text-xs text-muted-foreground pl-3">+{pendingDocs.length - 3} more</p>}
        </div>
      )}
    </div>
  );
}