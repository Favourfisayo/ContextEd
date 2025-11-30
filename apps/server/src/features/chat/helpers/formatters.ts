import type { ChatMessage } from "@studyrag/shared-schemas";
import type { getChatMessages } from "../db/queries";

/**
 * Format messages for prompt inclusion
 */
export function formatMessages(messages: Awaited<ReturnType<typeof getChatMessages>>): string {
  return messages
    .map((msg: ChatMessage) => `${msg.role}: ${msg.message}`)
    .join("\n");
}