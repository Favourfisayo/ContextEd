import { Router, type Response } from "express";
import { requireAuth } from "@/features/auth/middleware/requireAuth";
import { subscribeToEmbeddingUpdates, type EmbeddingJobUpdate } from "../lib/embeddingEvents";
import { UnauthorizedError } from "@/lib/errors";

const router: Router = Router();

/**
 * Server-Sent Events endpoint for real-time embedding status updates
 * Clients connect once and receive updates as they happen
 */
router.get("/courses/:id/embedding-events", requireAuth, (req, res: Response) => {
  const { id: courseId } = req.params;
  const { session } = res.locals;


  if (!session?.user || !courseId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for nginx

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", courseId })}\n\n`);

  // Subscribe to embedding updates for this course
  const unsubscribe = subscribeToEmbeddingUpdates(courseId, (update: EmbeddingJobUpdate) => {
    res.write(`data: ${JSON.stringify({ type: "update", ...update })}\n\n`);
  });

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`);
  }, 30000);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

export default router;
