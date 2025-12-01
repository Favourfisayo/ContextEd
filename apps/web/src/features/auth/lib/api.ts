import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL
export interface User {
	id?: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
}

export interface Session {
	user?: User;
	expires: string;
}

/**
 * Get the current session from the backend
 * @param cookieHeader - Optional cookie header for server-side contexts
 */
export async function getSession(cookieHeader?: string): Promise<Session | null> {
	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		if (cookieHeader) {
			headers["Cookie"] = cookieHeader;
		}

		const response = await fetch(`${API_URL}/auth/session`, {
			method: "GET",
			credentials: cookieHeader ? "omit" : "include",
			headers,
		});
		if (!response.ok) {
			return null;
		}

		const session: Session = await response.json();
		return session || null;
	} catch (error) {
		console.error(`SessionError: ${error}`)
		return null;
	}
}

/**
 * Get CSRF token for sign out
 */
export async function getCsrfToken(): Promise<string | null> {
	try {
		const response = await fetch(`${API_URL}/auth/csrf`, {
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.csrfToken || null;
	} catch (error) {
		toast.error(`Error getting auth token: ${error}`)
		return null;
	}
}

/**
 * Sign in with Google OAuth # TODO: Replace approach with actual sending to auth endpoints on our express server
 */
export function signInWithGoogle() {
	window.location.href = `${API_URL}/auth/signin`;
}

/**
 * Sign out # TODO: Replace approach with actual sending to auth endpoints on our express server
 */
export async function signOut() {
	window.location.href = `${API_URL}/auth/signout`
}

/**
 * Get current user from custom endpoint
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		const response = await fetch(`${API_URL}/api/me`, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.user || null;
	} catch (error) {
		toast.error(`User fetch error: ${error}`)
		return null;
	}
}
