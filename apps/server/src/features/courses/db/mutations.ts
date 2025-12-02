import prisma from "@studyRAG/db";
import { type Session } from "@/features/auth/lib/session";
import type { Request } from "express";
import { courseCreateSchema, courseUpdateSchema, courseDocCreateSchema } from "@studyrag/shared-schemas";
import { embeddingQueue } from "../queue/embeddingQueue";
import { ValidationError, UnauthorizedError, NotFoundError, ConflictError } from "@/lib/errors";
import { utapi } from "@/lib/uploadthing";
import { getCourse } from "./queries";
import { deleteCourseCollection } from "@/lib/chroma";

export async function createCourse(req: Request, session: Session) {
	const course_data = req.body;

	const validatedData = courseCreateSchema.safeParse(course_data);

	if (!validatedData.success) {
		const errors = validatedData.error.flatten();
		throw new ValidationError("Validation failed", errors);
	}

	const { course_code, course_title, course_description } = validatedData.data;

	if (!session.user?.id) {
		throw new UnauthorizedError("User ID not found in session");
	}

	const existingCourse = await prisma.course.findFirst({
		where: {
			user_id: session.user.id,
			course_code: course_code.trim()
		}
	})

	if (existingCourse) {
		throw new ConflictError("You cannot create the same course twice", "DUPLICATE_COURSE");
	}

	const course = await prisma.course.create({
		data: {
			course_code,
			course_title,
			course_description,
			created_by: {
				connect: {
					id: session.user.id,
				},
			},
		},
	});

	return course;
}

export async function updateCourse(req: Request, session: Session, courseId: string) {
	const course_data = req.body;

	const validatedData = courseUpdateSchema.safeParse(course_data);

	if (!validatedData.success) {
		const errors = validatedData.error.flatten();
		throw new ValidationError("Validation failed", errors);
	}

	if (!session.user?.id) {
		throw new UnauthorizedError("User ID not found in session");
	}

	// Verify the course belongs to the user
	const existingCourse = await prisma.course.findFirst({
		where: {
			id: courseId,
			user_id: session.user.id,
		},
	});

	if (!existingCourse) {
		throw new NotFoundError("Course not found or unauthorized");
	}

	const course = await prisma.course.update({
		where: { id: courseId },
		data: validatedData.data,
	});

	return course;
}

export async function createCourseDocuments(req: Request, session: Session) {
	const doc_data = req.body;

	const validatedData = courseDocCreateSchema.safeParse(doc_data);

	if (!validatedData.success) {
		const errors = validatedData.error.flatten();
		throw new ValidationError("Validation failed", errors);
	}

	if (!session.user?.id) {
		throw new UnauthorizedError("User ID not found in session");
	}

	const { course_id, documents } = validatedData.data;

	// Verify the course belongs to the user
	const course = await prisma.course.findFirst({
		where: {
			id: course_id,
			user_id: session.user.id,
		},
	});
	if (!course || !documents) {
		throw new NotFoundError("Course/Documents not found or unauthorized");
	}

	// Create all course documents
	const courseDocuments = await prisma.courseDoc.createMany({
		data: documents.map((doc) => ({
			file_url: doc.file_url,
			file_metadata: doc.file_metadata,
			course_id: course_id,
		})),
	});
	return { success: true, count: courseDocuments.count, data: {course_id, documents}};
}

export async function enqueueEmbeddingJob(courseId: string, fileUrl: string, docId: string) {
  const job = await embeddingQueue.add("buildEmbedding", 
	{ courseId, fileUrl, docId },
	{
	attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500,     // Keep last 500 failed jobs
	}
);

  // Store job ID in database for status tracking
  await prisma.courseDoc.update({
    where: { id: docId },
    data: { job_id: job.id },
  });

  return job.id;
}


async function deleteCourseFilesFromStorage(fileKeys: string[]) {
	if (fileKeys.length === 0) return;
	try {
		await utapi.deleteFiles(fileKeys);
	} catch (error) {
		console.error(error)
		// We don't throw here to allow the process to continue if files are already gone or inaccessible
		// Ideally, we would check for specific "not found" errors
	}
}

type fileMeta = {
	name: string
	size: number
	type: string
	key: string
}

export async function deleteCourse(courseId: string, session: Session) {
	const course = await getCourse(session, courseId)
	const fileKeys = course.course_documents.map(doc => {
		const file_metadata = doc.file_metadata as fileMeta

		return file_metadata.key
	})

	// Execute external cleanups in parallel
	// We attempt to clean up both storage and vector DB before removing the course record
	// This ensures that if cleanup fails, the user can retry the operation
	await Promise.all([
		deleteCourseFilesFromStorage(fileKeys),
		deleteCourseCollection(courseId).catch(() => {
			// We suppress the error to allow the deletion to proceed if the collection is already gone
			// or if there's a temporary issue with the vector DB
		})
	]);

	// Delete from database last - this is the source of truth
	await prisma.course.delete({
		where: {
			id: courseId
		}
	})
}