const API_URL = process.env.NEXT_PUBLIC_SERVER_PROTECTED_URL;
import { type EmbeddingJobStatus } from "@studyrag/shared-schemas";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseApiError } from "@/lib/errors";
export interface EmbeddingStatusResponse {
  documents: EmbeddingJobStatus[];
  allCompleted: boolean;
  hasFailed: boolean;
}

/**
 * Fetch embedding status for all documents in a course
 */
export async function getCourseEmbeddingStatus(
  courseId: string
): Promise<EmbeddingStatusResponse> {
  const url = `${API_URL}/courses/${courseId}/embedding-status`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });


  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
 
  return result.data;
}

/**
 * Retry a failed embedding job
 */
export async function retryEmbedding(docId: string): Promise<void> {
  const response = await fetch(`${API_URL}/courses/documents/${docId}/retry`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}


export function connectToSSEvents(
  courseId: string,
  queryClient: QueryClient
) {

  const sseUrl = `${API_URL}/courses/${courseId}/embedding-events`;


  const eventSource = new EventSource(sseUrl, { withCredentials: true })

  eventSource.onopen = () => {
      // console.log("SSE connection established");
  };

  eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected") {
        // console.log("SSE connected event received for course:", data.courseId);
      } else if (data.type === "update") {
        
        // Invalidate and refetch when we get an update
        queryClient.setQueryData(["embedding-status", courseId], (oldData: EmbeddingStatusResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            documents: oldData.documents.map(doc => {
              if (doc.docId === data.docId) {
                return {
                  ...doc,
                  status: data.status,
                  progress: data.progress,
                  stage: data.stage,
                  error: data.error,
                  // If completed/failed, update the DB status too for UI consistency
                  embeddingStatus: data.status === "completed" ? "SUCCESS" : 
                                  data.status === "failed" ? "FAILED" : 
                                  doc.embeddingStatus
                };
              }
              return doc;
            })
          };
        });
        
        // Show toast notification
        if (data.status === "completed") {
          toast.success("Document embedding completed!");
          // Invalidate to ensure we get fresh data from server eventually
          queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] });
        } else if (data.status === "failed") {
          toast.error(`Embedding failed: ${data.error || "Unknown error"}`);
          queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] });
        }
      } else if (data.type === "heartbeat") {
        // console.log("💓 Heartbeat received");
    }
  }

    eventSource.onerror = () => {
      eventSource.close();
    }

    return eventSource
}