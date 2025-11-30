import prisma from "@studyrag/db";

/**
 * Retrieve all chat messages for a specific course
 * Ordered by creation time (oldest first)
 */
export async function getChatMessages(courseId: string) {
  return await prisma.message.findMany({
    where: {
      course_id: courseId,
    },
    orderBy: {
      created_at: "asc",
    },
  });
}

/**
 * Get the count of messages for a course
 */
export async function getChatMessageCount(courseId: string): Promise<number> {
  return await prisma.message.count({
    where: {
      course_id: courseId,
    },
  });
}

/**
 * Check if a course exists and belongs to the user
 */
export async function verifyCourseAccess(
  courseId: string,
  userId: string
): Promise<boolean> {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      user_id: userId,
    },
  });
  return course !== null;
}

/**
 * Get course with embedding status for all documents
 */
export async function getCourseWithDocuments(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      course_documents: {
        select: {
          id: true,
          embedding_status: true,
        },
      },
    },
  });
}
