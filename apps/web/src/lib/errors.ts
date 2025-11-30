/**
 * Standard API Error Response from the server
 */
export interface ApiErrorResponse {
	success: false;
	error: {
		message: string;
		code?: string;
		details?: unknown;
	};
}

/**
 * Custom API Error class
 * Thrown when API requests fail with structured error responses
 */
export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly code?: string;
	public readonly details?: unknown;

	constructor(message: string, statusCode: number, code?: string, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;

		// Maintains proper stack trace
		Object.setPrototypeOf(this, ApiError.prototype);
	}

	/**
	 * Check if error is an ApiError
	 */
	static isApiError(error: unknown): error is ApiError {
		return error instanceof ApiError;
	}

	/**
	 * Get user-friendly error message
	 * Formats the error message with details if available
	 */
	getUserMessage(): string {
		if (this.details && typeof this.details === "object") {
			// If details is a validation error object with field errors
			if ("fieldErrors" in this.details) {
				const fieldErrors = this.details.fieldErrors as Record<string, string[]>;
				const firstError = Object.values(fieldErrors)[0]?.[0];
				if (firstError) {
					return `${this.message}: ${firstError}`;
				}
			}

			// If details has a specific message
			if ("message" in this.details) {
				return `${this.message}: ${this.details.message}`;
			}
		}

		return this.message;
	}
}

/**
 * Parse error response from API
 * Handles both structured error responses and plain text
 */
export async function parseApiError(response: Response): Promise<ApiError> {
	const statusCode = response.status;

	try {
		const errorData = (await response.json()) as ApiErrorResponse;

		return new ApiError(
			errorData.error.message || "An error occurred",
			statusCode,
			errorData.error.code,
			errorData.error.details
		);
	} catch {
		// If response is not JSON, use status text
		return new ApiError(
			response.statusText || "An error occurred",
			statusCode,
			"UNKNOWN_ERROR"
		);
	}
}

/**
 * Handle API errors in mutations/queries
 * Converts ApiError to user-friendly message for display
 */
export function getErrorMessage(error: unknown): string {
	if (ApiError.isApiError(error)) {
		return error.getUserMessage();
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}
