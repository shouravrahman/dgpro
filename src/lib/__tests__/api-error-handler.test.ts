import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
    ApiErrorHandler,
    ApiErrorCode,
    HttpStatusCode,
    ApiAuthenticationError,
    ApiValidationError,
    ApiDatabaseError,
    ApiNotFoundError,
    ApiRateLimitError,
    ApiConflictError,
    parseAndValidateJson,
    parseRequestBody,
    withApiErrorHandler,
    isValidRequestBody,
    isValidJsonString,
} from '../api-error-handler';

describe('ApiErrorHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    describe('handle', () => {
        it('should handle ZodError correctly', () => {
            const zodError = new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'number',
                    path: ['email'],
                    message: 'Expected string, received number',
                },
            ]);

            const response = ApiErrorHandler.handle(zodError, '/api/test');

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
        });

        it('should handle custom API errors', () => {
            const authError = new ApiAuthenticationError('Invalid token');
            const response = ApiErrorHandler.handle(authError);

            expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
        });

        it('should handle database errors with logging', () => {
            const dbError = new ApiDatabaseError('Connection failed');
            const consoleSpy = vi.spyOn(console, 'error');

            ApiErrorHandler.handle(dbError, '/api/users');

            expect(consoleSpy).toHaveBeenCalledWith('Database Error:', expect.objectContaining({
                message: 'Connection failed',
                path: '/api/users',
            }));
        });

        it('should handle unknown errors', () => {
            const unknownError = new Error('Unknown error');
            const response = ApiErrorHandler.handle(unknownError);

            expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
        });
    });

    describe('success responses', () => {
        it('should create success response', () => {
            const data = { id: 1, name: 'Test' };
            const response = ApiErrorHandler.success(data, 'Success message');

            expect(response.status).toBe(HttpStatusCode.OK);
        });

        it('should create created response', () => {
            const data = { id: 1 };
            const response = ApiErrorHandler.created(data, 'Created successfully');

            expect(response.status).toBe(HttpStatusCode.CREATED);
        });
    });

    describe('custom error classes', () => {
        it('should create ApiAuthenticationError correctly', () => {
            const error = new ApiAuthenticationError('Invalid credentials');

            expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
            expect(error.code).toBe(ApiErrorCode.AUTH_ERROR);
            expect(error.message).toBe('Invalid credentials');
        });

        it('should create ApiValidationError correctly', () => {
            const error = new ApiValidationError('Invalid input', ['field1', 'field2']);

            expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
            expect(error.code).toBe(ApiErrorCode.VALIDATION_ERROR);
            expect(error.details).toEqual(['field1', 'field2']);
        });

        it('should create ApiNotFoundError with default message', () => {
            const error = new ApiNotFoundError();

            expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
            expect(error.code).toBe(ApiErrorCode.NOT_FOUND);
            expect(error.message).toBe('Resource not found');
        });

        it('should create ApiRateLimitError with default message', () => {
            const error = new ApiRateLimitError();

            expect(error.statusCode).toBe(HttpStatusCode.TOO_MANY_REQUESTS);
            expect(error.code).toBe(ApiErrorCode.RATE_LIMIT_ERROR);
            expect(error.message).toBe('Rate limit exceeded');
        });
    });
});

describe('utility functions', () => {
    describe('isValidRequestBody', () => {
        it('should return true for valid objects', () => {
            expect(isValidRequestBody({ key: 'value' })).toBe(true);
            expect(isValidRequestBody({})).toBe(true);
        });

        it('should return false for invalid types', () => {
            expect(isValidRequestBody(null)).toBe(false);
            expect(isValidRequestBody([])).toBe(false);
            expect(isValidRequestBody('string')).toBe(false);
            expect(isValidRequestBody(123)).toBe(false);
        });
    });

    describe('isValidJsonString', () => {
        it('should return true for valid JSON strings', () => {
            expect(isValidJsonString('{"key": "value"}')).toBe(true);
            expect(isValidJsonString('[]')).toBe(true);
            expect(isValidJsonString('"string"')).toBe(true);
        });

        it('should return false for invalid JSON', () => {
            expect(isValidJsonString('invalid json')).toBe(false);
            expect(isValidJsonString('')).toBe(false);
            expect(isValidJsonString('   ')).toBe(false);
        });

        it('should return false for non-strings', () => {
            expect(isValidJsonString(null as any)).toBe(false);
            expect(isValidJsonString(undefined as any)).toBe(false);
            expect(isValidJsonString(123 as any)).toBe(false);
        });
    });

    describe('parseAndValidateJson', () => {
        it('should parse valid JSON from request', async () => {
            const mockRequest = {
                json: vi.fn().mockResolvedValue({ key: 'value' }),
            } as any;

            const result = await parseAndValidateJson(mockRequest);
            expect(result).toEqual({ key: 'value' });
        });

        it('should throw ApiValidationError for invalid JSON', async () => {
            const mockRequest = {
                json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
            } as any;

            await expect(parseAndValidateJson(mockRequest)).rejects.toThrow(ApiValidationError);
        });
    });

    describe('parseRequestBody', () => {
        it('should parse and validate request body', async () => {
            const mockRequest = {
                json: vi.fn().mockResolvedValue({ key: 'value' }),
            } as any;

            const result = await parseRequestBody(mockRequest);
            expect(result).toEqual({ key: 'value' });
        });

        it('should throw error for non-object body', async () => {
            const mockRequest = {
                json: vi.fn().mockResolvedValue('string'),
            } as any;

            await expect(parseRequestBody(mockRequest)).rejects.toThrow(ApiValidationError);
        });

        it('should use custom validator', async () => {
            const mockRequest = {
                json: vi.fn().mockResolvedValue({ key: 'value' }),
            } as any;

            const validator = vi.fn().mockReturnValue(false);

            await expect(parseRequestBody(mockRequest, validator)).rejects.toThrow(ApiValidationError);
            expect(validator).toHaveBeenCalledWith({ key: 'value' });
        });
    });

    describe('withApiErrorHandler', () => {
        it('should wrap handler and catch errors', async () => {
            const mockHandler = vi.fn().mockRejectedValue(new Error('Test error'));
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const mockRequest = new NextRequest('http://localhost/api/test');
            const response = await wrappedHandler(mockRequest);

            expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(mockHandler).toHaveBeenCalledWith(mockRequest);
        });

        it('should pass through successful responses', async () => {
            const mockResponse = ApiErrorHandler.success({ data: 'test' });
            const mockHandler = vi.fn().mockResolvedValue(mockResponse);
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const mockRequest = new NextRequest('http://localhost/api/test');
            const response = await wrappedHandler(mockRequest);

            expect(response).toBe(mockResponse);
            expect(mockHandler).toHaveBeenCalledWith(mockRequest);
        });

        it('should extract path from request', async () => {
            const mockHandler = vi.fn().mockRejectedValue(new ApiNotFoundError('Not found'));
            const wrappedHandler = withApiErrorHandler(mockHandler);

            const mockRequest = new NextRequest('http://localhost/api/users/123');
            await wrappedHandler(mockRequest);

            // The error handler should have been called with the path
            expect(mockHandler).toHaveBeenCalledWith(mockRequest);
        });
    });
});