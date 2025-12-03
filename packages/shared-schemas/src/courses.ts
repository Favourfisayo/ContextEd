import { z } from "zod";

/**
 * Shared validation schema for course creation
 * Used by both backend and frontend
 */
export const courseCreateSchema: z.ZodObject<{
  course_title: z.ZodString;
  course_code: z.ZodString;
  course_description: z.ZodOptional<z.ZodString>;
}> = z.object({
  course_title: z.string().min(1, "Course title is required"),
  course_code: z.string().min(1, "Course code is required"),
  course_description: z.string().optional(),
});

/**
 * Shared validation schema for course update
 * All fields are optional to allow partial updates
 */
export const courseUpdateSchema: z.ZodObject<{
  course_title: z.ZodOptional<z.ZodString>;
  course_code: z.ZodOptional<z.ZodString>;
  course_description: z.ZodOptional<z.ZodString>;
}> = z.object({
  course_title: z.string().min(1, "Course title is required").optional(),
  course_code: z.string().min(1, "Course code is required").optional(),
  course_description: z.string().optional(),
});

/**
 * Shared validation schema for course document creation
 * Accepts array of file metadata from UploadThing
 */
export const courseDocCreateSchema: z.ZodObject<{
  course_id: z.ZodString;
  documents: z.ZodArray<z.ZodObject<{
    file_url: z.ZodString;
    file_metadata: z.ZodObject<{
      name: z.ZodString;
      size: z.ZodNumber;
      type: z.ZodString;
      key: z.ZodString;
    }>;
  }>>;
}> = z.object({
  course_id: z.string().uuid("Invalid course ID"),
  documents: z.array(
    z.object({
      file_url: z.string().url("Invalid file URL"),
      file_metadata: z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        key: z.string(),
      }),
    })
  ).min(1, "At least one document is required"),
});

export interface EmbeddingJobStatus {
  docId: string;
  fileUrl: string;
  status: "waiting" | "active" | "completed" | "failed" | "unknown";
  progress?: number;
  stage?: "ocr" | "embedding";
  error?: string;
  embeddingStatus: "PENDING" | "SUCCESS" | "FAILED";
}
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type CourseDocCreateInput = z.infer<typeof courseDocCreateSchema>;
