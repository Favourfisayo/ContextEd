import { loadAndSplitDocument } from "./documentLoader";
import { embedDocuments } from "@/lib/embeddings";
import { getOrCreateCourseCollection } from "@/lib/chroma";
import prisma from "@studyRAG/db";
import { DocumentProcessingError } from "@/lib/errors";

/**
 * Main embedding service
 * Orchestrates the entire embedding pipeline:
 * 1. Load and split document
 * 2. Generate embeddings
 * 3. Store in ChromaDB
 * 4. Update database status
 */
export async function buildEmbeddingsForDocument(
  courseId: string,
  fileUrl: string,
  docId: string
): Promise<void> {
  try {
    // Step 1: Load and split document
    const documents = await loadAndSplitDocument(fileUrl);
    
    if (documents.length === 0) {
      throw new DocumentProcessingError("No content extracted from document", { fileUrl, docId });
    }
    
    // Step 2: Extract text from documents
    const texts = documents.map((doc) => doc.pageContent);
    const embeddingsArray = await embedDocuments(texts);
    
    
    // Step 3: Store in ChromaDB
    const collection = await getOrCreateCourseCollection(courseId);
    
    // Prepare metadata for each chunk
    const ids = documents.map((_, index) => `${docId}_chunk_${index}`);
    const metadatas = documents.map((doc, index) => {
      // Sanitize metadata - ChromaDB only accepts primitives
      const sanitizedMetadata: Record<string, string | number | boolean | null> = {
        doc_id: docId,
        course_id: courseId,
        chunk_index: index,
        source: fileUrl,
      };
      
      // Add safe metadata from document (like page numbers)
      if (doc.metadata) {
        Object.entries(doc.metadata).forEach(([key, value]) => {
          // Only include primitive values
          if (
            typeof value === 'string' || 
            typeof value === 'number' || 
            typeof value === 'boolean' || 
            value === null
          ) {
            sanitizedMetadata[key] = value;
          } else if (value !== undefined) {
            // Convert complex types to strings
            sanitizedMetadata[key] = String(value);
          }
        });
      }
      
      return sanitizedMetadata;
    });
    
    // Add embeddings to ChromaDB
    await collection.add({
      ids,
      embeddings: embeddingsArray,
      documents: texts,
      metadatas,
    });
    
    
    // Step 4: Update database status
    await prisma.courseDoc.update({
      where: { id: docId },
      data: {
        embedding_status: "SUCCESS",
        embedding_error: null,
      },
    });
    
  } catch (error) {
    // Database not updated here on job fail, worker handles those
    // Worker will only update to FAILED after all retries are exhausted
    throw error;
  }
}

/**
 * Query similar documents from ChromaDB
 * Used for RAG retrieval during chat
 */
export async function querySimilarDocuments(
  courseId: string,
  query: string,
  topK: number = 5
): Promise<{ text: string; metadata: any; distance: number }[]> {
  try {
    const collection = await getOrCreateCourseCollection(courseId);
    
    // Generate embedding for the query
    const { embedText } = await import("@/lib/embeddings");
    const queryEmbedding = await embedText(query);
    
    // Query ChromaDB for similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });
    
    // Format results
    const documents = results.documents[0] || [];
    const metadatas = results.metadatas[0] || [];
    const distances = results.distances?.[0] || [];
    
    return documents.map((text, index) => ({
      text: text || "",
      metadata: metadatas[index] || {},
      distance: distances[index] || 0,
    }));
  } catch (error) {
    throw error;
  }
}
