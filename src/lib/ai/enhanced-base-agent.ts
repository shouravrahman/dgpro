import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentConfig, AgentRequest, AgentResponse, AIModel } from './types';
import { ModelRegistry } from './models/model-registry';
import { AICache } from './cache/ai-cache';
import { CircuitBreaker } from './circuit-breaker/circuit-breaker';
import { AgentMonitor } from './monitoring/agent-monitor';
import { StreamManager } from './streaming/stream-manager';
import { JobQueue } from './queue/job-queue';

export interface EnhancedAgentConfig extends AgentConfig {
    dependencies?: Record<string, unknown>;
    enableStreaming?: boolean;
    enableQueue?: boolean;
}

export abstract class EnhancedBaseAgent {
    protected genAI: GoogleGenerativeAI;
    protected config: EnhancedAgentConfig;
    protected modelRegistry: ModelRegistry;
    protected cache: AICache;
    protected circuitBreaker: CircuitBreaker;
    protected monitor: AgentMonitor;
    protected streamManager: StreamManager;
    protected queue?: JobQueue;
    protected dependencies: Record<string, unknown>;

    constructor(config: EnhancedAgentConfig) {
        this.config = {
            maxRetries: 3,
            timeout: 30000,
            cacheEnabled: true,
            cacheTTL: 3600,
            rateLimitPerMinute: 60,
            enableStreaming: false,
            enableQueue: false,
            ...config
        };

        // Initialize AI client
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

        // Initialize infrastructure components
        this.modelRegistry = ModelRegistry.getInstance();
        this.cache = AICache.getInstance();
        this.monitor = AgentMonitor.getInstance();
        this.streamManager = StreamManager.getInstance();

        // Initialize circuit breaker
        this.circuitBreaker = new CircuitBreaker(
            `agent-${this.config.id}`,
            {
                failureThreshold: 5,
                resetTimeout: 60000,
                monitoringPeriod: 300000,
                halfOpenMaxCalls: 3
            }
        );

        // Initialize job queue if enabled
        if (this.config.enableQueue) {
            this.queue = new JobQueue({
                maxConcurrency: 3,
                defaultDelay: 0,
                maxRetries: this.config.maxRetries,
                retryDelay: 1000,
                jobTimeout: this.config.timeout
            });
            this.setupQueueProcessors();
        }

        // Inject dependencies
        this.dependencies = this.config.dependencies || {};
    }

    public async processRequest(request: AgentRequest): Promise<AgentResponse> {
        const startTime = Date.now();

        this.monitor.recordEvent('request_started', this.config.id, {
            requestId: request.id,
            priority: request.priority,
            streaming: request.streaming
        }, request.id);

        try {
            // Check cache first if enabled
            if (this.config.cacheEnabled) {
                const cacheKey = this.cache.generateKey(
                    this.config.id,
                    request.input,
                    this.config.primaryModel,
                    request.context
                );

                const cachedResult = await this.cache.get(cacheKey);
                if (cachedResult) {
                    this.monitor.recordEvent('cache_hit', this.config.id, {
                        requestId: request.id,
                        cacheKey
                    }, request.id);

                    return {
                        ...cachedResult,
                        id: this.generateResponseId(),
                        requestId: request.id,
                        cached: true,
                        timestamp: new Date()
                    };
                } else {
                    this.monitor.recordEvent('cache_miss', this.config.id, {
                        requestId: request.id,
                        cacheKey
                    }, request.id);
                }
            }

            // Process with circuit breaker and model fallback
            const response = await this.circuitBreaker.execute(
                () => this.executeWithModelFallback(request),
                () => this.getFallbackResponse(request)
            );

            // Cache the response if enabled
            if (this.config.cacheEnabled && response && !response.error) {
                const cacheKey = this.cache.generateKey(
                    this.config.id,
                    request.input,
                    response.model,
                    request.context
                );

                await this.cache.set(cacheKey, response, this.config.cacheTTL, {
                    agentId: this.config.id,
                    model: response.model,
                    tokensUsed: response.tokensUsed,
                    cost: response.cost
                });
            }

            const duration = Date.now() - startTime;

            this.monitor.recordEvent('request_completed', this.config.id, {
                requestId: request.id,
                responseTime: duration,
                tokensUsed: response.tokensUsed,
                cost: response.cost,
                model: response.model
            }, request.id);

            return response;

        } catch (error) {
            const duration = Date.now() - startTime;

            this.monitor.recordEvent('request_failed', this.config.id, {
                requestId: request.id,
                error: (error as Error).message,
                responseTime: duration
            }, request.id);

            throw error;
        }
    }

    private async executeWithModelFallback(request: AgentRequest): Promise<AgentResponse> {
        const models = [this.config.primaryModel, ...this.config.fallbackModels];
        let lastError: Error | null = null;

        for (const modelName of models) {
            try {
                const model = this.modelRegistry.getModel(modelName);
                if (!model) {
                    throw new Error(`Model ${modelName} not found in registry`);
                }

                if (request.streaming && this.config.enableStreaming) {
                    return await this.processStreamingRequest(request, model);
                } else {
                    return await this.processStandardRequest(request, model);
                }

            } catch (error) {
                lastError = error as Error;

                if (modelName !== this.config.primaryModel) {
                    this.monitor.recordEvent('model_switched', this.config.id, {
                        requestId: request.id,
                        fromModel: this.config.primaryModel,
                        toModel: modelName,
                        reason: lastError.message
                    }, request.id);
                }

                // If this is the last model, throw the error
                if (modelName === models[models.length - 1]) {
                    throw lastError;
                }
            }
        }

        throw lastError || new Error('All models failed');
    }

    private async processStandardRequest(
        request: AgentRequest,
        model: AIModel
    ): Promise<AgentResponse> {
        const startTime = Date.now();

        try {
            const geminiModel = this.genAI.getGenerativeModel({
                model: model.name,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: Math.min(model.maxTokens, 4000),
                }
            });

            const prompt = this.buildPrompt(request.input, request.context);
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;

            const content = response.text();
            const tokensUsed = this.estimateTokens(prompt + content);
            const cost = tokensUsed * model.costPerToken;

            return {
                id: this.generateResponseId(),
                agentId: this.config.id,
                requestId: request.id,
                output: await this.processOutput(content, request),
                model: model.name,
                tokensUsed,
                cost,
                duration: Date.now() - startTime,
                cached: false,
                timestamp: new Date()
            };

        } catch (error) {
            throw new Error(`Model ${model.name} failed: ${(error as Error).message}`);
        }
    }

    private async processStreamingRequest(
        request: AgentRequest,
        model: AIModel
    ): Promise<AgentResponse> {
        const { sessionId, stream } = this.streamManager.createStream(
            this.config.id,
            request.userId,
            { requestId: request.id, model: model.name }
        );

        try {
            const geminiModel = this.genAI.getGenerativeModel({
                model: model.name,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: Math.min(model.maxTokens, 4000),
                }
            });

            const prompt = this.buildPrompt(request.input, request.context);
            const result = await geminiModel.generateContentStream(prompt);

            let fullContent = '';
            let tokensUsed = 0;

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullContent += chunkText;

                this.streamManager.writeToStream(sessionId, chunkText, false);
            }

            // Mark stream as complete
            this.streamManager.writeToStream(sessionId, '', true);

            tokensUsed = this.estimateTokens(prompt + fullContent);
            const cost = tokensUsed * model.costPerToken;

            return {
                id: this.generateResponseId(),
                agentId: this.config.id,
                requestId: request.id,
                output: {
                    content: fullContent,
                    streamSessionId: sessionId
                },
                model: model.name,
                tokensUsed,
                cost,
                duration: 0, // Streaming duration is different
                cached: false,
                timestamp: new Date()
            };

        } catch (error) {
            this.streamManager.closeStream(sessionId, error as Error);
            throw error;
        }
    }

    private async getFallbackResponse(request: AgentRequest): Promise<AgentResponse> {
        // Provide a basic fallback response when all models fail
        return {
            id: this.generateResponseId(),
            agentId: this.config.id,
            requestId: request.id,
            output: await this.getEmergencyFallback(request),
            model: 'fallback',
            tokensUsed: 0,
            cost: 0,
            duration: 0,
            cached: false,
            error: 'All models unavailable, using fallback response',
            timestamp: new Date()
        };
    }

    private setupQueueProcessors(): void {
        if (!this.queue) return;

        this.queue.process('agent-request', async (job) => {
            const request = job.data as AgentRequest;
            return await this.processRequest(request);
        });

        this.queue.start();
    }

    public async queueRequest(request: AgentRequest): Promise<string> {
        if (!this.config.enableQueue || !this.queue) {
            throw new Error('Queue not enabled for this agent');
        }

        const priority = this.getPriorityValue(request.priority);
        return await this.queue.add('agent-request', request, {
            priority,
            id: request.id
        });
    }

    private getPriorityValue(priority: AgentRequest['priority']): number {
        switch (priority) {
            case 'critical': return 100;
            case 'high': return 75;
            case 'normal': return 50;
            case 'low': return 25;
            default: return 50;
        }
    }

    protected buildPrompt(input: unknown, context?: Record<string, unknown>): string {
        let prompt = '';

        if (this.config.description) {
            prompt += `You are ${this.config.description}\n\n`;
        }

        if (context) {
            prompt += `Context: ${JSON.stringify(context, null, 2)}\n\n`;
        }

        prompt += `Request: ${typeof input === 'string' ? input : JSON.stringify(input)}`;

        return prompt;
    }

    private estimateTokens(text: string): number {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }

    private generateResponseId(): string {
        return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Abstract methods that must be implemented by concrete agents
    protected abstract processOutput(content: string, request: AgentRequest): Promise<unknown>;
    protected abstract getEmergencyFallback(request: AgentRequest): Promise<unknown>;

    // Public interface for concrete agents
    public abstract process(input: unknown, context?: Record<string, unknown>): Promise<unknown>;

    // Utility methods for concrete agents
    protected getDependency<T>(name: string): T {
        const dependency = this.dependencies[name];
        if (!dependency) {
            throw new Error(`Dependency '${name}' not found`);
        }
        return dependency as T;
    }

    public getMetrics(): unknown {
        return this.monitor.getMetrics(this.config.id);
    }

    public getHealth(): unknown {
        return this.monitor.getAgentHealth(this.config.id);
    }

    public clearCache(): void {
        this.cache.invalidateByAgent(this.config.id);
    }
}