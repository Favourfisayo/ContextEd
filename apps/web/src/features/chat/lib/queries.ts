import { useQuery } from "@tanstack/react-query";
import { getChatMessages } from "./api";

/**
 * Hook to fetch chat messages for a course
 */
export function useChatMessages(courseId: string) {
  return useQuery({
    queryKey: ["chat", courseId],
    queryFn: () => getChatMessages(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch when switching tabs during chat
  });
}
