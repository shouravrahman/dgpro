import { NextRequest, NextResponse } from 'next/server';
import { AIInfrastructure } from '@/lib/ai/ai-infrastructure';
import { z } from 'zod';

const ExecuteRequestSchema = z.object({
    agentType: z.string(),
    input: z.any(),
    options: z.object({
        priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
        streaming: z.boolean().optional(),
        context: z.record(z.any()).optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional()
    }).optional()
});

const QueueRequestSchema = z.object({
    agentType: z.string(),
    input: z.any(),
    options: z.object({
        priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
        context: z.record(z.any()).optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional()
    }).optional()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentType, input, options = {} } = ExecuteRequestSchema.parse(body);

        const infrastructure = AIInfrastructure.getInstance();

        const response = await infrastructure.executeAgent(agentType, input, options);

        return NextResponse.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Agent execution failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request format',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Agent execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentType, input, options = {} } = QueueRequestSchema.parse(body);

        const infrastructure = AIInfrastructure.getInstance();

        const jobId = await infrastructure.queueAgentRequest(agentType, input, options);

        return NextResponse.json({
            success: true,
            data: { jobId },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Agent queueing failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request format',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Agent queueing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}