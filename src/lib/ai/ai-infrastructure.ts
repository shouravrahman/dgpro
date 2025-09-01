import { EnhancedBaseAgent, EnhancedAgentConfig } from './enhanced-base-agent';
import { AgentOrchestrator, OrchestrationConfig } from './orchestrator/agent-orchestrator';
import { ModelRegistry } from './models/model-registry';
import { AICache } from './cache/ai-cache';
import { AgentMonitor } from './monitoring/agent-monitor';
import { StreamManager } from './streaming/stream-manager';
import { LangChainIntegration, LangChainConfig } from './langchain/langchain-integration';
import { AgentRequest, AgentResponse, AIModel } from './types';

export interface AIInfrastructureConfig {
    orchestration?: Partial<OrchestrationConfig>;
    defaultLangChain?: LangChainConfig;
    enableGlobalCache?: boolean;
    enableGlobalMonitoring?: boolean;
    enableStreaming?: boolean;
}

export class AIInfrastructure {
    private static instance: AIInfrastructure;
    private orchestrator: AgentOrchestrator;
    private modelRegistry: ModelRegistry;
    private cache: AICache;
    private monitor: AgentMonitor;
    private streamManager: StreamManager;
    private langChainIntegration?: LangChainIntegration;
    private config: AIInfrastructureConfig;
    private agentClasses: Map<string, new (config: EnhancedAgentConfig) => EnhancedBaseAgent> = new Map();

    private constructor(config: AIInfrastructureConfig = {}) {
        this.config = {
            enableGlobalCache: true,
            enableGlobalMonitoring: true,
            enableStreaming: true,
            ...config
        };

        this.initializeInfrastructure();
    }

    public static getInstance(config?: AIInfrastructureConfig): AIInfrastructure {
        if (!AIInfrastructure.instance) {
            AIInfrastructure.instance = new AIInfrastructure(config);
        }
        return AIInfrastructure.instance;
    }

    private initializeInfrastructure(): void {
        // Initialize core components
        this.modelRegistry = ModelRegistry.getInstance();

        if (this.config.enableGlobalCache) {
            this.cache = AICache.getInstance();
        }

        if (this.config.enableGlobalMonitoring) {
            this.monitor = AgentMonitor.getInstance();
        }

        if (this.config.enableStreaming) {
            this.streamManager = StreamManager.getInstance();
        }

        // Initialize orchestrator
        this.orchestrator = new AgentOrchestrator(this.config.orchestration);

        // Initialize LangChain if configured
        if (this.config.defaultLangChain) {
            this.langChainIntegration = new LangChainIntegration(this.config.defaultLangChain);
        }

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Monitor orchestrator events
        this.orchestrator.on('request:completed', (data) => {
            console.log('Request completed:', data);
        });

        this.orchestrator.on('request:failed', (data) => {
            console.error('Request failed:', data);
        });

        this.orchestrator.on('instance:unhealthy', (data) => {
            console.warn('Agent instance unhealthy:', data);
        });

        // Monitor system events
        if (this.monitor) {
            this.monitor.on('event', (event) => {
                if (event.type === 'circuit_breaker_opened') {
                    console.warn('Circuit breaker opened:', event);
                }
            });
        }
    }

    // Agent Management
    public registerAgentClass(
        agentType: string,
        agentClass: new (config: EnhancedAgentConfig) => EnhancedBaseAgent
    ): void {
        this.agentClasses.set(agentType, agentClass);
    }

    public createAgent(
        agentType: string,
        config: EnhancedAgentConfig,
        instances: number = 1
    ): void {
        const agentClass = this.agentClasses.get(agentType);
        if (!agentClass) {
            throw new Error(`Agent class '${agentType}' not registered`);
        }

        this.orchestrator.registerAgent(agentType, agentClass, config, instances);
    }

    public async executeAgent(
        agentType: string,
        input: unknown,
        options: {
            priority?: 'low' | 'normal' | 'high' | 'critical';
            streaming?: boolean;
            context?: Record<string, unknown>;
            userId?: string;
            sessionId?: string;
        } = {}
    ): Promise<AgentResponse> {
        const request: AgentRequest = {
            id: this.generateRequestId(),
            agentId: agentType,
            input,
            context: options.context,
            priority: options.priority || 'normal',
            streaming: options.streaming || false,
            userId: options.userId,
            sessionId: options.sessionId
        };

        return await this.orchestrator.executeAgent(agentType, request);
    }

    public async queueAgentRequest(
        agentType: string,
        input: unknown,
        options: {
            priority?: 'low' | 'normal' | 'high' | 'critical';
            context?: Record<string, unknown>;
            userId?: string;
            sessionId?: string;
        } = {}
    ): Promise<string> {
        const request: AgentRequest = {
            id: this.generateRequestId(),
            agentId: agentType,
            input,
            context: options.context,
            priority: options.priority || 'normal',
            streaming: false,
            userId: options.userId,
            sessionId: options.sessionId
        };

        const priorityValue = this.getPriorityValue(request.priority);
        return await this.orchestrator.queueAgentRequest(agentType, request, priorityValue);
    }

    // Workflow Execution
    public async executeWorkflow(
        workflow: Array<{
            agentType: string;
            input: unknown;
            dependsOn?: string[];
            transform?: (input: unknown, previousResults: Map<string, AgentResponse>) => unknown;
            options?: {
                priority?: 'low' | 'normal' | 'high' | 'critical';
                context?: Record<string, unknown>;
            };
        }>
    ): Promise<Map<string, AgentResponse>> {
        const workflowSteps = workflow.map(step => ({
            agentType: step.agentType,
            request: {
                id: this.generateRequestId(),
                agentId: step.agentType,
                input: step.input,
                context: step.options?.context,
                priority: step.options?.priority || 'normal',
                streaming: false
            } as AgentRequest,
            dependsOn: step.dependsOn,
            transform: step.transform
        }));

        return await this.orchestrator.executeWorkflow(workflowSteps);
    }

    // LangChain Integration
    public getLangChain(): LangChainIntegration {
        if (!this.langChainIntegration) {
            throw new Error('LangChain integration not initialized');
        }
        return this.langChainIntegration;
    }

    public createLangChainIntegration(config: LangChainConfig): LangChainIntegration {
        return new LangChainIntegration(config);
    }

    // Model Management
    public registerModel(model: AIModel): void {
        this.modelRegistry.registerModel(model);
    }

    public getModel(name: string): AIModel | undefined {
        return this.modelRegistry.getModel(name);
    }

    public getAllModels(): AIModel[] {
        return this.modelRegistry.getAllModels();
    }

    public getBestModelForTask(
        capabilities: string[],
        maxCost?: number,
        preferredProvider?: string
    ): AIModel | null {
        return this.modelRegistry.getBestModelForTask(capabilities, maxCost, preferredProvider);
    }

    // Streaming
    public createStream(
        agentId: string,
        userId?: string,
        metadata?: Record<string, unknown>
    ): { sessionId: string; stream: ReadableStream } {
        if (!this.streamManager) {
            throw new Error('Streaming not enabled');
        }
        return this.streamManager.createStream(agentId, userId, metadata);
    }

    public getStreamSession(sessionId: string) {
        if (!this.streamManager) {
            throw new Error('Streaming not enabled');
        }
        return this.streamManager.getSession(sessionId);
    }

    // Monitoring and Analytics
    public getSystemHealth(): {
        infrastructure: ReturnType<AgentOrchestrator['getSystemHealth']>;
        cache?: ReturnType<AICache['getStats']>;
        streaming?: ReturnType<StreamManager['getStats']>;
    } {
        const health: any = {
            infrastructure: this.orchestrator.getSystemHealth()
        };

        if (this.cache) {
            health.cache = this.cache.getStats();
        }

        if (this.streamManager) {
            health.streaming = this.streamManager.getStats();
        }

        return health;
    }

    public getAgentStats(): Record<string, unknown> {
        return this.orchestrator.getAgentStats();
    }

    public getAgentMetrics(agentId: string): unknown {
        if (!this.monitor) {
            throw new Error('Monitoring not enabled');
        }
        return this.monitor.getMetrics(agentId);
    }

    public getAgentHealth(agentId: string): unknown {
        if (!this.monitor) {
            throw new Error('Monitoring not enabled');
        }
        return this.monitor.getAgentHealth(agentId);
    }

    // Cache Management
    public async clearCache(agentId?: string): Promise<void> {
        if (!this.cache) {
            throw new Error('Cache not enabled');
        }

        if (agentId) {
            await this.cache.invalidateByAgent(agentId);
        } else {
            await this.cache.invalidate();
        }
    }

    public getCacheStats(): ReturnType<AICache['getStats']> {
        if (!this.cache) {
            throw new Error('Cache not enabled');
        }
        return this.cache.getStats();
    }

    // Scaling
    public async scaleAgent(agentType: string, targetInstances: number): Promise<void> {
        await this.orchestrator.scaleAgent(agentType, targetInstances);
    }

    // Utility Methods
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getPriorityValue(priority: 'low' | 'normal' | 'high' | 'critical'): number {
        switch (priority) {
            case 'critical': return 100;
            case 'high': return 75;
            case 'normal': return 50;
            case 'low': return 25;
            default: return 50;
        }
    }

    // Configuration
    public updateConfig(newConfig: Partial<AIInfrastructureConfig>): void {
        this.config = { ...this.config, ...newConfig };

        if (newConfig.defaultLangChain && this.langChainIntegration) {
            this.langChainIntegration.updateConfig(newConfig.defaultLangChain);
        }
    }

    public getConfig(): AIInfrastructureConfig {
        return { ...this.config };
    }

    // Cleanup
    public destroy(): void {
        this.orchestrator.destroy();

        if (this.cache) {
            this.cache.destroy();
        }

        if (this.streamManager) {
            this.streamManager.destroy();
        }

        AIInfrastructure.instance = null as any;
    }

    // Factory Methods for Common Patterns
    public static async createProductAnalysisWorkflow(
        infrastructure: AIInfrastructure,
        productData: unknown
    ): Promise<Map<string, AgentResponse>> {
        return await infrastructure.executeWorkflow([
            {
                agentType: 'scraper',
                input: productData,
                options: { priority: 'high' }
            },
            {
                agentType: 'analyzer',
                input: null, // Will be transformed
                dependsOn: ['scraper'],
                transform: (_, results) => {
                    const scraperResult = Array.from(results.values())[0];
                    return scraperResult.output;
                },
                options: { priority: 'high' }
            },
            {
                agentType: 'predictor',
                input: null, // Will be transformed
                dependsOn: ['analyzer'],
                transform: (_, results) => {
                    const analyzerResult = Array.from(results.values())[1];
                    return analyzerResult.output;
                },
                options: { priority: 'normal' }
            }
        ]);
    }

    public static async createProductCreationWorkflow(
        infrastructure: AIInfrastructure,
        requirements: unknown
    ): Promise<Map<string, AgentResponse>> {
        return await infrastructure.executeWorkflow([
            {
                agentType: 'analyzer',
                input: requirements,
                options: { priority: 'high' }
            },
            {
                agentType: 'creator',
                input: null, // Will be transformed
                dependsOn: ['analyzer'],
                transform: (_, results) => {
                    const analyzerResult = Array.from(results.values())[0];
                    return {
                        requirements,
                        analysis: analyzerResult.output
                    };
                },
                options: { priority: 'high' }
            }
        ]);
    }
}