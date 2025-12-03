import { loadAndSplitDocument } from "./documentLoader";
import { embedDocuments } from "@/lib/embeddings";
import { getOrCreateCourseCollection } from "@/lib/chroma";
import prisma from "@studyRAG/db";
import { DocumentProcessingError } from "@/lib/errors";
import { emitEmbeddingUpdate } from "./embeddingEvents";

const BATCH_SIZE = 20;
const THROTTLE_MS = 100;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

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
  docId: string,
  onProgress?: (progress: number) => Promise<void>
): Promise<void> {
  try {
    // Step 1: Load and split document
    const documents = await loadAndSplitDocument(fileUrl, async (ocrProgress) => {
      // Emit OCR progress
      try {
        await emitEmbeddingUpdate({
          courseId,
          docId,
          status: "active",
          stage: "ocr",
          progress: ocrProgress,
        });
      } catch (_err) {
        // Silent failure
    }
    });
    
    if (documents.length === 0) {
      throw new DocumentProcessingError("No content extracted from document", { fileUrl, docId });
    }
    
    const collection = await getOrCreateCourseCollection(courseId);
    const totalChunks = documents.length;
    let processedChunks = 0;

    // Process in batches
    for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      
      // Checkpointing: Filter out chunks that are already embedded
      const itemsToProcess: { doc: any, id: string, originalIdx: number }[] = [];
      const candidateIds = batch.map((_, idx) => `${docId}_chunk_${i + idx}`);
      
      try {
        const existing = await collection.get({ ids: candidateIds });
        const existingIds = new Set(existing.ids);
        
        batch.forEach((doc, idx) => {
           const id = `${docId}_chunk_${i + idx}`;
           if (!existingIds.has(id)) {
             itemsToProcess.push({ doc, id, originalIdx: idx });
           }
        });
        
        if (itemsToProcess.length === 0) {
           processedChunks += batch.length;
           continue;
        }
        
        if (itemsToProcess.length < batch.length) {
           // Partial batch processing
        }
      } catch (_err) {
         // Fallback to processing everything
         batch.forEach((doc, idx) => itemsToProcess.push({ doc, id: `${docId}_chunk_${i + idx}`, originalIdx: idx }));
      }

      const texts = itemsToProcess.map((item) => item.doc.pageContent);

      // Step 2: Generate embeddings with retry
      const embeddingsArray = await retryWithBackoff(() => embedDocuments(texts));
      
      // Filter out invalid embeddings (empty arrays)
      const validEmbeddings: number[][] = [];
      const validTexts: string[] = [];
      const validIds: string[] = [];
      const validMetadatas: any[] = [];

      embeddingsArray.forEach((emb, idx) => {
        if (Array.isArray(emb) && emb.length > 0 && texts[idx]) {
          const item = itemsToProcess[idx];
          if(item) {
          validEmbeddings.push(emb);
          validTexts.push(texts[idx]);
          validIds.push(item.id);
          
          // Metadata construction
          const sanitizedMetadata: Record<string, any> = {
            doc_id: docId,
            course_id: courseId,
            chunk_index: i + item.originalIdx,
            source: fileUrl,
          };
          
          if (item.doc?.metadata) {
             Object.entries(item.doc.metadata).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                   sanitizedMetadata[key] = value;
                } else if (value !== undefined) {
                   sanitizedMetadata[key] = String(value);
                }
             });
          }
          validMetadatas.push(sanitizedMetadata);
        }
      }
      });

      if (validEmbeddings.length === 0) {
        processedChunks += batch.length;
        continue;
      }
      
      // Step 3: Store in ChromaDB with retry
      await retryWithBackoff(() => collection.add({
        ids: validIds,
        embeddings: validEmbeddings,
        documents: validTexts,
        metadatas: validMetadatas,
      }));

      processedChunks += batch.length;
      const progress = Math.round((processedChunks / totalChunks) * 100);

      // Emit progress (swallow errors to prevent job failure)
      try {
        await emitEmbeddingUpdate({
          courseId,
          docId,
          status: "active",
          stage: "embedding",
          progress,
        });

        if (onProgress) {
          await onProgress(progress);
        }
      } catch (_progressError) {
        // Silent failure
      }

      // Throttle to prevent rate limits
      if (i + BATCH_SIZE < totalChunks) {
        await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS));
      }
    }
    
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
