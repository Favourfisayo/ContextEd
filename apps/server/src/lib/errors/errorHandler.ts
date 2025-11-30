import type { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import { Prisma } from "@studyRAG/db";
/**
 * Error Response Interface
 */
interface ErrorResponse {
	success: false;
	error: {
		message: string;
		code?: string;
		details?: unknown;
	};
}

/**
 * Check if error is operational (expected) or programming error
 */
function isOperationalError(error: Error): boolean {
	if (error instanceof AppError) {
		return error.isOperational;
	}
	return false;
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): ErrorResponse {
	const details = error.flatten();
	
	return {
		success: false,
		error: {
			message: "Validation failed",
			code: "VALIDATION_ERROR",
			details: details.fieldErrors,
		},
	};
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ErrorResponse {
	switch (error.code) {
		case "P2002":
			// Unique constraint violation
			return {
				success: false,
				error: {
					message: "A record with this value already exists",
					code: "DUPLICATE_RECORD",
					details: error.meta,
				},
			};
		
		case "P2025":
			// Record not found
			return {
				success: false,
				error: {
					message: "Record not found",
					code: "NOT_FOUND",
					details: error.meta,
				},
			};
		
		case "P2003":
			// Foreign key constraint violation
			return {
				success: false,
				error: {
					message: "Invalid reference to related record",
					code: "FOREIGN_KEY_VIOLATION",
					details: error.meta,
				},
			};
		
		default:
			return {
				success: false,
				error: {
					message: "Database operation failed",
					code: "DATABASE_ERROR",
					details: process.env.NODE_ENV === "development" ? error.meta : undefined,
				},
			};
	}
}

/**
 * Global error handler middleware
 */
export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	// Log error for monitoring
	if (!isOperationalError(err)) {
		console.error("Non-operational error:", err);
	} else if (process.env.NODE_ENV === "development") {
		console.error("Operational error:", err.message);
	}

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const response = handleZodError(err);
		res.status(422).json(response);
		return;
	}

	// Handle Prisma errors
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		const response = handlePrismaError(err);
		const statusCode = response.error.code === "NOT_FOUND" ? 404 : 400;
		res.status(statusCode).json(response);
		return;
	}

	// Handle custom AppErrors
	if (err instanceof AppError) {
		const response: ErrorResponse = {
			success: false,
			error: {
				message: err.message,
				code: err.code,
				details: err.details,
				...(process.env.NODE_ENV === "development" && { stack: err.stack }),
			},
		};
		
		res.status(err.statusCode).json(response);
		return;
	}

	// Handle unknown errors (500)
	const response: ErrorResponse = {
		success: false,
		error: {
			message: process.env.NODE_ENV === "production" 
				? "An unexpected error occurred" 
				: err.message,
			code: "INTERNAL_SERVER_ERROR",
			...(process.env.NODE_ENV === "development" && { 
				stack: err.stack,
				details: err 
			}),
		},
	};

	res.status(500).json(response);
}

/**
 * Catch async errors and pass to error handler
 * Wrapper function for async route handlers
 */
export function asyncHandler<T extends Request = Request>(
	fn: (req: T, res: Response, next: NextFunction) => Promise<void | Response>
) {
	return (req: T, res: Response, next: NextFunction): void => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Handle 404 - Route not found
 */
export function notFoundHandler(_req: Request, res: Response): void {
	res.status(404).json({
		success: false,
		error: {
			message: "API Route not found",
			code: "NOT_FOUND",
		},
	});
}
