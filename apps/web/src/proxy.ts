import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Define which routes require authentication
const protectedRoutes = ["/dashboard"];

// Define public routes that should redirect to dashboard if authenticated
const authRoutes = ["/auth/sign-in"];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === "/") {
		return NextResponse.next();
	}

	// Check if route requires protection
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(route));

	// Optimistic cookie check - verify session cookie exists
	// Since we are on subdomains (api.context-ed.app and context-ed.app) with a shared root domain cookie,
	// the middleware CAN see the session cookie.
	const sessionCookie = getSessionCookie(request);
	
	// Redirect to sign-in if accessing protected route without session cookie
	if (isProtectedRoute && !sessionCookie) {
		const signInUrl = new URL("/auth/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Redirect to dashboard if accessing auth routes with session cookie
	if (isAuthRoute && sessionCookie) {
		return NextResponse.redirect(new URL("/dashboard/courses", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/auth/sign-in"],
};
