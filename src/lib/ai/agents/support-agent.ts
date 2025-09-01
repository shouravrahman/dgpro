import { EnhancedBaseAgent } from '../enhanced-base-agent';
import type { AgentRequest, AgentResponse } from '../types';

export interface SupportRequest extends AgentRequest {
    message: string;
    userId?: string;
    sessionId: string;
    conversationHistory?: SupportMessage[];
    userContext?: {
        subscriptionTier?: string;
        accountAge?: number;
        previousIssues?: string[];
        preferredLanguage?: string;
        timezone?: string;
    };
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
}

export interface SupportMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        confidence?: number;
        category?: string;
        escalated?: boolean;
        resolved?: boolean;
    };
}

export interface SupportResponse extends AgentResponse {
    message: string;
    category: string;
    confidence: number;
    suggestedActions?: string[];
    escalationRequired?: boolean;
    followUpQuestions?: string[];
    relatedArticles?: Array<{
        title: string;
        url: string;
        relevance: number;
    }>;
    estimatedResolutionTime?: string;
    sessionId: string;
}

export class SupportAgent extends EnhancedBaseAgent {
    private readonly supportCategories = [
        'account_management',
        'billing_payment',
        'technical_support',
        'product_creation',
        'marketplace_issues',
        'general_inquiry',
        'bug_report',
        'feature_request'
    ];

    private readonly urgencyKeywords = {
        critical: ['urgent', 'emergency', 'critical', 'broken', 'down', 'not working'],
        high: ['important', 'asap', 'quickly', 'soon', 'problem', 'issue'],
        medium: ['help', 'question', 'how to', 'support'],
        low: ['suggestion', 'feedback', 'improvement', 'when possible']
    };

    async processRequest(request: SupportRequest): Promise<SupportResponse> {
        try {
            this.validateRequest(request);

            // Analyze message urgency and category
            const urgency = this.analyzeUrgency(request.message, request.urgency);
            const category = await this.categorizeMessage(request.message, request.category);

            // Build context for AI response
            const context = this.buildSupportContext(request, urgency, category);

            // Generate AI response
            const aiResponse = await this.generateSupportResponse(context, request);

            // Post-process response
            const processedResponse = await this.postProcessResponse(aiResponse, request);

            return {
                success: true,
                message: processedResponse.message,
                category,
                confidence: processedResponse.confidence,
                suggestedActions: processedResponse.suggestedActions,
                escalationRequired: processedResponse.escalationRequired,
                followUpQuestions: processedResponse.followUpQuestions,
                relatedArticles: processedResponse.relatedArticles,
                estimatedResolutionTime: processedResponse.estimatedResolutionTime,
                sessionId: request.sessionId,
                metadata: {
                    urgency,
                    processingTime: Date.now() - request.timestamp.getTime(),
                    model: this.model,
                    category
                }
            };
        } catch (error) {
            return this.handleError(error, request);
        }
    }

    private validateRequest(request: SupportRequest): void {
        if (!request.message?.trim()) {
            throw new Error('Support message is required');
        }
        if (!request.sessionId) {
            throw new Error('Session ID is required');
        }
        if (request.message.length > 5000) {
            throw new Error('Message too long (max 5000 characters)');
        }
    }

    private analyzeUrgency(message: string, providedUrgency?: string): 'low' | 'medium' | 'high' | 'critical' {
        if (providedUrgency && ['low', 'medium', 'high', 'critical'].includes(providedUrgency)) {
            return providedUrgency as 'low' | 'medium' | 'high' | 'critical';
        }

        const lowerMessage = message.toLowerCase();

        for (const [level, keywords] of Object.entries(this.urgencyKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return level as 'low' | 'medium' | 'high' | 'critical';
            }
        }

        return 'medium'; // default
    }

    private async categorizeMessage(message: string, providedCategory?: string): Promise<string> {
        if (providedCategory && this.supportCategories.includes(providedCategory)) {
            return providedCategory;
        }

        const prompt = `
        Categorize this support message into one of these categories:
        ${this.supportCategories.join(', ')}
        
        Message: "${message}"
        
        Return only the category name, nothing else.
        `;

        try {
            const result = await this.generateResponse(prompt, {
                maxTokens: 50,
                temperature: 0.1
            });

            const category = result.trim().toLowerCase();
            return this.supportCategories.includes(category) ? category : 'general_inquiry';
        } catch (error) {
            console.warn('Failed to categorize message:', error);
            return 'general_inquiry';
        }
    }

    private buildSupportContext(request: SupportRequest, urgency: string, category: string): string {
        const context = [
            'You are a helpful AI customer support agent for an AI-powered digital product creation platform.',
            'Your role is to provide accurate, helpful, and empathetic support to users.',
            '',
            `Current conversation context:`,
            `- Category: ${category}`,
            `- Urgency: ${urgency}`,
            `- Session ID: ${request.sessionId}`,
        ];

        if (request.userContext) {
            context.push('', 'User context:');
            if (request.userContext.subscriptionTier) {
                context.push(`- Subscription: ${request.userContext.subscriptionTier}`);
            }
            if (request.userContext.accountAge) {
                context.push(`- Account age: ${request.userContext.accountAge} days`);
            }
            if (request.userContext.preferredLanguage) {
                context.push(`- Language: ${request.userContext.preferredLanguage}`);
            }
        }

        if (request.conversationHistory?.length) {
            context.push('', 'Recent conversation history:');
            request.conversationHistory.slice(-5).forEach(msg => {
                context.push(`${msg.role}: ${msg.content}`);
            });
        }

        context.push('', 'Guidelines:');
        context.push('- Be helpful, empathetic, and professional');
        context.push('- Provide specific, actionable solutions when possible');
        context.push('- If you cannot resolve the issue, suggest escalation');
        context.push('- Keep responses concise but comprehensive');
        context.push('- Always maintain a positive, solution-oriented tone');

        return context.join('\n');
    }

    private async generateSupportResponse(context: string, request: SupportRequest) {
        const prompt = `
        ${context}
        
        User message: "${request.message}"
        
        Please provide a helpful response that:
        1. Addresses the user's specific question or concern
        2. Provides actionable solutions or next steps
        3. Maintains a professional and empathetic tone
        4. Suggests escalation if the issue is complex or requires human intervention
        
        Format your response as a natural, conversational message.
        `;

        const response = await this.generateResponse(prompt, {
            maxTokens: 1000,
            temperature: 0.7
        });

        return response;
    }

    private async postProcessResponse(aiResponse: string, request: SupportRequest) {
        // Analyze confidence based on response content
        const confidence = this.calculateConfidence(aiResponse, request);

        // Determine if escalation is needed
        const escalationRequired = this.shouldEscalate(aiResponse, request, confidence);

        // Generate suggested actions
        const suggestedActions = await this.generateSuggestedActions(request);

        // Generate follow-up questions
        const followUpQuestions = this.generateFollowUpQuestions(request);

        // Find related articles (mock implementation)
        const relatedArticles = await this.findRelatedArticles(request);

        // Estimate resolution time
        const estimatedResolutionTime = this.estimateResolutionTime(request);

        return {
            message: aiResponse,
            confidence,
            escalationRequired,
            suggestedActions,
            followUpQuestions,
            relatedArticles,
            estimatedResolutionTime
        };
    }

    private calculateConfidence(response: string, request: SupportRequest): number {
        let confidence = 0.8; // base confidence

        // Lower confidence for vague responses
        if (response.includes('I\'m not sure') || response.includes('might be') || response.includes('possibly')) {
            confidence -= 0.2;
        }

        // Higher confidence for specific solutions
        if (response.includes('step') || response.includes('follow these') || response.includes('solution')) {
            confidence += 0.1;
        }

        // Lower confidence for complex technical issues
        if (request.category === 'technical_support' || request.category === 'bug_report') {
            confidence -= 0.1;
        }

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    private shouldEscalate(response: string, request: SupportRequest, confidence: number): boolean {
        // Escalate if confidence is too low
        if (confidence < 0.4) return true;

        // Escalate critical issues
        if (request.urgency === 'critical') return true;

        // Escalate billing/payment issues
        if (request.category === 'billing_payment') return true;

        // Escalate if response suggests human intervention
        if (response.toLowerCase().includes('contact support') ||
            response.toLowerCase().includes('human agent') ||
            response.toLowerCase().includes('escalate')) {
            return true;
        }

        return false;
    }

    private async generateSuggestedActions(request: SupportRequest): Promise<string[]> {
        const actions: string[] = [];

        switch (request.category) {
            case 'account_management':
                actions.push('Check account settings', 'Update profile information', 'Review security settings');
                break;
            case 'billing_payment':
                actions.push('Review billing history', 'Update payment method', 'Contact billing support');
                break;
            case 'technical_support':
                actions.push('Clear browser cache', 'Try different browser', 'Check internet connection');
                break;
            case 'product_creation':
                actions.push('Review creation guide', 'Check template library', 'Try different approach');
                break;
            default:
                actions.push('Check FAQ', 'Review documentation', 'Contact support if needed');
        }

        return actions;
    }

    private generateFollowUpQuestions(request: SupportRequest): string[] {
        const questions: string[] = [];

        switch (request.category) {
            case 'technical_support':
                questions.push(
                    'What browser are you using?',
                    'When did this issue first occur?',
                    'Have you tried refreshing the page?'
                );
                break;
            case 'product_creation':
                questions.push(
                    'What type of product are you trying to create?',
                    'Are you following a specific template?',
                    'What step are you having trouble with?'
                );
                break;
            case 'billing_payment':
                questions.push(
                    'What payment method are you using?',
                    'When was your last successful payment?',
                    'Are you seeing any error messages?'
                );
                break;
            default:
                questions.push(
                    'Can you provide more details about the issue?',
                    'Is this the first time you\'ve encountered this?'
                );
        }

        return questions;
    }

    private async findRelatedArticles(request: SupportRequest) {
        // Mock implementation - in real app, this would search a knowledge base
        const articles = [
            {
                title: 'Getting Started Guide',
                url: '/help/getting-started',
                relevance: 0.8
            },
            {
                title: 'Troubleshooting Common Issues',
                url: '/help/troubleshooting',
                relevance: 0.7
            },
            {
                title: 'Account Management FAQ',
                url: '/help/account-faq',
                relevance: 0.6
            }
        ];

        return articles.filter(article => article.relevance > 0.5);
    }

    private estimateResolutionTime(request: SupportRequest): string {
        switch (request.urgency) {
            case 'critical':
                return 'Within 1 hour';
            case 'high':
                return 'Within 4 hours';
            case 'medium':
                return 'Within 24 hours';
            case 'low':
                return 'Within 2-3 business days';
            default:
                return 'Within 24 hours';
        }
    }

    private handleError(error: unknown, request: SupportRequest): SupportResponse {
        console.error('Support agent error:', error);

        return {
            success: false,
            message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment, or contact our support team directly for immediate assistance.',
            category: 'technical_support',
            confidence: 0.1,
            escalationRequired: true,
            sessionId: request.sessionId,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            metadata: {
                urgency: request.urgency || 'medium',
                processingTime: 0,
                model: this.model,
                category: 'error'
            }
        };
    }
}