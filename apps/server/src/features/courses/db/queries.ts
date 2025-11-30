import prisma from "@studyRAG/db";
import { type Session } from "@auth/express";
import { embeddingQueue } from "../queue/embeddingQueue";
import { type EmbeddingJobStatus } from "@studyrag/shared-schemas";
import { UnauthorizedError, NotFoundError, AppError } from "@/lib/errors";

export async function getCourses(session: Session) {
	if (!session.user?.id) {
		throw new UnauthorizedError("User ID not found in session");
	}

	const courses = await prisma.course.findMany({
		where: {
			user_id: session.user.id,
		},
		orderBy: {
			created_at: "desc",
		},
    include: {
      course_documents: true
    }
	});

	return courses;
}

export async function getCourse(session: Session, courseId: string) {
	if (!session.user?.id) {
		throw new UnauthorizedError("User ID not found in session");
	}

	const course = await prisma.course.findFirst({
		where: {
			id: courseId,
			user_id: session.user.id,
		},
		include: {
			course_documents: true,
		},
	});

	if (!course) {
		throw new NotFoundError("Course not found or unauthorized");
	}

	return course;
}

/**
 * Get embedding status for all documents in a course
 */
export async function getCourseEmbeddingStatus(courseId: string): Promise<{
  documents: EmbeddingJobStatus[];
  allCompleted: boolean;
  hasFailed: boolean;
}> {
  // Get all course documents
  const courseDocs = await prisma.courseDoc.findMany({
    where: { course_id: courseId },
    select: {
      id: true,
      file_url: true,
      job_id: true,
      embedding_status: true,
      embedding_error: true,
    },
  });

  const statuses: EmbeddingJobStatus[] = [];

  for (const doc of courseDocs) {
    let jobStatus: "waiting" | "active" | "completed" | "failed" | "unknown" = "unknown";
    let progress: number | undefined;

    // Prioritize database status over BullMQ status
    // Database is source of truth after job completes/fails
    if (doc.embedding_status === "SUCCESS") {
      jobStatus = "completed";
    } else if (doc.embedding_status === "FAILED") {
      jobStatus = "failed";
    } else if (doc.job_id) {
      // Only check BullMQ if still PENDING in database
      try {
        const job = await embeddingQueue.getJob(doc.job_id);
        
        if (job) {
          const state = await job.getState();
          jobStatus = state as typeof jobStatus;
          progress = job.progress as number | undefined;
          
          // If job is failed in BullMQ but DB shows PENDING, check retry count
          if (state === "failed") {
            const attemptsMade = job.attemptsMade;
            const maxAttempts = job.opts?.attempts || 1;
            
            // Only show as failed if all retries exhausted
            if (attemptsMade >= maxAttempts) {
              jobStatus = "failed";
            } else {
              // Still retrying, show as waiting
              jobStatus = "waiting";
            }
          }
        }
      } catch (error) {
        throw error
      }
    }

    statuses.push({
      docId: doc.id,
      fileUrl: doc.file_url,
      status: jobStatus,
      progress,
      error: doc.embedding_error || undefined,
      embeddingStatus: doc.embedding_status,
    });
  }

  const allCompleted = statuses.every(
    (s) => s.embeddingStatus === "SUCCESS" || s.status === "completed"
  );
  const hasFailed = statuses.some(
    (s) => s.embeddingStatus === "FAILED" || s.status === "failed"
  );

  return {
    documents: statuses,
    allCompleted,
    hasFailed,
  };
}

/**
 * Retry failed embedding job
 */
export async function retryFailedEmbedding(docId: string): Promise<string> {
  const doc = await prisma.courseDoc.findUnique({
    where: { id: docId },
    select: {
      id: true,
      course_id: true,
      file_url: true,
      job_id: true,
    },
  });

  if (!doc) {
    throw new NotFoundError("Document not found")
  }

  // Remove old job if it exists
  if (doc.job_id) {
    try {
      const oldJob = await embeddingQueue.getJob(doc.job_id);
      if (oldJob) {
        await oldJob.remove();
      }
    } catch (error) {
      throw new AppError(`Error removing old job ${doc.job_id}: ${error}`)
    }
  }

  // Reset status to PENDING
  await prisma.courseDoc.update({
    where: { id: docId },
    data: {
      embedding_status: "PENDING",
      embedding_error: null,
      job_id: null,
    },
  });

  // Create new job
  const job = await embeddingQueue.add(
    "buildEmbedding",
    { courseId: doc.course_id, fileUrl: doc.file_url, docId: doc.id },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    }
  );

  // Update with new job ID
  await prisma.courseDoc.update({
    where: { id: docId },
    data: { job_id: job.id || null },
  });

  return job.id || "";
}
