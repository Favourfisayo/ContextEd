import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { InternalServerError } from "@/lib/errors";

// Validate OpenAI API key
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new InternalServerError("GOOGLE_API_KEY is not set in environment variables");
}

/**
 * Gemini embeddings instance
 * Using text-embedding-004
 */
export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Documents Embedding",

});

/**
 * Generate embeddings for a single text
 */
export async function embedText(text: string): Promise<number[]> {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  try {
    const embeddings_result = await embeddings.embedDocuments(texts);
    return embeddings_result;
  } catch (error) {
    throw error;
  }
}
