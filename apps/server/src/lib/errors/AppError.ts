/**
 * Base Application Error Class
 * All custom errors should extend this class
 */
export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly code?: string;
	public readonly details?: unknown;

	constructor(
		message: string,
		statusCode: number = 500,
		code?: string,
		details?: unknown,
		isOperational: boolean = true
	) {
		super(message);
		
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
		
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.code = code;
		this.details = details;
	}
}

/**
 * 400 Bad Request - Client sent invalid data
 */
export class BadRequestError extends AppError {
	constructor(message: string = "Bad Request", code?: string, details?: unknown) {
		super(message, 400, code || "BAD_REQUEST", details);
	}
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized", code?: string, details?: unknown) {
		super(message, 401, code || "UNAUTHORIZED", details);
	}
}

/**
 * 403 Forbidden - User doesn't have permission
 */
export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden", code?: string, details?: unknown) {
		super(message, 403, code || "FORBIDDEN", details);
	}
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found", code?: string, details?: unknown) {
		super(message, 404, code || "NOT_FOUND", details);
	}
}

/**
 * 409 Conflict - Resource already exists or conflict with current state
 */
export class ConflictError extends AppError {
	constructor(message: string = "Conflict", code?: string, details?: unknown) {
		super(message, 409, code || "CONFLICT", details);
	}
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details?: unknown) {
		super(message, 422, "VALIDATION_ERROR", details);
	}
}

/**
 * 408 Timeout Error 
 */

export class TimeOutError extends AppError {
	constructor(message: string = "Timeout Error", code?: string, details?: unknown) {
		super(message, 408, code || "TIMEOUT_ERROR", details);
	}
}

/**
 * 500 Internal Server Error - Something went wrong on the server
 */
export class InternalServerError extends AppError {
	constructor(message: string = "Internal Server Error", code?: string, details?: unknown) {
		super(message, 500, code || "INTERNAL_SERVER_ERROR", details, false);
	}
}

/**
 * 503 Service Unavailable - External service is down
 */
export class ServiceUnavailableError extends AppError {
	constructor(message: string = "Service Unavailable", code?: string, details?: unknown) {
		super(message, 503, code || "SERVICE_UNAVAILABLE", details);
	}
}

/**
 * Custom errors for specific domains
 */

export class EmbeddingError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 500, "EMBEDDING_ERROR", details);
	}
}

export class DocumentProcessingError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 500, "DOCUMENT_PROCESSING_ERROR", details);
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 500, "DATABASE_ERROR", details, false);
	}
}

export class ExternalAPIError extends AppError {
	constructor(message: string, service: string, details?: unknown) {
		const combinedDetails = details && typeof details === 'object' 
			? { service, ...details as Record<string, unknown> }
			: { service, additionalInfo: details };
		super(message, 502, "EXTERNAL_API_ERROR", combinedDetails);
	}
}