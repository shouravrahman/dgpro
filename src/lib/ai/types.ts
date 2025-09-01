// AI Agent Infrastructure Types
export interface AIModel {
    name: string;
    provider: 'gemini' | 'openai' | 'anthropic';
    version: string;
    maxTokens: number;
    costPerToken: number;
    capabilities: string[];
}

export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    primaryModel: string;
    fallbackModels: string[];
    maxRetries: number;
    timeout: number;
    cacheEnabled: boolean;
    cacheTTL: number;
    rateLimitPerMinute: number;
}

export interface AgentRequest {
    id: string;
    agentId: string;
    input: any;
    context?: Record<string, any>;
    priority: 'low' | 'normal' | 'high' | 'critical';
    streaming?: boolean;
    userId?: string;
    sessionId?: string;
}

export interface AgentResponse {
    id: string;
    agentId: string;
    requestId: string;
    output: any;
    model: string;
    tokensUsed: number;
    cost: number;
    duration: number;
    cached: boolean;
    error?: string;
    timestamp: Date;
}

export interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: Date | null;
    nextAttemptTime: Date | null;
}

export interface QueueJob {
    id: string;
    type: string;
    data: any;
    priority: number;
    attempts: number;
    maxAttempts: number;
    delay: number;
    createdAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    error?: string;
}

export interface AgentMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    totalCost: number;
    cacheHitRate: number;
    circuitBreakerTrips: number;
}

export interface StreamingResponse {
    id: string;
    chunk: string;
    isComplete: boolean;
    metadata?: Record<string, any>;
}

export type AgentEventType =
    | 'request_started'
    | 'request_completed'
    | 'request_failed'
    | 'model_switched'
    | 'circuit_breaker_opened'
    | 'circuit_breaker_closed'
    | 'cache_hit'
    | 'cache_miss';

export interface AgentEvent {
    type: AgentEventType;
    agentId: string;
    requestId?: string;
    data: Record<string, any>;
    timestamp: Date;
}