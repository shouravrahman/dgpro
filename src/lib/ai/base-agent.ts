/**
 * Base AI Agent Infrastructure
 * Provides foundation for all AI agents with error handling, caching, and monitoring
 */

export interface AgentConfig {
    name: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    retryAttempts?: number;
    cacheEnabled?: boolean;
    cacheTTL?: number;
}

export interface AgentContext {
    userId?: string;
    sessionId?: string;
    userPreferences?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface AgentResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        tokensUsed?: number;
        processingTime?: number;
        cacheHit?: boolean;
        confidence?: number;
        model?: string;
    };
}

export abstract class BaseAgent {
    protected config: AgentConfig;
    protected context: AgentContext;

    constructor(config: AgentConfig, context: AgentContext = {}) {
        this.config = {
            temperature: 0.7,
            maxTokens: 2000,
            timeout: 30000,
            retryAttempts: 3,
            cacheEnabled: true,
            cacheTTL: 3600,
            ...config,
        };
        this.context = context;
    }

    /**
     * Abstract method that each agent must implement
     */
    abstract execute(input: any): Promise<AgentResponse>;

    /**
     * Validate input before processing
     */
    protected validateInput(input: any): boolean {
        return input !== null && input !== undefined;
    }

    /**
     * Generate cache key for the input
     */
    protected generateCacheKey(input: any): string {
        const inputHash = this.hashObject(input);
        return `agent:${this.config.name}:${inputHash}`;
    }

    /**
     * Simple hash function for objects
     */
    private hashObject(obj: any): string {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Execute with retry logic
     */
    protected async executeWithRetry<T>(
        operation: () => Promise<T>,
        attempts: number = this.config.retryAttempts || 3
    ): Promise<T> {
        let lastError: Error;

        for (let i = 0; i < attempts; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                if (i < attempts - 1) {
                    const delay = Math.pow(2, i) * 1000;
                    await this.sleep(delay);
                }
            }
        }

        throw lastError!;
    }

    /**
     * Check if error should not be retried
     */
    private isNonRetryableError(error: any): boolean {
        // Add logic for non-retryable errors (e.g., authentication, validation)
        const nonRetryableCodes = ['INVALID_API_KEY', 'QUOTA_EXCEEDED', 'INVALID_INPUT'];
        return nonRetryableCodes.includes(error.code);
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log agent activity
     */
    protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            agent: this.config.name,
            level,
            message,
            data,
            context: this.context,
        };

        // In production, send to logging service
        console.log(JSON.stringify(logEntry));
    }

    /**
     * Track performance metrics
     */
    protected trackMetrics(operation: string, duration: number, metadata?: any): void {
        const metrics = {
            agent: this.config.name,
            operation,
            duration,
            timestamp: new Date().toISOString(),
            ...metadata,
        };

        // In production, send to analytics service
        console.log('METRICS:', metrics);
    }
}

/**
 * Agent Factory for creating and managing agents
 */
export class AgentFactory {
    private static agents: Map<string, typeof BaseAgent> = new Map();

    static register(name: string, agentClass: typeof BaseAgent): void {
        this.agents.set(name, agentClass);
    }

    static create(name: string, config: AgentConfig, context: AgentContext = {}): BaseAgent {
        const AgentClass = this.agents.get(name);
        if (!AgentClass) {
            throw new Error(`Agent '${name}' not found. Available agents: ${Array.from(this.agents.keys()).join(', ')}`);
        }

        return new AgentClass(config, context);
    }

    static getAvailableAgents(): string[] {
        return Array.from(this.agents.keys());
    }
}

/**
 * Agent Manager for orchestrating multiple agents
 */
export class AgentManager {
    private agents: Map<string, BaseAgent> = new Map();

    addAgent(name: string, agent: BaseAgent): void {
        this.agents.set(name, agent);
    }

    async executeAgent(name: string, input: any): Promise<AgentResponse> {
        const agent = this.agents.get(name);
        if (!agent) {
            return {
                success: false,
                error: `Agent '${name}' not found`,
            };
        }

        const startTime = Date.now();
        try {
            const result = await agent.execute(input);
            const processingTime = Date.now() - startTime;

            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    processingTime,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    processingTime: Date.now() - startTime,
                },
            };
        }
    }

    async executeParallel(requests: Array<{ agent: string; input: any }>): Promise<AgentResponse[]> {
        const promises = requests.map(req => this.executeAgent(req.agent, req.input));
        return Promise.all(promises);
    }

    async executeSequential(requests: Array<{ agent: string; input: any }>): Promise<AgentResponse[]> {
        const results: AgentResponse[] = [];

        for (const req of requests) {
            const result = await this.executeAgent(req.agent, req.input);
            results.push(result);

            // Stop on first failure if needed
            if (!result.success) {
                break;
            }
        }

        return results;
    }
}

/**
 * Cache interface for agent responses
 */
export interface AgentCache {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}

/**
 * Simple in-memory cache implementation
 */
export class MemoryCache implements AgentCache {
    private cache: Map<string, { value: any; expires: number }> = new Map();

    async get(key: string): Promise<any> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        const expires = Date.now() + (ttl * 1000);
        this.cache.set(key, { value, expires });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
}

/**
 * Global agent cache instance
 */
export const agentCache = new MemoryCache();