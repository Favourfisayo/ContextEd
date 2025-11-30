import type { ChatMessage, SendMessageInput, ChatMode } from "@studyrag/shared-schemas";
import {  parseApiError } from "@/lib/errors";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_SERVER_PROTECTED_URL;

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
}

export interface StreamEvent {
  type: "token" | "done" | "error";
  content?: string;
  message?: string;
}

/**
 * Fetch all chat messages for a course
 */
export async function getChatMessages(courseId: string): Promise<ChatHistoryResponse> {
  const response = await fetch(`${API_URL}/chat/${courseId}/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Send a message and receive streaming response
 * Returns a ReadableStream that yields StreamEvent objects
 */
export async function sendMessage(
  courseId: string,
  message: string,
  mode: ChatMode = "academic"
): Promise<ReadableStream<StreamEvent>> {
  const response = await fetch(`${API_URL}/chat/${courseId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ message, mode } as SendMessageInput),
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (!response.body) {
    throw new Error("No response body received");
  }

  // Create a TransformStream to parse SSE events
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            controller.enqueue(data as StreamEvent);
          } catch (e) {
            toast.error(`streaming error: ${e}`)
          }
        }
      }
    },
  });

  return response.body.pipeThrough(transformStream);
}
