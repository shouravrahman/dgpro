import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupportAgent } from '../support-agent';
import type { SupportRequest } from '../support-agent';

// Mock the enhanced base agent
vi.mock('../enhanced-base-agent', () => ({
    EnhancedBaseAgent: class {
        protected model = 'gemini-pro';

        protected async generateResponse(prompt: string, options?: any): Promise<string> {
            // Mock AI response based on prompt content
            if (prompt.includes('Categorize this support message')) {
                return 'technical_support';
            }
            return 'Thank you for contacting support. I understand your concern and I\'m here to help you resolve this issue step by step.';
        }
    }
}));

describe('SupportAgent', () => {
    let supportAgent: SupportAgent;
    let mockRequest: SupportRequest;

    beforeEach(() => {
        supportAgent = new SupportAgent();
        mockRequest = {
            message: 'I need help with my account',
            sessionId: 'test-session-123',
            timestamp: new Date(),
            userId: 'user-123'
        };
    });

    describe('processRequest', () => {
        it('should process a basic support request successfully', async () => {
            const response = await supportAgent.processRequest(mockRequest);

            expect(response.success).toBe(true);
            expect(response.message).toBeTruthy();
            expect(response.sessionId).toBe(mockRequest.sessionId);
            expect(response.category).toBeTruthy();
            expect(response.confidence).toBeGreaterThan(0);
        });

        it('should handle requests with conversation history', async () => {
            const requestWithHistory: SupportRequest = {
                ...mockRequest,
                conversationHistory: [
                    {
                        id: '1',
                        role: 'user',
                        content: 'Hello',
                        timestamp: new Date()
                    },
                    {
                        id: '2',
                        role: 'assistant',
                        content: 'Hi! How can I help you?',
                        timestamp: new Date()
                    }
                ]
            };

            const response = await supportAgent.processRequest(requestWithHistory);
            expect(response.success).toBe(true);
        });

        it('should handle requests with user context', async () => {
            const requestWithContext: SupportRequest = {
                ...mockRequest,
                userContext: {
                    subscriptionTier: 'premium',
                    accountAge: 30,
                    preferredLanguage: 'en',
                    timezone: 'UTC'
                }
            };

            const response = await supportAgent.processRequest(requestWithContext);
            expect(response.success).toBe(true);
        });

        it('should validate required fields', async () => {
            const invalidRequest: SupportRequest = {
                ...mockRequest,
                message: ''
            };

            const response = await supportAgent.processRequest(invalidRequest);
            expect(response.success).toBe(false);
            expect(response.error).toContain('Support message is required');
        });

        it('should validate session ID', async () => {
            const invalidRequest: SupportRequest = {
                ...mockRequest,
                sessionId: ''
            };

            const response = await supportAgent.processRequest(invalidRequest);
            expect(response.success).toBe(false);
            expect(response.error).toContain('Session ID is required');
        });

        it('should validate message length', async () => {
            const invalidRequest: SupportRequest = {
                ...mockRequest,
                message: 'a'.repeat(5001)
            };

            const response = await supportAgent.processRequest(invalidRequest);
            expect(response.success).toBe(false);
            expect(response.error).toContain('Message too long');
        });
    });

    describe('urgency analysis', () => {
        it('should detect critical urgency from keywords', async () => {
            const criticalRequest: SupportRequest = {
                ...mockRequest,
                message: 'URGENT: My payment system is completely broken and not working!'
            };

            const response = await supportAgent.processRequest(criticalRequest);
            expect(response.metadata?.urgency).toBe('critical');
        });

        it('should detect high urgency from keywords', async () => {
            const highRequest: SupportRequest = {
                ...mockRequest,
                message: 'I have an important problem that needs to be fixed ASAP'
            };

            const response = await supportAgent.processRequest(highRequest);
            expect(response.metadata?.urgency).toBe('high');
        });

        it('should use provided urgency when valid', async () => {
            const requestWithUrgency: SupportRequest = {
                ...mockRequest,
                urgency: 'high'
            };

            const response = await supportAgent.processRequest(requestWithUrgency);
            expect(response.metadata?.urgency).toBe('high');
        });

        it('should default to medium urgency', async () => {
            const neutralRequest: SupportRequest = {
                ...mockRequest,
                message: 'I have a question about features'
            };

            const response = await supportAgent.processRequest(neutralRequest);
            expect(response.metadata?.urgency).toBe('medium');
        });
    });

    describe('category detection', () => {
        it('should use provided category when valid', async () => {
            const requestWithCategory: SupportRequest = {
                ...mockRequest,
                category: 'billing_payment'
            };

            const response = await supportAgent.processRequest(requestWithCategory);
            expect(response.category).toBe('billing_payment');
        });

        it('should categorize messages using AI when no category provided', async () => {
            const response = await supportAgent.processRequest(mockRequest);
            expect(response.category).toBeTruthy();
            expect(typeof response.category).toBe('string');
        });
    });

    describe('escalation logic', () => {
        it('should escalate critical issues', async () => {
            const criticalRequest: SupportRequest = {
                ...mockRequest,
                urgency: 'critical',
                message: 'Critical system failure'
            };

            const response = await supportAgent.processRequest(criticalRequest);
            expect(response.escalationRequired).toBe(true);
        });

        it('should escalate billing issues', async () => {
            const billingRequest: SupportRequest = {
                ...mockRequest,
                category: 'billing_payment',
                message: 'Issue with my payment'
            };

            const response = await supportAgent.processRequest(billingRequest);
            expect(response.escalationRequired).toBe(true);
        });
    });

    describe('suggested actions', () => {
        it('should provide relevant actions for account management', async () => {
            const accountRequest: SupportRequest = {
                ...mockRequest,
                category: 'account_management'
            };

            const response = await supportAgent.processRequest(accountRequest);
            expect(response.suggestedActions).toContain('Check account settings');
        });

        it('should provide relevant actions for technical support', async () => {
            const techRequest: SupportRequest = {
                ...mockRequest,
                category: 'technical_support'
            };

            const response = await supportAgent.processRequest(techRequest);
            expect(response.suggestedActions).toContain('Clear browser cache');
        });
    });

    describe('follow-up questions', () => {
        it('should generate relevant follow-up questions', async () => {
            const response = await supportAgent.processRequest(mockRequest);
            expect(response.followUpQuestions).toBeDefined();
            expect(Array.isArray(response.followUpQuestions)).toBe(true);
            expect(response.followUpQuestions!.length).toBeGreaterThan(0);
        });

        it('should provide category-specific follow-up questions', async () => {
            const techRequest: SupportRequest = {
                ...mockRequest,
                category: 'technical_support'
            };

            const response = await supportAgent.processRequest(techRequest);
            expect(response.followUpQuestions).toContain('What browser are you using?');
        });
    });

    describe('related articles', () => {
        it('should provide related help articles', async () => {
            const response = await supportAgent.processRequest(mockRequest);
            expect(response.relatedArticles).toBeDefined();
            expect(Array.isArray(response.relatedArticles)).toBe(true);
        });

        it('should filter articles by relevance', async () => {
            const response = await supportAgent.processRequest(mockRequest);
            response.relatedArticles?.forEach(article => {
                expect(article.relevance).toBeGreaterThan(0.5);
            });
        });
    });

    describe('resolution time estimation', () => {
        it('should estimate faster resolution for critical issues', async () => {
            const criticalRequest: SupportRequest = {
                ...mockRequest,
                urgency: 'critical'
            };

            const response = await supportAgent.processRequest(criticalRequest);
            expect(response.estimatedResolutionTime).toBe('Within 1 hour');
        });

        it('should estimate appropriate resolution time for low priority', async () => {
            const lowRequest: SupportRequest = {
                ...mockRequest,
                urgency: 'low'
            };

            const response = await supportAgent.processRequest(lowRequest);
            expect(response.estimatedResolutionTime).toBe('Within 2-3 business days');
        });
    });

    describe('error handling', () => {
        it('should handle AI generation errors gracefully', async () => {
            // Mock the generateResponse to throw an error
            const errorAgent = new SupportAgent();
            vi.spyOn(errorAgent as any, 'generateResponse').mockRejectedValue(new Error('AI service unavailable'));

            const response = await errorAgent.processRequest(mockRequest);
            expect(response.success).toBe(false);
            expect(response.escalationRequired).toBe(true);
            expect(response.message).toContain('technical difficulties');
        });

        it('should provide fallback response on error', async () => {
            const errorAgent = new SupportAgent();
            vi.spyOn(errorAgent as any, 'generateResponse').mockRejectedValue(new Error('Network error'));

            const response = await errorAgent.processRequest(mockRequest);
            expect(response.message).toBeTruthy();
            expect(response.sessionId).toBe(mockRequest.sessionId);
        });
    });

    describe('confidence calculation', () => {
        it('should calculate confidence based on response quality', async () => {
            const response = await supportAgent.processRequest(mockRequest);
            expect(response.confidence).toBeGreaterThan(0);
            expect(response.confidence).toBeLessThanOrEqual(1);
        });

        it('should have lower confidence for technical issues', async () => {
            const techRequest: SupportRequest = {
                ...mockRequest,
                category: 'technical_support'
            };

            const response = await supportAgent.processRequest(techRequest);
            expect(response.confidence).toBeLessThan(0.9);
        });
    });
});