import { EnhancedScraperAgent } from './agents/enhanced-scraper-agent';
import { AIInfrastructure } from './ai-infrastructure';
import { LangChainIntegration } from './langchain/langchain-integration';

// Core Infrastructure
export { AIInfrastructure } from './ai-infrastructure';
export { EnhancedBaseAgent } from './enhanced-base-agent';
export { AgentOrchestrator } from './orchestrator/agent-orchestrator';

// Types
export type {
    AIModel,
    AgentConfig,
    AgentRequest,
    AgentResponse,
    AgentMetrics,
    AgentEvent,
    AgentEventType,
    CircuitBreakerState,
    QueueJob,
    StreamingResponse
} from './types';

export type {
    EnhancedAgentConfig
} from './enhanced-base-agent';

export type {
    OrchestrationConfig,
    AgentInstance
} from './orchestrator/agent-orchestrator';

// Model Registry
export { ModelRegistry } from './models/model-registry';

// Caching
export { AICache } from './cache/ai-cache';
export type { CacheEntry } from './cache/ai-cache';

// Circuit Breaker
export { CircuitBreaker } from './circuit-breaker/circuit-breaker';
export type { CircuitBreakerConfig } from './circuit-breaker/circuit-breaker';

// Job Queue
export { JobQueue } from './queue/job-queue';
export type { QueueConfig } from './queue/job-queue';

// Monitoring
export { AgentMonitor } from './monitoring/agent-monitor';

// Streaming
export { StreamManager } from './streaming/stream-manager';
export type { StreamSession } from './streaming/stream-manager';

// LangChain Integration
export { LangChainIntegration } from './langchain/langchain-integration';
export type { LangChainConfig, RAGConfig } from './langchain/langchain-integration';

// Example Agents
export { EnhancedScraperAgent } from './agents/enhanced-scraper-agent';
export type { ScrapingRequest, ScrapingResult } from './agents/enhanced-scraper-agent';

// Analysis Agent
export { AnalysisAgent } from './agents/analysis-agent';
export type {
    ProductAnalysisRequest,
    ProductAnalysisResult,
    TrendDetectionResult,
    CompetitiveLandscapeResult,
    RecommendationResult
} from './agents/analysis-agent';

// Creation Agent
export { CreationAgent } from './agents/creation-agent';
export type {
    ProductCreationRequest,
    CreatedProduct,
    FileProcessingResult,
    TemplateGenerationResult
} from './agents/creation-agent';

// Prediction Agent
export { PredictionAgent } from './agents/prediction-agent';
export type {
    PredictionRequest,
    MarketTrendPrediction,
    OpportunityForecast,
    PredictionAnalysis
} from './agents/prediction-agent';

// Support Agent
export { SupportAgent } from './agents/support-agent';
export type {
    SupportRequest,
    SupportResponse,
    SupportMessage
} from './agents/support-agent';

// Utility Functions
export const createAIInfrastructure = (config?: Parameters<typeof AIInfrastructure.getInstance>[0]) => {
    return AIInfrastructure.getInstance(config);
};

export const createLangChainIntegration = (config: Parameters<typeof LangChainIntegration>[0]) => {
    return new LangChainIntegration(config);
};

// Common Agent Configurations
export const AGENT_CONFIGS = {
    SCRAPER: {
        id: 'scraper',
        name: 'Web Scraper Agent',
        description: 'Scrapes and extracts product information from web pages',
        primaryModel: 'gemini-1.5-pro',
        fallbackModels: ['gemini-1.5-flash', 'gemini-1.0-pro'],
        maxRetries: 3,
        timeout: 60000,
        cacheEnabled: true,
        cacheTTL: 7200,
        rateLimitPerMinute: 30,
        enableStreaming: true,
        enableQueue: true
    },

    ANALYZER: {
        id: 'analyzer',
        name: 'Product Analyzer Agent',
        description: 'Analyzes product data and market positioning',
        primaryModel: 'gemini-1.5-pro',
        fallbackModels: ['gemini-1.5-flash'],
        maxRetries: 3,
        timeout: 45000,
        cacheEnabled: true,
        cacheTTL: 3600,
        rateLimitPerMinute: 60,
        enableStreaming: true,
        enableQueue: true
    },

    CREATOR: {
        id: 'creator',
        name: 'Product Creator Agent',
        description: 'Creates new products based on requirements and analysis',
        primaryModel: 'gemini-1.5-pro',
        fallbackModels: ['gemini-1.5-flash'],
        maxRetries: 3,
        timeout: 120000,
        cacheEnabled: true,
        cacheTTL: 1800,
        rateLimitPerMinute: 30,
        enableStreaming: true,
        enableQueue: true
    },

    PREDICTOR: {
        id: 'predictor',
        name: 'Market Predictor Agent',
        description: 'Predicts market trends and opportunities',
        primaryModel: 'gemini-1.5-pro',
        fallbackModels: ['gemini-1.5-flash'],
        maxRetries: 3,
        timeout: 60000,
        cacheEnabled: true,
        cacheTTL: 14400, // 4 hours
        rateLimitPerMinute: 20,
        enableStreaming: false,
        enableQueue: true
    },

    SUPPORT: {
        id: 'support',
        name: 'Customer Support Agent',
        description: 'AI-powered customer support chatbot',
        primaryModel: 'gemini-1.5-pro',
        fallbackModels: ['gemini-1.5-flash'],
        maxRetries: 3,
        timeout: 30000,
        cacheEnabled: true,
        cacheTTL: 1800, // 30 minutes
        rateLimitPerMinute: 60,
        enableStreaming: true,
        enableQueue: true
    }
} as const;

// Common Model Configurations
export const MODEL_CONFIGS = {
    GEMINI_PRO: {
        name: 'gemini-1.5-pro',
        provider: 'gemini' as const,
        version: '1.5',
        maxTokens: 2097152,
        costPerToken: 0.00000125,
        capabilities: ['text', 'vision', 'code', 'reasoning', 'function-calling']
    },

    GEMINI_FLASH: {
        name: 'gemini-1.5-flash',
        provider: 'gemini' as const,
        version: '1.5',
        maxTokens: 1048576,
        costPerToken: 0.000000075,
        capabilities: ['text', 'vision', 'code', 'fast-inference']
    },

    GEMINI_LEGACY: {
        name: 'gemini-1.0-pro',
        provider: 'gemini' as const,
        version: '1.0',
        maxTokens: 32768,
        costPerToken: 0.0000005,
        capabilities: ['text', 'code', 'basic-reasoning']
    }
} as const;

// Infrastructure Setup Helper
export const setupAIInfrastructure = async (config?: {
    enableCache?: boolean;
    enableMonitoring?: boolean;
    enableStreaming?: boolean;
    registerDefaultAgents?: boolean;
}) => {
    const {
        enableCache = true,
        enableMonitoring = true,
        enableStreaming = true,
        registerDefaultAgents = true
    } = config || {};

    // Initialize infrastructure
    const infrastructure = AIInfrastructure.getInstance({
        enableGlobalCache: enableCache,
        enableGlobalMonitoring: enableMonitoring,
        enableStreaming: enableStreaming,
        defaultLangChain: {
            provider: 'gemini',
            model: 'gemini-1.5-pro',
            temperature: 0.7,
            maxTokens: 2048
        }
    });

    // Register default models
    Object.values(MODEL_CONFIGS).forEach(model => {
        infrastructure.registerModel(model);
    });

    // Register default agents if requested
    if (registerDefaultAgents) {
        infrastructure.registerAgentClass('scraper', EnhancedScraperAgent);

        // Create default agent instances
        infrastructure.createAgent('scraper', AGENT_CONFIGS.SCRAPER, 2);
    }

    return infrastructure;
};

// Error Classes
export class AIInfrastructureError extends Error {
    constructor(message: string, public code: string, public details?: unknown) {
        super(message);
        this.name = 'AIInfrastructureError';
    }
}

export class AgentExecutionError extends AIInfrastructureError {
    constructor(message: string, public agentId: string, details?: unknown) {
        super(message, 'AGENT_EXECUTION_ERROR', details);
        this.name = 'AgentExecutionError';
    }
}

export class ModelNotFoundError extends AIInfrastructureError {
    constructor(modelName: string) {
        super(`Model '${modelName}' not found in registry`, 'MODEL_NOT_FOUND', { modelName });
        this.name = 'ModelNotFoundError';
    }
}

export class CircuitBreakerOpenError extends AIInfrastructureError {
    constructor(agentId: string) {
        super(`Circuit breaker is open for agent '${agentId}'`, 'CIRCUIT_BREAKER_OPEN', { agentId });
        this.name = 'CircuitBreakerOpenError';
    }
}

// Constants
export const AI_INFRASTRUCTURE_CONSTANTS = {
    DEFAULT_TIMEOUT: 30000,
    DEFAULT_CACHE_TTL: 3600,
    DEFAULT_RETRY_ATTEMPTS: 3,
    DEFAULT_RATE_LIMIT: 60,
    MAX_CONCURRENT_AGENTS: 10,
    CIRCUIT_BREAKER_THRESHOLD: 5,
    CIRCUIT_BREAKER_RESET_TIMEOUT: 60000,
    STREAM_CLEANUP_INTERVAL: 60000,
    HEALTH_CHECK_INTERVAL: 60000
} as const;