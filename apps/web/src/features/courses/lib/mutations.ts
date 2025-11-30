import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourse,
  updateCourse,
  createCourseDocuments,
  deleteCourse,
} from "./api";
import type { CourseUpdateInput } from "@studyrag/shared-schemas";

/**
 * Hook to create a new course
 */

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      // Invalidate courses list to refetch after creation
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

/**
 * Hook to update an existing course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, input }: { courseId: string; input: CourseUpdateInput }) =>
      updateCourse(courseId, input),
    onSuccess: (data) => {
      // Invalidate both list and single course queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", data.id] });
    },
  });
}

/**
 * Hook to create course documents
 */
export function useCreateCourseDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourseDocuments,
    onSuccess: (_data, variables) => {
      // Invalidate the specific course to refetch with new documents
      queryClient.invalidateQueries({ queryKey: ["course", variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}


export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    }
  })
}