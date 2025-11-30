import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./features/auth/lib/api";

// Define which routes require authentication
const protectedRoutes = ["/dashboard"];

// Define public routes that should redirect to dashboard if authenticated
const authRoutes = ["/auth/sign-in"];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if route requires protection
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// Get session
	const session = await getSession(`authjs.session-token=${request.cookies.get("authjs.session-token")?.value}`);
	
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

// Configure which routes should be processed by this middleware
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
