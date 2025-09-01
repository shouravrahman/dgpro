import { NextRequest, NextResponse } from 'next/server';
import { AIInfrastructure } from '@/lib/ai/ai-infrastructure';

export async function GET(request: NextRequest) {
    try {
        const infrastructure = AIInfrastructure.getInstance();
        const health = infrastructure.getSystemHealth();

        return NextResponse.json({
            success: true,
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { agentType } = await request.json();
        const infrastructure = AIInfrastructure.getInstance();

        if (agentType) {
            const agentHealth = infrastructure.getAgentHealth(agentType);
            return NextResponse.json({
                success: true,
                data: agentHealth,
                timestamp: new Date().toISOString()
            });
        }

        const systemHealth = infrastructure.getSystemHealth();
        return NextResponse.json({
            success: true,
            data: systemHealth,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Agent health check failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Agent health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}