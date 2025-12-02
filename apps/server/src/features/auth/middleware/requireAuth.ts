import type { Request, Response, NextFunction } from "express";
import { getSession } from "../lib/session";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Middleware to protect routes - redirects to login if not authenticated
 * Use this middleware on routes that require authentication
 */
export async function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const session =
		res.locals.session ?? (await getSession(req));

	if (!session?.user) {
		throw new UnauthorizedError("You must be signed in to access this resource");
	}

	res.locals.session = session;
	next();
}
