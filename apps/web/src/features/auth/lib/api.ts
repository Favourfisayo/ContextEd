import { authClient, type Session } from "@/lib/auth-client";
import { toast } from "sonner";
/**
 * Get the current session from the backend
 */
export async function getSession(cookieHeader?: string, baseUrl: string = ""): Promise<Session | null> {
	try {
		const { data: session } = await authClient.getSession({
			fetchOptions: {
				headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
			},
		});
		return session as unknown as Session | null;
	} catch (error) {
		console.error(`SessionError: ${error}`)
		return null;
	}
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
	try{
	await authClient.signIn.social({
		provider: "google",
		callbackURL: `${window.location.origin}/dashboard/courses`,
	});
	}catch(error) {
		toast.error(`Error sigining in: ${error}`)
	}
}

/**
 * Sign out
 */
export async function signOut() {
	await authClient.signOut({
		fetchOptions: {
			onSuccess: () => {
				window.location.href = "/auth/sign-in"
			}
		}
	});
}

/**
 * Get current user from custom endpoint
 */
export async function getCurrentUser(): Promise<Session["user"] | null> {
	const session = await getSession();
	return session?.user || null;
}
