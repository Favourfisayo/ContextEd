import prisma from "@studyRAG/db";

/**
 * Save a user message and assistant response to the database
 */
export async function saveMessages(
  courseId: string,
  userId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  await prisma.message.createMany({
    data: [
      {
        course_id: courseId,
        user_id: userId,
        role: "USER",
        message: userMessage,
      },
      {
        course_id: courseId,
        user_id: userId,
        role: "ASSISTANT",
        message: assistantMessage,
      },
    ],
  });
}

/**
 * Save a single message (used for partial saves if needed)
 */
export async function saveSingleMessage(
  courseId: string,
  userId: string,
  role: "USER" | "ASSISTANT",
  message: string
): Promise<void> {
  await prisma.message.create({
    data: {
      course_id: courseId,
      user_id: userId,
      role,
      message,
    },
  });
}
