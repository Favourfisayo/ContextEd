import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInWithGoogle, signOut } from "./api";
import { toast } from "sonner";
/**
 * React Query mutation hook for signing out
 */
export function useSignOut() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			// Clear all cached data on sign out
			queryClient.clear();
		},
	});
}

export function useSignIn() {
	return useMutation({
		mutationFn: signInWithGoogle,
	});
}
