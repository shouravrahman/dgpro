import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock dependencies
vi.mock('@/lib/ai/agents/support-agent', () => ({
    SupportAgent: class {
        async processRequest(request: any) {
            return {
                success: true,
                message: 'Mock support response',
                category: 'general_inquiry',
                confidence: 0.8,
                sessionId: request.sessionId,
                escalationRequired: false,
                suggestedActions: ['Check FAQ'],
                followUpQuestions: ['Need more help?'],
                relatedArticles: [],
                estimatedResolutionTime: 'Within 24 hours',
                metadata: {
                    urgency: 'medium',
                    processingTime: 100,
                    model: 'gemini-pro',
                    category: 'general_inquiry'
                }
            };
        }
    }
}));

vi.mock('@/lib/utils/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('@/lib/auth/api-validation', () => ({
    validateApiKey: vi.fn().mockResolvedValue({
        valid: true,
        userId: 'test-user-123'
    })
}));

describe('/api/agents/support', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST', () => {
        it('should process a valid support request', async () => {
            const requestBody = {
                message: 'I need help with my account',
                sessionId: 'test-session-123',
                urgency: 'medium'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBeTruthy();
            expect(data.sessionId).toBe(requestBody.sessionId);
            expect(data.category).toBeTruthy();
        });

        it('should handle requests with conversation history', async () => {
            const requestBody = {
                message: 'Follow up question',
                sessionId: 'test-session-123',
                conversationHistory: [
                    {
                        id: '1',
                        role: 'user',
                        content: 'Previous message',
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should handle requests with user context', async () => {
            const requestBody = {
                message: 'I need help',
                sessionId: 'test-session-123',
                userContext: {
                    subscriptionTier: 'premium',
                    accountAge: 30,
                    preferredLanguage: 'en'
                }
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should return 400 for missing message', async () => {
            const requestBody = {
                sessionId: 'test-session-123'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Message is required');
        });

        it('should return 400 for missing session ID', async () => {
            const requestBody = {
                message: 'I need help'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Session ID is required');
        });

        it('should return 400 for invalid message type', async () => {
            const requestBody = {
                message: 123, // Invalid type
                sessionId: 'test-session-123'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('Message is required and must be a string');
        });

        it('should return 401 for invalid API key', async () => {
            const { validateApiKey } = await import('@/lib/auth/api-validation');
            vi.mocked(validateApiKey).mockResolvedValueOnce({ valid: false });

            const requestBody = {
                message: 'I need help',
                sessionId: 'test-session-123'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer invalid-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 429 when rate limited', async () => {
            const { rateLimit } = await import('@/lib/utils/rate-limit');
            vi.mocked(rateLimit).mockResolvedValueOnce({
                success: false,
                retryAfter: 60
            });

            const requestBody = {
                message: 'I need help',
                sessionId: 'test-session-123'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(429);
            expect(data.error).toBe('Rate limit exceeded');
            expect(data.retryAfter).toBe(60);
        });

        it('should handle agent processing errors', async () => {
            const { SupportAgent } = await import('@/lib/ai/agents/support-agent');
            const mockAgent = new SupportAgent();
            vi.spyOn(mockAgent, 'processRequest').mockRejectedValueOnce(new Error('Agent error'));

            const requestBody = {
                message: 'I need help',
                sessionId: 'test-session-123'
            };

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Internal server error');
        });
    });

    describe('GET', () => {
        it('should return agent capabilities and status', async () => {
            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.agent).toBe('support');
            expect(data.version).toBeTruthy();
            expect(Array.isArray(data.capabilities)).toBe(true);
            expect(Array.isArray(data.supportedCategories)).toBe(true);
            expect(Array.isArray(data.urgencyLevels)).toBe(true);
            expect(data.status).toBe('operational');
        });

        it('should return 401 for invalid API key on GET', async () => {
            const { validateApiKey } = await import('@/lib/auth/api-validation');
            vi.mocked(validateApiKey).mockResolvedValueOnce({ valid: false });

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer invalid-key'
                }
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should handle GET errors gracefully', async () => {
            const { validateApiKey } = await import('@/lib/auth/api-validation');
            vi.mocked(validateApiKey).mockRejectedValueOnce(new Error('Auth service error'));

            mockRequest = new NextRequest('http://localhost:3000/api/agents/support', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer test-api-key'
                }
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });
});