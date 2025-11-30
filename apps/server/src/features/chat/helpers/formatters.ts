import type { getChatMessages } from "../db/queries";

/**
 * Format messages for prompt inclusion
 */
export function formatMessages(messages: Awaited<ReturnType<typeof getChatMessages>>): string {
  return messages
    .map((msg) => `${msg.role}: ${msg.message}`)
    .join("\n");
}
