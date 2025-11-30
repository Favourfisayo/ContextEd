import { useQuery } from "@tanstack/react-query";
import { getCourses, getCourse } from "./api";

/**
 * Hook to fetch all courses
 */
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 5 * 60 * 1000, 
  });
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, 
  });
}
