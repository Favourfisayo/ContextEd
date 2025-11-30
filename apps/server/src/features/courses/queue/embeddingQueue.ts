import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const embeddingQueue = new Queue("embeddingQueue", {
  connection: redisConnection,
});
