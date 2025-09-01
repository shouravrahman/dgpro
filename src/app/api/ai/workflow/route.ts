import { NextRequest, NextResponse } from 'next/server';
import { AIInfrastructure } from '@/lib/ai/ai-infrastructure';
import { z } from 'zod';

const WorkflowStepSchema = z.object({
    agentType: z.string(),
    input: z.any(),
    dependsOn: z.array(z.string()).optional(),
    options: z.object({
        priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
        context: z.record(z.any()).optional()
    }).optional()
});

const WorkflowRequestSchema = z.object({
    workflow: z.array(WorkflowStepSchema),
    metadata: z.record(z.any()).optional()
});

const PredefinedWorkflowSchema = z.object({
    type: z.enum(['product-analysis', 'product-creation']),
    input: z.any(),
    options: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Check if it's a predefined workflow
        if (body.type) {
            return await handlePredefinedWorkflow(body);
        }

        // Handle custom workflow
        const { workflow, metadata } = WorkflowRequestSchema.parse(body);

        const infrastructure = AIInfrastructure.getInstance();

        const results = await infrastructure.executeWorkflow(workflow);

        // Convert Map to object for JSON serialization
        const resultsObject = Object.fromEntries(results);

        return NextResponse.json({
            success: true,
            data: {
                results: resultsObject,
                metadata,
                executedSteps: workflow.length,
                completedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Workflow execution failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid workflow format',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Workflow execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

async function handlePredefinedWorkflow(body: any) {
    try {
        const { type, input, options } = PredefinedWorkflowSchema.parse(body);

        const infrastructure = AIInfrastructure.getInstance();
        let results: Map<string, any>;

        switch (type) {
            case 'product-analysis':
                results = await AIInfrastructure.createProductAnalysisWorkflow(infrastructure, input);
                break;

            case 'product-creation':
                results = await AIInfrastructure.createProductCreationWorkflow(infrastructure, input);
                break;

            default:
                throw new Error(`Unknown workflow type: ${type}`);
        }

        // Convert Map to object for JSON serialization
        const resultsObject = Object.fromEntries(results);

        return NextResponse.json({
            success: true,
            data: {
                type,
                results: resultsObject,
                options,
                completedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Predefined workflow execution failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid predefined workflow format',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Predefined workflow execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const infrastructure = AIInfrastructure.getInstance();
        const stats = infrastructure.getAgentStats();

        return NextResponse.json({
            success: true,
            data: {
                agentStats: stats,
                availableWorkflows: [
                    {
                        type: 'product-analysis',
                        description: 'Scrape, analyze, and predict market trends for a product',
                        steps: ['scraper', 'analyzer', 'predictor']
                    },
                    {
                        type: 'product-creation',
                        description: 'Analyze requirements and create a new product',
                        steps: ['analyzer', 'creator']
                    }
                ]
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Workflow info retrieval failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve workflow information',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}