import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler, AppErrorCode, createErrorBoundaryFallback } from '../error-handler';

describe('ErrorHandler', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    describe('handle', () => {
        it('should handle Error instances correctly in development', () => {
            process.env.NODE_ENV = 'development';
            const error = new Error('Test error message');
            const result = ErrorHandler.handle(error);

            expect(result).toEqual({
                message: 'Test error message',
                code: AppErrorCode.GENERIC_ERROR,
                statusCode: 500,
                details: expect.any(String), // Stack trace in development
            });
        });

        it('should handle Error instances correctly in production', () => {
            process.env.NODE_ENV = 'production';
            const error = new Error('Test error message');
            const result = ErrorHandler.handle(error);

            expect(result).toEqual({
                message: 'Test error message',
                code: AppErrorCode.GENERIC_ERROR,
                statusCode: 500,
                details: undefined, // No stack trace in production
            });
        });

        it('should handle string errors', () => {
            const error = 'String error message';
            const result = ErrorHandler.handle(error);

            expect(result).toEqual({
                message: 'String error message',
                code: AppErrorCode.STRING_ERROR,
                statusCode: 500,
            });
        });

        it('should handle unknown errors in development', () => {
            process.env.NODE_ENV = 'development';
            const error = { unknown: 'object' };
            const result = ErrorHandler.handle(error);

            expect(result).toEqual({
                message: 'An unexpected error occurred',
                code: AppErrorCode.UNKNOWN_ERROR,
                statusCode: 500,
                details: error,
            });
        });

        it('should handle unknown errors in production', () => {
            process.env.NODE_ENV = 'production';
            const error = { unknown: 'object' };
            const result = ErrorHandler.handle(error);

            expect(result).toEqual({
                message: 'An unexpected error occurred',
                code: AppErrorCode.UNKNOWN_ERROR,
                statusCode: 500,
                details: undefined,
            });
        });

        it('should categorize auth errors correctly', () => {
            const authError = new Error('Unauthorized access token expired');
            const result = ErrorHandler.handle(authError);

            expect(result.code).toBe(AppErrorCode.AUTH_ERROR);
            expect(result.statusCode).toBe(401);
        });

        it('should categorize validation errors correctly', () => {
            const validationError = new Error('Validation failed: invalid email format');
            const result = ErrorHandler.handle(validationError);

            expect(result.code).toBe(AppErrorCode.VALIDATION_ERROR);
            expect(result.statusCode).toBe(400);
        });

        it('should categorize network errors correctly', () => {
            const networkError = new Error('Network connection timeout');
            const result = ErrorHandler.handle(networkError);

            expect(result.code).toBe(AppErrorCode.NETWORK_ERROR);
            expect(result.statusCode).toBe(503);
        });
    });

    describe('getErrorMessage', () => {
        it('should extract message from Error instances', () => {
            const error = new Error('Test message');
            const message = ErrorHandler.getErrorMessage(error);

            expect(message).toBe('Test message');
        });

        it('should handle string errors', () => {
            const error = 'String error';
            const message = ErrorHandler.getErrorMessage(error);

            expect(message).toBe('String error');
        });

        it('should handle unknown errors', () => {
            const error = null;
            const message = ErrorHandler.getErrorMessage(error);

            expect(message).toBe('An unexpected error occurred');
        });
    });

    describe('error type detection', () => {
        it('should detect network errors', () => {
            const networkErrors = [
                new Error('fetch failed'),
                new Error('network timeout'),
                new Error('connection refused'),
                new Error('offline mode'),
            ];

            networkErrors.forEach(error => {
                expect(ErrorHandler.isNetworkError(error)).toBe(true);
            });
        });

        it('should detect auth errors', () => {
            const authErrors = [
                new Error('unauthorized'),
                new Error('forbidden access'),
                new Error('invalid token'),
                new Error('session expired'),
                new Error('login required'),
                new Error('credential mismatch'),
            ];

            authErrors.forEach(error => {
                expect(ErrorHandler.isAuthError(error)).toBe(true);
            });
        });

        it('should detect validation errors', () => {
            const validationErrors = [
                new Error('validation failed'),
                new Error('invalid input'),
                new Error('required field missing'),
                new Error('wrong format'),
                new Error('schema error'),
                new Error('parse error'),
            ];

            validationErrors.forEach(error => {
                expect(ErrorHandler.isValidationError(error)).toBe(true);
            });
        });

        it('should return false for non-Error types', () => {
            expect(ErrorHandler.isNetworkError('string')).toBe(false);
            expect(ErrorHandler.isAuthError(null)).toBe(false);
            expect(ErrorHandler.isValidationError(undefined)).toBe(false);
        });
    });

    describe('createErrorBoundaryFallback', () => {
        it('should create fallback object with correct structure', () => {
            const error = new Error('Test error');
            const retryFn = vi.fn();
            const fallback = createErrorBoundaryFallback(error, retryFn);

            expect(fallback).toEqual({
                title: 'Something went wrong',
                message: 'Test error',
                action: {
                    label: 'Try again',
                    onClick: retryFn,
                },
            });
        });
    });
});