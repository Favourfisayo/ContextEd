import { ChromaClient, CloudClient } from "chromadb";
import { InternalServerError } from "@/lib/errors";

// Initialize ChromaDB client
// Supports both local and Chroma Cloud deployments
const isCloudMode = !!process.env.CHROMA_CLOUD_API_KEY;

if (isCloudMode) {
  // Chroma Cloud configuration
  const tenant = process.env.CHROMA_CLOUD_TENANT;
  const database = process.env.CHROMA_CLOUD_DATABASE;
  const apiKey = process.env.CHROMA_CLOUD_API_KEY;

  if (!tenant || !database || !apiKey) {
    throw new InternalServerError(
      "Chroma Cloud requires CHROMA_CLOUD_TENANT, CHROMA_CLOUD_DATABASE, and CHROMA_CLOUD_API_KEY"
    );
  }

}

export const chromaClient = isCloudMode
  ? new CloudClient({
      tenant: process.env.CHROMA_CLOUD_TENANT!,
      database: process.env.CHROMA_CLOUD_DATABASE!,
      apiKey: process.env.CHROMA_CLOUD_API_KEY!
    })
  : new ChromaClient({
      path: "http://localhost:8000",
    });

/**
 * Get or create a collection in ChromaDB for a specific course
 * Each course gets its own collection for isolated embeddings
 */
export async function getOrCreateCourseCollection(courseId: string) {
  try {
    // Collection names must be alphanumeric with underscores/hyphens
    const collectionName = `course_${courseId.replace(/-/g, "_")}`;
    
    const collection = await chromaClient.getOrCreateCollection({
      name: collectionName,
      metadata: {
        course_id: courseId,
        created_at: new Date().toISOString(),
      },
      embeddingFunction: null, // Provide custom function to avoid default
    });

    return collection;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a course collection from ChromaDB
 * Useful for cleanup when a course is deleted
 */

export async function deleteCourseCollection(courseId: string) {
  try {
    const collectionName = `course_${courseId.replace(/-/g, "_")}`;
    await chromaClient.deleteCollection({ name: collectionName });
  } catch (error: any) {
    // Ignore if collection not found
    // This happens if the course was created but no embeddings were generated yet
    if (
      error?.name === "ChromaNotFoundError" || 
      error?.message?.includes("could not be found") ||
      error?.message?.includes("does not exist")
    ) {
      return;
    }
    throw error;
  }
}
