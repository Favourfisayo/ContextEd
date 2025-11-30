import { z } from "zod";

/**
 * Chat mode enum schema
 * Determines the tone and style of AI responses
 */
export const ChatModeSchema: z.ZodEnum<["academic", "casual"]> = z.enum(["academic", "casual"]);
export type ChatMode = z.infer<typeof ChatModeSchema>;

/**
 * Message role enum schema (matches Prisma ROLE enum)
 */
export const MessageRoleSchema: z.ZodEnum<["USER", "ASSISTANT"]> = z.enum(["USER", "ASSISTANT"]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

/**
 * Shared validation schema for sending a chat message
 * Used by both backend and frontend
 */
export const SendMessageSchema: z.ZodObject<{
  message: z.ZodString;
  mode: z.ZodDefault<z.ZodEnum<["academic", "casual"]>>;
}> = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
  mode: ChatModeSchema.default("academic"),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

/**
 * Chat message response schema
 */
export const ChatMessageSchema: z.ZodObject<{
  id: z.ZodString;
  role: z.ZodEnum<["USER", "ASSISTANT"]>;
  message: z.ZodString;
  created_at: z.ZodDate;
  user_id: z.ZodString;
  course_id: z.ZodString;
}> = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  message: z.string(),
  created_at: z.date(),
  user_id: z.string(),
  course_id: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Chat history response schema
 */
export const ChatHistorySchema: z.ZodObject<{
  messages: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<["USER", "ASSISTANT"]>;
    message: z.ZodString;
    created_at: z.ZodDate;
    user_id: z.ZodString;
    course_id: z.ZodString;
  }>>;
  total: z.ZodNumber;
}> = z.object({
  messages: z.array(ChatMessageSchema),
  total: z.number(),
});
export type ChatHistory = z.infer<typeof ChatHistorySchema>;
