import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ErrorHandler } from './error-handler';

// HTTP status codes enum for better type safety
export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

// Error codes enum for consistency
export enum ApiErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    CONFLICT_ERROR = 'CONFLICT_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Validation error details type
export type ValidationErrorDetails = ZodError['issues'] | Record<string, string[]> | string;

// Standard API error response interface
export interface ApiErrorResponse {
    error: string;
    code: ApiErrorCode;
    details?: ValidationErrorDetails;
    timestamp: string;
    path?: string;
}

// Standard API success response interface
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data?: T;
    message?: string;
    timestamp: string;
}

// Base API error class with better structure
abstract class BaseApiError extends Error {
    abstract readonly statusCode: HttpStatusCode;
    abstract readonly code: ApiErrorCode;

    constructor(
        message: string,
        public readonly details?: ValidationErrorDetails,
        public readonly path?: string
    ) {
        super(message);
        this.name = this.constructor.name;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Custom API error classes with specific status codes
export class ApiAuthenticationError extends BaseApiError {
    readonly statusCode = HttpStatusCode.UNAUTHORIZED;
    readonly code = ApiErrorCode.AUTH_ERROR;
}

export class ApiValidationError extends BaseApiError {
    readonly statusCode = HttpStatusCode.BAD_REQUEST;
    readonly code = ApiErrorCode.VALIDATION_ERROR;
}

export class ApiDatabaseError extends BaseApiError {
    readonly statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    readonly code = ApiErrorCode.DATABASE_ERROR;
}

export class ApiNotFoundError extends BaseApiError {
    readonly statusCode = HttpStatusCode.NOT_FOUND;
    readonly code = ApiErrorCode.NOT_FOUND;

    constructor(message = 'Resource not found', details?: ValidationErrorDetails, path?: string) {
        super(message, details, path);
    }
}

export class ApiRateLimitError extends BaseApiError {
    readonly statusCode = HttpStatusCode.TOO_MANY_REQUESTS;
    readonly code = ApiErrorCode.RATE_LIMIT_ERROR;

    constructor(message = 'Rate limit exceeded', details?: ValidationErrorDetails, path?: string) {
        super(message, details, path);
    }
}

export class ApiConflictError extends BaseApiError {
    readonly statusCode = HttpStatusCode.CONFLICT;
    readonly code = ApiErrorCode.CONFLICT_ERROR;
}

// Centralized API error handler with improved error handling
export class ApiErrorHandler {
    private static readonly isDevelopment = process.env.NODE_ENV === 'development';

    static handle(error: unknown, path?: string): NextResponse<ApiErrorResponse> {
        const timestamp = new Date().toISOString();

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return this.createErrorResponse({
                error: 'Validation failed',
                code: ApiErrorCode.VALIDATION_ERROR,
                details: error.issues,
                timestamp,
                path,
            }, HttpStatusCode.BAD_REQUEST);
        }

        // Handle custom API errors (all inherit from BaseApiError)
        if (error instanceof BaseApiError) {
            // Log database errors for monitoring
            if (error instanceof ApiDatabaseError) {
                console.error('Database Error:', {
                    message: error.message,
                    stack: error.stack,
                    path,
                    timestamp,
                });
            }

            return this.createErrorResponse({
                error: error.message,
                code: error.code,
                details: error.details,
                timestamp,
                path: path || error.path,
            }, error.statusCode);
        }

        // Use global error handler for other errors
        const appError = ErrorHandler.handle(error);
        console.error('Unhandled API Error:', {
            ...appError,
            path,
            timestamp,
        });

        return this.createErrorResponse({
            error: this.isDevelopment ? appError.message : 'Internal server error',
            code: ApiErrorCode.INTERNAL_ERROR,
            details: this.isDevelopment ? appError.details : undefined,
            timestamp,
            path,
        }, appError.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    private static createErrorResponse(
        errorResponse: ApiErrorResponse,
        statusCode: HttpStatusCode
    ): NextResponse<ApiErrorResponse> {
        return NextResponse.json(errorResponse, { status: statusCode });
    }

    // Helper method to create success responses with better type safety
    static success<T>(
        data?: T,
        message?: string,
        status: HttpStatusCode = HttpStatusCode.OK
    ): NextResponse<ApiSuccessResponse<T>> {
        return NextResponse.json({
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
        } satisfies ApiSuccessResponse<T>, { status });
    }

    // Helper method to create created responses
    static created<T>(
        data?: T,
        message?: string
    ): NextResponse<ApiSuccessResponse<T>> {
        return this.success(data, message, HttpStatusCode.CREATED);
    }
}

// Type guard utilities with better type safety
export function isValidRequestBody(body: unknown): body is Record<string, unknown> {
    return typeof body === 'object' && body !== null && !Array.isArray(body);
}

export function isValidJsonString(str: string): boolean {
    if (typeof str !== 'string' || str.trim() === '') {
        return false;
    }

    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// Request validation helpers with better error handling
export async function parseAndValidateJson<T = unknown>(request: Request): Promise<T> {
    try {
        const body = await request.json() as T;
        return body;
    } catch (error) {
        const errorMessage = error instanceof Error
            ? `Invalid JSON in request body: ${error.message}`
            : 'Invalid JSON in request body';
        throw new ApiValidationError(errorMessage);
    }
}

// Helper to safely parse request body with validation
export async function parseRequestBody<T = Record<string, unknown>>(
    request: Request,
    validator?: (body: unknown) => body is T
): Promise<T> {
    const body = await parseAndValidateJson<T>(request);

    if (!isValidRequestBody(body)) {
        throw new ApiValidationError('Request body must be a valid object');
    }

    if (validator && !validator(body)) {
        throw new ApiValidationError('Request body validation failed');
    }

    return body;
}

// Utility to create API route wrapper with error handling
export function withApiErrorHandler<T extends unknown[]>(
    handler: (...args: T) => Promise<NextResponse>
) {
    return async (...args: T): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            // Extract path from request if available
            const request = args.find(arg => arg instanceof Request) as Request | undefined;
            const path = request ? new URL(request.url).pathname : undefined;
            return ApiErrorHandler.handle(error, path);
        }
    };
}