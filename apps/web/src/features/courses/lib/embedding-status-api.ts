const API_URL = "/api/protected";

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
        queryClient.invalidateQueries({ queryKey: ["embedding-status", courseId] });
        
        // Show toast notification
        if (data.status === "completed") {
          toast.success("Document embedding completed!");
        } else if (data.status === "failed") {
          toast.error(`Embedding failed: ${data.error || "Unknown error"}`);
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