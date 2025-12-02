import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./features/auth/lib/api";

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

	// Get session
	const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
	const cookieHeader = sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : undefined;
	
	const session = await getSession(cookieHeader);
	
	// Redirect to sign-in if accessing protected route without session
	if (isProtectedRoute && !session) {
		const signInUrl = new URL("/auth/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Redirect to dashboard if accessing auth routes with valid session
	if (isAuthRoute && session) {
		return NextResponse.redirect(new URL("/dashboard/courses", request.url));
	}

	return NextResponse.next();
}


export const config = {
	matcher: ["/dashboard/:path*", "/auth/sign-in"],
};
