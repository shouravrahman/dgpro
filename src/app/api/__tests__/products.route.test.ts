import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../products/route';

// Mock the api-error-handler module
vi.mock('@/lib/api-error-handler', () => ({
    ApiErrorHandler: {
        success: vi.fn().mockReturnValue({
            status: 200,
            json: vi.fn().mockResolvedValue({
                success: true,
                data: [],
                message: 'Products API endpoint ready',
                timestamp: '2024-01-01T00:00:00.000Z',
            }),
        }),
        created: vi.fn().mockReturnValue({
            status: 201,
            json: vi.fn().mockResolvedValue({
                success: true,
                data: { test: 'data' },
                message: 'Product creation endpoint ready',
                timestamp: '2024-01-01T00:00:00.000Z',
            }),
        }),
    },
    parseRequestBody: vi.fn(),
    withApiErrorHandler: vi.fn((handler) => handler),
}));

describe('/api/products route handlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should return success response with empty array', async () => {
            const request = new NextRequest('http://localhost/api/products');
            const response = await GET(request);

            expect(response.status).toBe(200);

            const { ApiErrorHandler } = await import('@/lib/api-error-handler');
            expect(ApiErrorHandler.success).toHaveBeenCalledWith([], 'Products API endpoint ready');
        });

        it('should handle request properly', async () => {
            const request = new NextRequest('http://localhost/api/products', {
                method: 'GET',
            });

            const response = await GET(request);
            expect(response).toBeDefined();
        });
    });

    describe('POST /api/products', () => {
        it('should parse request body and return created response', async () => {
            const testBody = { name: 'Test Product', price: 100 };

            const { parseRequestBody, ApiErrorHandler } = await import('@/lib/api-error-handler');
            (parseRequestBody as any).mockResolvedValue(testBody);

            const request = new NextRequest('http://localhost/api/products', {
                method: 'POST',
                body: JSON.stringify(testBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);

            expect(parseRequestBody).toHaveBeenCalledWith(request);
            expect(ApiErrorHandler.created).toHaveBeenCalledWith(testBody, 'Product creation endpoint ready');
            expect(response.status).toBe(201);
        });

        it('should handle empty request body', async () => {
            const { parseRequestBody } = await import('@/lib/api-error-handler');
            (parseRequestBody as any).mockResolvedValue({});

            const request = new NextRequest('http://localhost/api/products', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);
            expect(response).toBeDefined();
        });
    });

    describe('error handling integration', () => {
        it('should be wrapped with withApiErrorHandler', async () => {
            const { withApiErrorHandler } = await import('@/lib/api-error-handler');

            // Verify that the handlers are wrapped
            expect(withApiErrorHandler).toHaveBeenCalledTimes(2); // GET and POST
        });

        it('should handle parsing errors in POST', async () => {
            const { parseRequestBody } = await import('@/lib/api-error-handler');
            const parseError = new Error('Invalid JSON');
            (parseRequestBody as any).mockRejectedValue(parseError);

            const request = new NextRequest('http://localhost/api/products', {
                method: 'POST',
                body: 'invalid json',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Since it's wrapped with withApiErrorHandler, errors should be caught
            await expect(POST(request)).rejects.toThrow('Invalid JSON');
        });
    });

    describe('request validation', () => {
        it('should accept valid JSON in POST request', async () => {
            const validBody = {
                name: 'Test Product',
                description: 'A test product',
                price: 99.99,
                category: 'electronics',
            };

            const { parseRequestBody } = await import('@/lib/api-error-handler');
            (parseRequestBody as any).mockResolvedValue(validBody);

            const request = new NextRequest('http://localhost/api/products', {
                method: 'POST',
                body: JSON.stringify(validBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);
            expect(response).toBeDefined();
            expect(parseRequestBody).toHaveBeenCalledWith(request);
        });
    });

    describe('response format', () => {
        it('should return consistent response format for GET', async () => {
            const request = new NextRequest('http://localhost/api/products');
            const response = await GET(request);

            const { ApiErrorHandler } = await import('@/lib/api-error-handler');
            expect(ApiErrorHandler.success).toHaveBeenCalledWith(
                [],
                'Products API endpoint ready'
            );
        });

        it('should return consistent response format for POST', async () => {
            const testBody = { name: 'Test' };
            const { parseRequestBody } = await import('@/lib/api-error-handler');
            (parseRequestBody as any).mockResolvedValue(testBody);

            const request = new NextRequest('http://localhost/api/products', {
                method: 'POST',
                body: JSON.stringify(testBody),
            });

            const response = await POST(request);

            const { ApiErrorHandler } = await import('@/lib/api-error-handler');
            expect(ApiErrorHandler.created).toHaveBeenCalledWith(
                testBody,
                'Product creation endpoint ready'
            );
        });
    });
});