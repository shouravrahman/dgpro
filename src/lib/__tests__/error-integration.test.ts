import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
    ApiErrorHandler,
    ApiValidationError,
    ApiAuthenticationError,
    withApiErrorHandler,
} from '../api-error-handler';
import { ErrorHandler, AppErrorCode } from '../error-handler';

describe('Error Handling Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    describe('End-to-end error flow', () => {
        it('should handle complete error flow from API to client', async () => {
            // Simulate an API handler that throws a validation error
            const mockHandler = vi.fn().mockImplementation(async () => {
                throw new ApiValidationError('Invalid email format', { email: ['Must be valid email'] });
            });

            const wrappedHandler = withApiErrorHandler(mockHandler);
            const request = new NextRequest('http://localhost/api/test');

            const response = await wrappedHandler(request);

            expect(response.status).toBe(400);

            // Verify the response structure
            const responseData = await response.json();
            expect(responseData).toMatchObject({
                error: 'Invalid email format',
                code: 'VALIDATION_ERROR',
                details: { email: ['Must be valid email'] },
                timestamp: expect.any(String),
            });
        });

        it('should handle Zod validation errors in API routes', async () => {
            const zodError = new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'number',
                    path: ['name'],
                    message: 'Expected string, received number',
                },
            ]);

            const mockHandler = vi.fn().mockRejectedValue(zodError);
            const wrappedHandler = withApiErrorHandler(mockHandler);
            const request = new NextRequest('http://localhost/api/users');

            const response = await wrappedHandler(request);

            expect(response.status).toBe(400);

            const responseData = await response.json();
            expect(responseData.code).toBe('VALIDATION_ERROR');
            expect(responseData.error).toBe('Validation failed');
        });

        it('should handle authentication errors across the stack', async () => {
            const authError = new ApiAuthenticationError('Token expired');

            const mockHandler = vi.fn().mockRejectedValue(authError);
            const wrappedHandler = withApiErrorHandler(mockHandler);
            const request = new NextRequest('http://localhost/api/protected');

            const response = await wrappedHandler(request);

            expect(response.status).toBe(401);

            const responseData = await response.json();
            expect(responseData).toMatchObject({
                error: 'Token expired',
                code: 'AUTH_ERROR',
                timestamp: expect.any(String),
            });
        });
    });

    describe('Error categorization consistency', () => {
        it('should categorize errors consistently between ErrorHandler and ApiErrorHandler', () => {
            const authError = new Error('Unauthorized token invalid');

            // Test ErrorHandler categorization
            const appError = ErrorHandler.handle(authError);
            expect(appError.code).toBe(AppErrorCode.AUTH_ERROR);
            expect(appError.statusCode).toBe(401);

            // Test ApiErrorHandler with same error
            const apiResponse = ApiErrorHandler.handle(authError);
            expect(apiResponse.status).toBe(401);
        });

        it('should handle network errors consistently', () => {
            const networkError = new Error('Network connection timeout');

            const appError = ErrorHandler.handle(networkError);
            expect(appError.code).toBe(AppErrorCode.NETWORK_ERROR);
            expect(appError.statusCode).toBe(503);

            const apiResponse = ApiErrorHandler.handle(networkError);
            expect(apiResponse.status).toBe(503);
        });
    });

    describe('Error propagation and logging', () => {
        it('should log errors appropriately in different environments', () => {
            const consoleSpy = vi.spyOn(console, 'error');

            // Test development environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const error = new Error('Test error');
            const appError = ErrorHandler.handle(error);

            expect(appError.details).toBeDefined(); // Stack trace included in dev

            // Test production environment
            process.env.NODE_ENV = 'production';
            const prodError = ErrorHandler.handle(error);

            expect(prodError.details).toBeUndefined(); // No stack trace in prod

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle error chaining correctly', async () => {
            const originalError = new Error('Database connection failed');
            const wrappedError = new ApiValidationError('Validation failed due to database error');

            const mockHandler = vi.fn().mockRejectedValue(wrappedError);
            const wrappedHandler = withApiErrorHandler(mockHandler);
            const request = new NextRequest('http://localhost/api/test');

            const response = await wrappedHandler(request);

            expect(response.status).toBe(400);

            const responseData = await response.json();
            expect(responseData.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('Path extraction and context', () => {
        it('should extract and include request path in error responses', async () => {
            const error = new ApiValidationError('Invalid data');
            const mockHandler = vi.fn().mockRejectedValue(error);
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const request = new NextRequest('http://localhost/api/users/123/posts');
            const response = await wrappedHandler(request);

            const responseData = await response.json();
            expect(responseData.path).toBe('/api/users/123/posts');
        });

        it('should handle requests without clear paths', async () => {
            const error = new Error('Generic error');
            const mockHandler = vi.fn().mockRejectedValue(error);
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const request = new NextRequest('http://localhost/');
            const response = await wrappedHandler(request);

            const responseData = await response.json();
            expect(responseData.path).toBe('/');
        });
    });

    describe('Error recovery and retry mechanisms', () => {
        it('should support error recovery in wrapped handlers', async () => {
            let callCount = 0;
            const mockHandler = vi.fn().mockImplementation(async () => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('Temporary failure');
                }
                return ApiErrorHandler.success({ data: 'success' });
            });

            const wrappedHandler = withApiErrorHandler(mockHandler);
            const request = new NextRequest('http://localhost/api/test');

            // First call should fail
            const firstResponse = await wrappedHandler(request);
            expect(firstResponse.status).toBe(500);

            // Second call should succeed
            const secondResponse = await wrappedHandler(request);
            expect(secondResponse.status).toBe(200);
        });
    });

    describe('Type safety and error boundaries', () => {
        it('should maintain type safety across error handling layers', () => {
            // Test that our error types are properly structured
            const validationError = new ApiValidationError('Test', ['field1']);
            expect(validationError.details).toEqual(['field1']);
            expect(validationError.statusCode).toBe(400);
            expect(validationError.code).toBe('VALIDATION_ERROR');

            // Test error handler response structure
            const response = ApiErrorHandler.handle(validationError);
            expect(response.status).toBe(400);
        });

        it('should handle unknown error types gracefully', async () => {
            const weirdError = { message: 'Not a real error', weird: true };
            const mockHandler = vi.fn().mockRejectedValue(weirdError);
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const request = new NextRequest('http://localhost/api/test');
            const response = await wrappedHandler(request);

            expect(response.status).toBe(500);

            const responseData = await response.json();
            expect(responseData.code).toBe('INTERNAL_ERROR');
        });
    });
});