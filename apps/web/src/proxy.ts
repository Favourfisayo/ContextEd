import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy (middleware)
 * 
 * IMPORTANT: With a cross-origin auth setup (frontend on Vercel, backend on Fly.io),
 * session cookies are set on the backend domain and NOT accessible in middleware
 * when the request comes to the frontend domain.
 * 
 * The actual auth protection happens in pages/components via the useSession() hook,
 * which makes a client-side request to the backend where cookies ARE available.
 * 
 * This proxy handles minimal routing logic that doesn't require auth state.
 */
export async function proxy() {
	// For cross-origin setups, we let requests through and handle auth
	// in the actual pages/components using useSession() hook
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/auth/sign-in"],
};
