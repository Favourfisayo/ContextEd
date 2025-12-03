import { redis_client } from "@/lib/redis";
import { InternalServerError } from "@/lib/errors";

export interface EmbeddingJobUpdate {
  courseId: string;
  docId: string;
  status: "waiting" | "active" | "completed" | "failed";
  stage?: "ocr" | "embedding";
  error?: string;
  progress?: number;
}

/**
 * Emit an embedding job update via Redis Pub/Sub
 * This works across separate processes (server + worker)
 */
export async function emitEmbeddingUpdate(update: EmbeddingJobUpdate) {
  const channel = `course:${update.courseId}:embeddings`;
  const message = JSON.stringify(update);
  
  await redis_client.publish(channel, message); // we are using Redis to send events between the main server and the worker because they are separate processes.
}

/**
 * Subscribe to embedding updates for a specific course via Redis Pub/Sub
 */
export function subscribeToEmbeddingUpdates(
  courseId: string,
  callback: (update: EmbeddingJobUpdate) => void
) {
  const channel = `course:${courseId}:embeddings`;
  
  // Create a subscriber connection (separate from the main connection)
  const subscriber = redis_client.duplicate();
  
  
  subscriber.subscribe(channel).then(() => {})
  .catch((err: Error) => {
    throw new InternalServerError(`Failed to subscribe to ${channel}: ${err.message}`);
  });
  
  subscriber.on("message", (receivedChannel: string, message: string) => {
    if (receivedChannel === channel) {
      try {
        const update = JSON.parse(message) as EmbeddingJobUpdate;
        callback(update);
      } catch (error) {
        throw new InternalServerError(`Failed to parse Redis message: ${error}`);
      }
    }
  });
  
  // Return cleanup function
  return () => {
    subscriber.unsubscribe(channel);
    subscriber.quit();
  };
}
