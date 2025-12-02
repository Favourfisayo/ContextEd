import { useQuery } from "@tanstack/react-query";
import { getSession, getCurrentUser} from "./api";
import { type Session } from "@/lib/auth-client";

/**
 * React Query hook to get current session
 */
export function useSession() {
	return useQuery<Session | null>({
		queryKey: ["session"],
		queryFn: () => getSession(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
		retry: 1,
	});
}

/**
 * React Query hook to get current user
 */
export function useCurrentUser() {
	return useQuery<Session["user"] | null>({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
		retry: 1,
	});
}
