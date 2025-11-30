import { Router } from "express";
import { requireAuth } from "../features/auth/middleware/requireAuth";
import { createCourse, updateCourse, createCourseDocuments, enqueueEmbeddingJob, deleteCourse } from "@/features/courses/db/mutations";
import { getCourses, getCourse, getCourseEmbeddingStatus, retryFailedEmbedding } from "@/features/courses/db/queries";
import prisma from "@studyRAG/db";
import embeddingEventsRouter from "@/features/courses/routes/embedding-events.routes";
import chatRouter from "@/features/chat/routes/chat.routes";
import { asyncHandler, UnauthorizedError, BadRequestError, NotFoundError } from "@/lib/errors";
import timeout from "connect-timeout"
const router: Router = Router();

// Mount embedding events SSE routes
router.use(embeddingEventsRouter);

// Mount chat routes
router.use(chatRouter);

router.get("/profile", requireAuth, (_req, res) => {
	const { session } = res.locals;
	res.json({
		user: session?.user,
		message: "This is a protected route",
	});
});

// Get all courses for authenticated user
router.get("/courses", requireAuth, asyncHandler(async (_req, res) => {
	const { session } = res.locals;

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to view courses");
	}

	const courses = await getCourses(session);
	
	res.status(200).json({
		success: true,
		data: courses,
	});
}));

// Get single course by ID
router.get("/courses/:id", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals;

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to view this course");
	}

	const courseId = req.params.id;
	if (!courseId) {
		throw new BadRequestError("Course ID is required");
	}

	const course = await getCourse(session, courseId);
	
	res.status(200).json({
		success: true,
		data: course,
	});
}));

// Create new course endpoint
router.post("/courses/new", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals;
	
	if (!session?.user) {	
		throw new UnauthorizedError("You must be authenticated to create a course");
	}
	
	const course = await createCourse(req, session);
	
	res.status(201).json({
		success: true,
		message: "Course created successfully",
		data: course,
	});
}));

// Update existing course endpoint
router.patch("/courses/:id", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals;
	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to update a course");
	}

	const courseId = req.params.id;
	if (!courseId) {
		throw new BadRequestError("Course ID is required");
	}
	
	const course = await updateCourse(req, session, courseId);
	
	res.status(200).json({
		success: true,
		message: "Course updated successfully",
		data: course,
	});
}));

// Create course documents endpoint
router.post("/courses/documents/new", timeout('4m'), requireAuth,  asyncHandler(async (req, res) => {
	const { session } = res.locals;

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to upload course documents");
	}

	const result = await createCourseDocuments(req, session);
	
	if (result.success) {
		// Get the created document IDs from the database
		const createdDocs = await prisma.courseDoc.findMany({
			where: {
				course_id: result.data.course_id,
				file_url: { in: result.data.documents.map(doc => doc.file_url) },
			},
			select: { id: true, file_url: true },
		});

		// Enqueue embedding jobs with document IDs
		for (const doc of createdDocs) {
			await enqueueEmbeddingJob(result.data.course_id, doc.file_url, doc.id);
		}
	}
	
	res.status(201).json({
		success: true,
		message: "Course documents uploaded successfully",
		data: result,
	});
}));

// Delete course from system

router.delete("/courses/:id/delete", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to view embedding status");
	}

	const courseId = req.params.id;
	if (!courseId) {
		throw new BadRequestError("Course ID is required");
	}

	await deleteCourse(courseId, session)

	res.status(200).json({
		success: true,
		message: "Course deleted successfully"
	});
}))


// Get embedding status for a course
router.get("/courses/:id/embedding-status", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals;

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to view embedding status");
	}

	const courseId = req.params.id;
	if (!courseId) {
		throw new BadRequestError("Course ID is required");
	}

	// Verify course belongs to user (getCourse will throw NotFoundError if not found)
	await getCourse(session, courseId);

	const status = await getCourseEmbeddingStatus(courseId);

	res.status(200).json({
		success: true,
		data: status,
	});
}));

// Retry failed embedding for a document
router.post("/courses/documents/:docId/retry", requireAuth, asyncHandler(async (req, res) => {
	const { session } = res.locals;

	if (!session?.user) {
		throw new UnauthorizedError("You must be authenticated to retry embeddings");
	}

	const docId = req.params.docId;
	if (!docId) {
		throw new BadRequestError("Document ID is required");
	}

	// Verify document belongs to user's course
	const doc = await prisma.courseDoc.findUnique({
		where: { id: docId },
		include: { course: true },
	});

	if (!doc || doc.course.user_id !== session.user.id) {
		throw new NotFoundError("Document not found or unauthorized");
	}

	const jobId = await retryFailedEmbedding(docId);

	res.status(200).json({
		success: true,
		message: "Embedding job restarted",
		data: { jobId },
	});
}));

export default router;
