import { toast } from "sonner";

// Use relative path for API calls to leverage Next.js rewrites
// This ensures cookies are set on the frontend domain
const API_URL = ""; 

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
 * @param baseUrl - Optional base URL for server-side contexts (e.g. http://localhost:3000)
 */
export async function getSession(cookieHeader?: string, baseUrl: string = ""): Promise<Session | null> {
	try {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		if (cookieHeader) {
			headers["Cookie"] = cookieHeader;
		}

		const response = await fetch(`${baseUrl}/auth/session`, {
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
 * Sign in with Google OAuth
 * This triggers the Auth.js signin flow by submitting a form to the backend
 */
export async function signInWithGoogle() {
	// Create a form element
	const form = document.createElement("form");
	form.method = "POST";
	form.action = `${API_URL}/auth/signin/google`; // Use the provider-specific endpoint

	// Add CSRF token input
	const csrfToken = await getCsrfToken();
	if (csrfToken) {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = "csrfToken";
		input.value = csrfToken;
		form.appendChild(input);
	}
	
	document.body.appendChild(form);
	form.submit();
}

/**
 * Sign out
 */
export async function signOut() {
	const form = document.createElement("form");
	form.method = "POST";
	form.action = `${API_URL}/auth/signout`;
	
	// Fetch CSRF token first if needed, but for simple form post, 
	// Auth.js often handles it via the cookie if present.
	// Let's try the direct POST first as per docs.
	const csrfToken = await getCsrfToken();
	if (csrfToken) {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = "csrfToken";
		input.value = csrfToken;
		form.appendChild(input);
	}

	document.body.appendChild(form);
	form.submit();
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
