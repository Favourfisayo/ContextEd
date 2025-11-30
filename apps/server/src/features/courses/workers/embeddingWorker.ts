import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { buildEmbeddingsForDocument } from "../lib/embeddingService";
import prisma from "@studyRAG/db";
import { emitEmbeddingUpdate } from "../lib/embeddingEvents";
import { NotFoundError } from "@/lib/errors";

export const embeddingWorker = new Worker(
  "embeddingQueue",
  async (job) => {

    const { courseId, fileUrl, docId } = job.data;

    try {
      // Find the document in the database
      const courseDoc = await prisma.courseDoc.findFirst({
        where: {
          course_id: courseId,
          file_url: fileUrl,
        },
      });

      if (!courseDoc) {
        throw new NotFoundError(`Document not found: ${fileUrl} for course ${courseId}`);
      }

      // Build embeddings for the document
      await buildEmbeddingsForDocument(courseId, fileUrl, courseDoc.id);

      return { 
        status: "completed", 
        courseId, 
        fileUrl,
        docId: courseDoc.id,
      };
    } catch (error) {
      const attemptsMade = job.attemptsMade + 1;
      const maxAttempts = job.opts?.attempts || 1;
      const isLastAttempt = attemptsMade >= maxAttempts;
    
      
      // Only update DB to FAILED if this is the last attempt
      if (isLastAttempt && docId) {
        await prisma.courseDoc.update({
          where: { id: docId },
          data: {
            embedding_status: "FAILED",
            embedding_error: error instanceof Error ? error.message : String(error),
          },
        });
      }
      
      throw error; // Re-throw to mark job as failed in BullMQ
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // per 1 second
    },
  }
);

// Event handlers for monitoring
embeddingWorker.on("active", (job) => {
  // Emit active status on first attempt or retries
  if (job.data.courseId && job.data.docId) {
    emitEmbeddingUpdate({
      courseId: job.data.courseId,
      docId: job.data.docId,
      status: "active",
    });
  }
});

embeddingWorker.on("completed", (job) => {

  // Emit real-time update
  if (job.data.courseId && job.data.docId) {
    emitEmbeddingUpdate({
      courseId: job.data.courseId,
      docId: job.data.docId,
      status: "completed",
    });
  }
});

embeddingWorker.on("failed", async (job, err) => {
  if (!job) return;
  
  const attemptsMade = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 1;
  const isLastAttempt = attemptsMade >= maxAttempts;
  
  // Only emit final failure after all retries exhausted
  if (isLastAttempt && job.data.courseId && job.data.docId) {
  
    emitEmbeddingUpdate({
      courseId: job.data.courseId,
      docId: job.data.docId,
      status: "failed",
      error: err.message,
    });
  }
});

embeddingWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

embeddingWorker.on("stalled", (jobId) => {
  console.warn(`Job ${jobId} has stalled`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await embeddingWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...");
  await embeddingWorker.close();
  process.exit(0);
});

console.log("Embedding worker has started and waiting for jobs...");
