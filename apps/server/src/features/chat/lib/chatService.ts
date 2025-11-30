import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { querySimilarDocuments } from "@/features/courses/lib/embeddingService";
import { getChatMessages } from "../db/queries";
import type { ChatMode } from "@studyrag/shared-schemas";
import { ExternalAPIError } from "@/lib/errors";
import { ACADEMIC_MODE_PROMPT, CASUAL_MODE_PROMPT, BASE_SYSTEM_PROMPT } from "./prompts";
import { formatMessages } from "../helpers/formatters";

/**
 * Initialize the Gemini chat model
 */
function getChatModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    maxOutputTokens: 3000,
  });
}

/**
 * Retrieve chat history for context
 */
export async function retrieveChatHistory(courseId: string) {
  return await getChatMessages(courseId);
}

/**
 * Retrieve relevant document context from ChromaDB
 */
export async function retrieveContext(
  courseId: string,
  query: string,
  topK: number = 5
): Promise<string> {
  const results = await querySimilarDocuments(courseId, query, topK);
  
  if (results.length === 0) {
    return "No relevant course materials found.";
  }
  
  // Format context with source attribution
  const contextParts = results.map((result, index) => {
    return `[Source ${index + 1}]\n${result.text}`;
  });
  
  return contextParts.join("\n\n---\n\n");
}

/**
 * Summarize old messages to fit within context window
 * Keeps recent messages full, summarizes older ones
 */
export async function summarizeOldMessages(
  messages: Awaited<ReturnType<typeof getChatMessages>>,
  keepRecentCount: number = 10
): Promise<string> {
  if (messages.length <= keepRecentCount) {
    // No summarization needed
    return formatMessages(messages);
  }
  
  const oldMessages = messages.slice(0, -keepRecentCount);
  const recentMessages = messages.slice(-keepRecentCount);
  
  // Create a concise summary of old messages
  const summaryParts: string[] = [];
  let currentTopic = "";
  
  for (const msg of oldMessages) {
    // Simple topic extraction (first 50 chars of user messages)
    if (msg.role === "USER") {
      const topic = msg.message.substring(0, 50);
      if (topic !== currentTopic) {
        currentTopic = topic;
        summaryParts.push(`User asked about: ${topic}...`);
      }
    }
  }
  
  const summary = summaryParts.length > 0 
    ? `Previous conversation summary:\n${summaryParts.join("\n")}\n\n---\n\nRecent conversation:\n`
    : "Recent conversation:\n";
  
  return summary + formatMessages(recentMessages);
}

/**
 * Build prompt with RAG context and chat history
 */
export function buildPrompt(
  mode: ChatMode,
  context: string,
  chatHistory: string,
  userQuery: string,
  course_metadata?: {course_code: string, course_title: string, course_description: string | null}
): string {
  const modePrompt =
    mode === "academic" ? ACADEMIC_MODE_PROMPT : CASUAL_MODE_PROMPT;
  const {course_code, course_description, course_title} = {...course_metadata}
  return `
    ${BASE_SYSTEM_PROMPT}

    ${modePrompt}

    COURSE INFORMATION:

    COURSE CODE: ${course_code}
    COURSE TITLE: ${course_title}
    COURSE DESCRIPTION: ${course_description}

    COURSE MATERIALS CONTEXT:
    ${context}

    ${chatHistory ? `CHAT HISTORY:\n${chatHistory}\n` : ""}

    STUDENT QUESTION:
    ${userQuery}

    Now respond as Jules following all mode rules, staying strictly within the course scope and also be conversational and not sound AI-ish.
    `;
}


/**
 * Generate streaming response from LLM
 * Returns an async generator that yields tokens
 */
export async function* generateStreamingResponse(
  prompt: string
): AsyncGenerator<string, void, unknown> {
  const model = getChatModel();
  
  try {
    const stream = await model.stream(prompt);
    
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content.toString();
      }
    }
  } catch (error) {
    throw new ExternalAPIError("Failed to generate response from AI model", "GoogleAI");
  }
}

/**
 * Generate complete (non-streaming) response
 * Used as fallback or for testing
 */
export async function generateResponse(prompt: string): Promise<string> {
  const model = getChatModel();
  
  try {
    const response = await model.invoke(prompt);
    return response.content.toString();
  } catch (error) {
    throw new ExternalAPIError("Failed to generate response from AI model", "GoogleAI");
  }
}
