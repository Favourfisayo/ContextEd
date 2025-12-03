import { Router, type Response } from "express";
import { requireAuth } from "@/features/auth/middleware/requireAuth";
import { SendMessageSchema } from "@studyrag/shared-schemas";
import {
  getChatMessages,
  verifyCourseAccess,
  getCourseWithDocuments,
} from "../db/queries";
import { saveMessages } from "../db/mutations";
import {
  retrieveContext,
  buildPrompt,
  generateStreamingResponse,
  summarizeOldMessages,
} from "../lib/chatService";
import { refineQuery } from "../lib/queryRefiner";
import { ExternalAPIError, UnauthorizedError, ValidationError, ForbiddenError, asyncHandler } from "@/lib/errors";
import rateLimit from "express-rate-limit";

const router: Router = Router();

/**
 * GET /chat/:courseId/messages
 * Retrieve all chat messages for a course
 */
router.get("/chat/:courseId/messages", requireAuth, asyncHandler(async (req, res: Response) => {
    const { courseId } = req.params;
    const { session } = res.locals;

    if (!session?.user?.id || !courseId) {
      throw new UnauthorizedError("Unauthorized");
    }

    // Verify course access
    const hasAccess = await verifyCourseAccess(courseId, session.user.id);
    if (!hasAccess) {
      throw new ForbiddenError("You do not have access to this course");
    }

    // Fetch messages
    const messages = await getChatMessages(courseId);

    return res.json({
      success: true,
      data: {
        messages,
        total: messages.length,
      },
    });
}));

const streamLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
		success: false,
		error: {
			message: "Too many requests from this IP, please try again later.",
			code: 'RATE_LIMIT_EXCEEDED',
		}
	},
});

/**
 * POST /chat/:courseId/messages
 * Send a message and stream AI response
 */
router.post("/chat/:courseId/messages", streamLimiter, requireAuth, asyncHandler(async (req, res: Response) => {
    const { courseId } = req.params;
    const { session } = res.locals;
    if (!session?.user?.id || !courseId) {
      throw new UnauthorizedError("Unauthorized")
    }

    // Validate request body
    const validation = SendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request")
    }

    const { message: userMessage, mode } = validation.data;

    // Verify course access
    const hasAccess = await verifyCourseAccess(courseId, session.user.id);
    if (!hasAccess) {
      throw new ForbiddenError("You do not have access to this course")
    }

    // Check if embeddings are ready
    const course = await getCourseWithDocuments(courseId);
    if (!course) {
      throw new ExternalAPIError("Embeddings not ready", "EMBEDDING_SERVICE")
    }

    // const allEmbeddingsReady = course.course_documents.every(
    //   (doc: { embedding_status: string }) => doc.embedding_status === "SUCCESS"
    // );

    // if (!allEmbeddingsReady) {
    //   throw new BadRequestError("Embedding status not ready")
    // }

    // Set up Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let fullResponse = "";

    try {
      // Step 1: Retrieve chat history and summarize if needed
      const chatHistory = await getChatMessages(courseId);
      const formattedHistory = await summarizeOldMessages(chatHistory, 10);

      // Step 2: Refine query and retrieve relevant context
      const refinedQuery = await refineQuery(formattedHistory, userMessage);
      const context = await retrieveContext(courseId, refinedQuery, 5);

      // Step 3: Build prompt
      const course_metadata = {course_code: course.course_code, course_title: course.course_title, course_description: course.course_description}
      const prompt = buildPrompt(mode, context, formattedHistory, userMessage, course_metadata);

      // Step 4: Stream response
      const responseGenerator = generateStreamingResponse(prompt);

      for await (const token of responseGenerator) {
        fullResponse += token;
        
        // Send token as SSE event
        res.write(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: "done", content: fullResponse })}\n\n`);

      // Step 5: Save messages to database
      await saveMessages(courseId, session.user.id, userMessage, fullResponse);

      res.end();
    } catch (error) {
      // Send error event
      res.write(
        `data: ${JSON.stringify({ 
          type: "error", 
          error,
          message: "Failed to generate response. Please try again." 
        })}\n\n`
      );
      res.end();
    }
}));

export default router;
