import { NextRequest, NextResponse } from 'next/server';
import { SupportAgent } from '@/lib/ai/agents/support-agent';
import type { SupportRequest } from '@/lib/ai/agents/support-agent';
import { rateLimit } from '@/lib/utils/rate-limit';
import { validateApiKey } from '@/lib/auth/api-validation';

const supportAgent = new SupportAgent();

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await rateLimit(request, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 30, // 30 requests per minute
            keyGenerator: (req) => {
                const forwarded = req.headers.get('x-forwarded-for');
                const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
                return `support_${ip}`;
            }
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    retryAfter: rateLimitResult.retryAfter
                },
                { status: 429 }
            );
        }

        // Validate API key or authentication
        const authResult = await validateApiKey(request);
        if (!authResult.valid) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate request body
        if (!body.message || typeof body.message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required and must be a string' },
                { status: 400 }
            );
        }

        if (!body.sessionId || typeof body.sessionId !== 'string') {
            return NextResponse.json(
                { error: 'Session ID is required and must be a string' },
                { status: 400 }
            );
        }

        // Sanitize and prepare request
        const supportRequest: SupportRequest = {
            message: body.message.trim(),
            sessionId: body.sessionId,
            timestamp: new Date(),
            userId: authResult.userId,
            conversationHistory: body.conversationHistory || [],
            userContext: body.userContext || {},
            urgency: body.urgency,
            category: body.category
        };

        // Process the support request
        const response = await supportAgent.processRequest(supportRequest);

        // Log the interaction for analytics
        console.log('Support interaction:', {
            sessionId: supportRequest.sessionId,
            userId: supportRequest.userId,
            category: response.category,
            urgency: response.metadata?.urgency,
            escalated: response.escalationRequired,
            confidence: response.confidence,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('Support API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Validate API key
        const authResult = await validateApiKey(request);
        if (!authResult.valid) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Return support agent capabilities and status
        return NextResponse.json({
            agent: 'support',
            version: '1.0.0',
            capabilities: [
                'customer_support',
                'issue_resolution',
                'escalation_management',
                'conversation_history',
                'multi_language_support',
                'urgency_detection',
                'category_classification'
            ],
            supportedCategories: [
                'account_management',
                'billing_payment',
                'technical_support',
                'product_creation',
                'marketplace_issues',
                'general_inquiry',
                'bug_report',
                'feature_request'
            ],
            urgencyLevels: ['low', 'medium', 'high', 'critical'],
            status: 'operational',
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Support API GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}