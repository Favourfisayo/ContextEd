import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "./api";
import type { ChatMode } from "@studyrag/shared-schemas";

interface SendMessageOptions {
  courseId: string;
  message: string;
  mode: ChatMode;
  onToken?: (token: string) => void;
  onComplete?: (fullMessage: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send a chat message with streaming response
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: SendMessageOptions) => {
      const { courseId, message, mode, onToken, onComplete, onError } = options;

      try {
        const stream = await sendMessage(courseId, message, mode);
        const reader = stream.getReader();
        let fullResponse = "";
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value && value.content) {
            if (value.type === "token") {
              fullResponse += value.content;
              onToken?.(value.content);
            } else if (value.type === "done") {
              // Use the full response from the done event if available
                fullResponse = value.content;
                onComplete?.(fullResponse);
              
              // Invalidate AFTER streaming completes to avoid clearing optimistic UI
              queryClient.invalidateQueries({ queryKey: ["chat", courseId] });
            } else if (value.type === "error") {
              const error = new Error(value.message || "Failed to generate response");
              onError?.(error);
              throw error;
            }
          }
        }

        return { fullResponse, courseId };
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error occurred");
        onError?.(err);
        throw err;
      }
    },
  });
}
