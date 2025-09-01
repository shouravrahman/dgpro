import { StreamingResponse } from '../types';
import { EventEmitter } from 'events';

export interface StreamSession {
    id: string;
    agentId: string;
    userId?: string;
    startTime: Date;
    lastActivity: Date;
    isActive: boolean;
    metadata: Record<string, any>;
}

export class StreamManager extends EventEmitter {
    private static instance: StreamManager;
    private sessions: Map<string, StreamSession> = new Map();
    private streams: Map<string, ReadableStream> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    private constructor() {
        super();

        // Clean up inactive sessions every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 60000);
    }

    public static getInstance(): StreamManager {
        if (!StreamManager.instance) {
            StreamManager.instance = new StreamManager();
        }
        return StreamManager.instance;
    }

    public createStream(
        agentId: string,
        userId?: string,
        metadata: Record<string, any> = {}
    ): { sessionId: string; stream: ReadableStream } {
        const sessionId = this.generateSessionId();

        const session: StreamSession = {
            id: sessionId,
            agentId,
            userId,
            startTime: new Date(),
            lastActivity: new Date(),
            isActive: true,
            metadata
        };

        this.sessions.set(sessionId, session);

        let controller: ReadableStreamDefaultController;

        const stream = new ReadableStream({
            start(ctrl) {
                controller = ctrl;
            },
            cancel() {
                // Clean up when stream is cancelled
                session.isActive = false;
            }
        });

        this.streams.set(sessionId, stream);

        // Store controller for writing to stream
        (stream as any)._controller = controller;

        this.emit('stream:created', session);

        return { sessionId, stream };
    }

    public writeToStream(
        sessionId: string,
        chunk: string,
        isComplete: boolean = false,
        metadata?: Record<string, any>
    ): boolean {
        const session = this.sessions.get(sessionId);
        const stream = this.streams.get(sessionId);

        if (!session || !stream || !session.isActive) {
            return false;
        }

        session.lastActivity = new Date();

        const response: StreamingResponse = {
            id: this.generateChunkId(),
            chunk,
            isComplete,
            metadata
        };

        try {
            const controller = (stream as any)._controller;
            if (controller) {
                const encoder = new TextEncoder();
                const data = encoder.encode(`data: ${JSON.stringify(response)}\n\n`);
                controller.enqueue(data);

                if (isComplete) {
                    controller.close();
                    session.isActive = false;
                    this.emit('stream:completed', session);
                }

                this.emit('stream:chunk', session, response);
                return true;
            }
        } catch (error) {
            console.error('Error writing to stream:', error);
            this.closeStream(sessionId, error as Error);
        }

        return false;
    }

    public closeStream(sessionId: string, error?: Error): void {
        const session = this.sessions.get(sessionId);
        const stream = this.streams.get(sessionId);

        if (session) {
            session.isActive = false;

            if (error) {
                this.emit('stream:error', session, error);
            } else {
                this.emit('stream:closed', session);
            }
        }

        if (stream) {
            try {
                const controller = (stream as any)._controller;
                if (controller && !controller.desiredSize === null) {
                    if (error) {
                        controller.error(error);
                    } else {
                        controller.close();
                    }
                }
            } catch (e) {
                // Stream might already be closed
            }
        }

        this.streams.delete(sessionId);
    }

    public getSession(sessionId: string): StreamSession | undefined {
        return this.sessions.get(sessionId);
    }

    public getActiveSessions(agentId?: string, userId?: string): StreamSession[] {
        const sessions = Array.from(this.sessions.values()).filter(s => s.isActive);

        if (agentId) {
            return sessions.filter(s => s.agentId === agentId);
        }

        if (userId) {
            return sessions.filter(s => s.userId === userId);
        }

        return sessions;
    }

    public createServerSentEventStream(
        sessionId: string
    ): Response {
        const stream = this.streams.get(sessionId);

        if (!stream) {
            return new Response('Stream not found', { status: 404 });
        }

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            }
        });
    }

    public async streamFromAsyncGenerator<T>(
        sessionId: string,
        generator: AsyncGenerator<T>,
        transform?: (item: T) => string
    ): Promise<void> {
        try {
            for await (const item of generator) {
                const chunk = transform ? transform(item) : String(item);

                if (!this.writeToStream(sessionId, chunk)) {
                    break; // Stream was closed
                }
            }

            this.writeToStream(sessionId, '', true); // Mark as complete
        } catch (error) {
            this.closeStream(sessionId, error as Error);
        }
    }

    private cleanupInactiveSessions(): void {
        const now = new Date();
        const timeout = 5 * 60 * 1000; // 5 minutes

        for (const [sessionId, session] of this.sessions) {
            if (!session.isActive || (now.getTime() - session.lastActivity.getTime()) > timeout) {
                this.closeStream(sessionId);
                this.sessions.delete(sessionId);
            }
        }
    }

    private generateSessionId(): string {
        return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateChunkId(): string {
        return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    public getStats(): {
        totalSessions: number;
        activeSessions: number;
        totalStreams: number;
        sessionsByAgent: Record<string, number>;
    } {
        const sessions = Array.from(this.sessions.values());
        const activeSessions = sessions.filter(s => s.isActive);

        const sessionsByAgent: Record<string, number> = {};
        for (const session of activeSessions) {
            sessionsByAgent[session.agentId] = (sessionsByAgent[session.agentId] || 0) + 1;
        }

        return {
            totalSessions: sessions.length,
            activeSessions: activeSessions.length,
            totalStreams: this.streams.size,
            sessionsByAgent
        };
    }

    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Close all active streams
        for (const sessionId of this.streams.keys()) {
            this.closeStream(sessionId);
        }

        this.sessions.clear();
        this.streams.clear();
    }
}