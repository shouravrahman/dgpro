import { NextRequest, NextResponse } from 'next/server';
import { AIInfrastructure } from '@/lib/ai/ai-infrastructure';

export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const infrastructure = AIInfrastructure.getInstance();

        const session = infrastructure.getStreamSession(sessionId);

        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Stream session not found'
            }, { status: 404 });
        }

        if (!session.isActive) {
            return NextResponse.json({
                success: false,
                error: 'Stream session is not active'
            }, { status: 410 });
        }

        // Return Server-Sent Events stream
        const streamManager = (infrastructure as any).streamManager;
        return streamManager.createServerSentEventStream(sessionId);

    } catch (error) {
        console.error('Stream access failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Stream access failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const { agentId, userId, metadata } = await request.json();

        const infrastructure = AIInfrastructure.getInstance();

        // Create new stream session
        const { sessionId: newSessionId, stream } = infrastructure.createStream(
            agentId,
            userId,
            metadata
        );

        return NextResponse.json({
            success: true,
            data: {
                sessionId: newSessionId,
                agentId,
                userId,
                metadata,
                createdAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Stream creation failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Stream creation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const infrastructure = AIInfrastructure.getInstance();

        const streamManager = (infrastructure as any).streamManager;
        streamManager.closeStream(sessionId);

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                closedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Stream closure failed:', error);

        return NextResponse.json({
            success: false,
            error: 'Stream closure failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}