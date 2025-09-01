/**
 * AI Agent Routing System
 * Routes requests to appropriate AI agents based on category and context
 */

import { ProductCategory, AIAgentConfig, RoutingCondition } from './types';
import { getCategoryById } from './definitions';

export interface AgentRequest {
    categoryId: string;
    operation: 'create' | 'analyze' | 'enhance' | 'validate' | 'scrape' | 'predict';
    data: Record<string, any>;
    context?: AgentContext;
}

export interface AgentContext {
    userId: string;
    sessionId: string;
    previousOperations: string[];
    userPreferences: Record<string, any>;
    templateId?: string;
}

export interface AgentResponse {
    agentId: string;
    operation: string;
    result: any;
    confidence: number;
    metadata: AgentMetadata;
}

export interface AgentMetadata {
    processingTime: number;
    tokensUsed: number;
    model: string;
    version: string;
    parameters: Record<string, any>;
}

export interface AgentCapability {
    id: string;
    name: string;
    description: string;
    supportedOperations: string[];
    specializations: string[];
    performance: AgentPerformance;
}

export interface AgentPerformance {
    averageResponseTime: number;
    successRate: number;
    qualityScore: number;
    userSatisfaction: number;
}

export class AIAgentRouter {
    private static agents: Map<string, AgentCapability> = new Map();
    private static routingCache: Map<string, string> = new Map();

    /**
     * Initialize the agent registry with available agents
     */
    static initialize() {
        this.registerAgents();
    }

    /**
     * Route a request to the most appropriate AI agent
     */
    static async routeRequest(request: AgentRequest): Promise<string> {
        const cacheKey = this.generateCacheKey(request);

        // Check cache first
        if (this.routingCache.has(cacheKey)) {
            return this.routingCache.get(cacheKey)!;
        }

        const category = getCategoryById(request.categoryId);
        if (!category) {
            throw new Error(`Category not found: ${request.categoryId}`);
        }

        const agentId = this.selectAgent(category, request);

        // Cache the routing decision
        this.routingCache.set(cacheKey, agentId);

        return agentId;
    }

    /**
     * Select the best agent based on category configuration and request context
     */
    private static selectAgent(category: ProductCategory, request: AgentRequest): string {
        const config = category.aiAgentConfig;

        // Check routing conditions first
        for (const condition of config.routing.conditions) {
            if (this.evaluateCondition(condition, request.data)) {
                return condition.agent;
            }
        }

        // Check operation-specific routing
        const operationAgent = this.getOperationSpecificAgent(config, request.operation);
        if (operationAgent) {
            return operationAgent;
        }

        // Fall back to primary agent or default
        return config.primaryAgent || config.routing.fallback;
    }

    /**
     * Evaluate a routing condition against request data
     */
    private static evaluateCondition(condition: RoutingCondition, data: Record<string, any>): boolean {
        const fieldValue = data[condition.field];

        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case 'contains':
                return Array.isArray(fieldValue)
                    ? fieldValue.includes(condition.value)
                    : String(fieldValue).includes(String(condition.value));
            case 'greater_than':
                return Number(fieldValue) > Number(condition.value);
            case 'less_than':
                return Number(fieldValue) < Number(condition.value);
            default:
                return false;
        }
    }

    /**
     * Get operation-specific agent if available
     */
    private static getOperationSpecificAgent(config: AIAgentConfig, operation: string): string | null {
        const operationAgentMap: Record<string, string> = {
            'create': 'creation-agent',
            'analyze': 'analysis-agent',
            'enhance': 'enhancement-agent',
            'validate': 'validation-agent',
            'scrape': 'scraping-agent',
            'predict': 'prediction-agent'
        };

        const agentType = operationAgentMap[operation];
        if (agentType && config.supportingAgents.includes(agentType)) {
            return agentType;
        }

        return null;
    }

    /**
     * Generate cache key for routing decisions
     */
    private static generateCacheKey(request: AgentRequest): string {
        const keyParts = [
            request.categoryId,
            request.operation,
            JSON.stringify(request.data),
            request.context?.templateId || 'no-template'
        ];

        return keyParts.join('|');
    }

    /**
     * Get agent configuration for a specific agent
     */
    static getAgentConfig(categoryId: string, agentId: string): Partial<AIAgentConfig> | null {
        const category = getCategoryById(categoryId);
        if (!category) return null;

        const config = category.aiAgentConfig;

        // Return agent-specific configuration
        return {
            prompts: config.prompts,
            parameters: config.parameters,
            routing: config.routing
        };
    }

    /**
     * Get prompts for a specific operation and category
     */
    static getPrompts(categoryId: string, operation: string): string | null {
        const category = getCategoryById(categoryId);
        if (!category) return null;

        const prompts = category.aiAgentConfig.prompts;

        switch (operation) {
            case 'create':
                return prompts.creation;
            case 'analyze':
                return prompts.analysis;
            case 'enhance':
                return prompts.enhancement;
            case 'validate':
                return prompts.validation;
            default:
                return prompts.creation; // Default fallback
        }
    }

    /**
     * Get agent parameters for fine-tuning
     */
    static getAgentParameters(categoryId: string): Record<string, number> | null {
        const category = getCategoryById(categoryId);
        if (!category) return null;

        return category.aiAgentConfig.parameters;
    }

    /**
     * Register available AI agents
     */
    private static registerAgents() {
        const agents: AgentCapability[] = [
            {
                id: 'general-creation-agent',
                name: 'General Creation Agent',
                description: 'General-purpose product creation agent',
                supportedOperations: ['create', 'enhance'],
                specializations: ['general'],
                performance: {
                    averageResponseTime: 5000,
                    successRate: 0.85,
                    qualityScore: 0.8,
                    userSatisfaction: 0.82
                }
            },
            {
                id: 'design-specialist',
                name: 'Design Specialist Agent',
                description: 'Specialized in design and graphics creation',
                supportedOperations: ['create', 'analyze', 'enhance'],
                specializations: ['design', 'graphics', 'branding'],
                performance: {
                    averageResponseTime: 4500,
                    successRate: 0.92,
                    qualityScore: 0.9,
                    userSatisfaction: 0.88
                }
            },
            {
                id: 'software-specialist',
                name: 'Software Development Agent',
                description: 'Specialized in software and tool development',
                supportedOperations: ['create', 'analyze', 'validate'],
                specializations: ['software', 'development', 'technical'],
                performance: {
                    averageResponseTime: 8000,
                    successRate: 0.88,
                    qualityScore: 0.85,
                    userSatisfaction: 0.86
                }
            },
            {
                id: 'content-specialist',
                name: 'Content Creation Agent',
                description: 'Specialized in educational and written content',
                supportedOperations: ['create', 'analyze', 'enhance'],
                specializations: ['content', 'education', 'writing'],
                performance: {
                    averageResponseTime: 6000,
                    successRate: 0.9,
                    qualityScore: 0.87,
                    userSatisfaction: 0.85
                }
            },
            {
                id: 'business-specialist',
                name: 'Business Template Agent',
                description: 'Specialized in business documents and templates',
                supportedOperations: ['create', 'analyze', 'validate'],
                specializations: ['business', 'templates', 'professional'],
                performance: {
                    averageResponseTime: 4000,
                    successRate: 0.89,
                    qualityScore: 0.83,
                    userSatisfaction: 0.84
                }
            },
            {
                id: 'media-specialist',
                name: 'Media Content Agent',
                description: 'Specialized in media and multimedia content',
                supportedOperations: ['create', 'analyze', 'enhance'],
                specializations: ['media', 'video', 'audio', 'multimedia'],
                performance: {
                    averageResponseTime: 7000,
                    successRate: 0.86,
                    qualityScore: 0.88,
                    userSatisfaction: 0.87
                }
            },
            {
                id: 'marketing-specialist',
                name: 'Marketing Materials Agent',
                description: 'Specialized in marketing and promotional content',
                supportedOperations: ['create', 'analyze', 'enhance', 'predict'],
                specializations: ['marketing', 'promotion', 'campaigns'],
                performance: {
                    averageResponseTime: 5500,
                    successRate: 0.87,
                    qualityScore: 0.84,
                    userSatisfaction: 0.83
                }
            },
            {
                id: 'productivity-specialist',
                name: 'Productivity Tools Agent',
                description: 'Specialized in productivity and organizational tools',
                supportedOperations: ['create', 'analyze', 'enhance'],
                specializations: ['productivity', 'organization', 'efficiency'],
                performance: {
                    averageResponseTime: 4200,
                    successRate: 0.91,
                    qualityScore: 0.82,
                    userSatisfaction: 0.85
                }
            },
            {
                id: 'creative-specialist',
                name: 'Creative Assets Agent',
                description: 'Specialized in creative resources and artistic content',
                supportedOperations: ['create', 'analyze', 'enhance'],
                specializations: ['creative', 'artistic', 'resources'],
                performance: {
                    averageResponseTime: 5800,
                    successRate: 0.89,
                    qualityScore: 0.91,
                    userSatisfaction: 0.89
                }
            },
            {
                id: 'analysis-agent',
                name: 'Product Analysis Agent',
                description: 'Specialized in product and market analysis',
                supportedOperations: ['analyze', 'predict'],
                specializations: ['analysis', 'market-research', 'insights'],
                performance: {
                    averageResponseTime: 3500,
                    successRate: 0.93,
                    qualityScore: 0.89,
                    userSatisfaction: 0.87
                }
            },
            {
                id: 'scraping-agent',
                name: 'Web Scraping Agent',
                description: 'Specialized in web scraping and data extraction',
                supportedOperations: ['scrape', 'analyze'],
                specializations: ['scraping', 'data-extraction', 'web-analysis'],
                performance: {
                    averageResponseTime: 6500,
                    successRate: 0.84,
                    qualityScore: 0.81,
                    userSatisfaction: 0.80
                }
            },
            {
                id: 'prediction-agent',
                name: 'Market Prediction Agent',
                description: 'Specialized in trend prediction and forecasting',
                supportedOperations: ['predict', 'analyze'],
                specializations: ['prediction', 'forecasting', 'trends'],
                performance: {
                    averageResponseTime: 4800,
                    successRate: 0.82,
                    qualityScore: 0.86,
                    userSatisfaction: 0.81
                }
            }
        ];

        agents.forEach(agent => {
            this.agents.set(agent.id, agent);
        });
    }

    /**
     * Get all available agents
     */
    static getAvailableAgents(): AgentCapability[] {
        return Array.from(this.agents.values());
    }

    /**
     * Get agent by ID
     */
    static getAgent(agentId: string): AgentCapability | null {
        return this.agents.get(agentId) || null;
    }

    /**
     * Get agents by specialization
     */
    static getAgentsBySpecialization(specialization: string): AgentCapability[] {
        return Array.from(this.agents.values()).filter(agent =>
            agent.specializations.includes(specialization)
        );
    }

    /**
     * Get best agent for operation
     */
    static getBestAgentForOperation(operation: string, categoryId?: string): string {
        const availableAgents = Array.from(this.agents.values())
            .filter(agent => agent.supportedOperations.includes(operation));

        if (categoryId) {
            const category = getCategoryById(categoryId);
            if (category) {
                // Try to find specialized agent for this category
                const categorySpecialists = availableAgents.filter(agent =>
                    agent.specializations.some(spec =>
                        category.metadata.tags.includes(spec) ||
                        category.name.toLowerCase().includes(spec)
                    )
                );

                if (categorySpecialists.length > 0) {
                    // Return the best performing specialist
                    return categorySpecialists.sort((a, b) =>
                        (b.performance.qualityScore * b.performance.successRate) -
                        (a.performance.qualityScore * a.performance.successRate)
                    )[0].id;
                }
            }
        }

        // Return best general agent for the operation
        if (availableAgents.length > 0) {
            return availableAgents.sort((a, b) =>
                (b.performance.qualityScore * b.performance.successRate) -
                (a.performance.qualityScore * a.performance.successRate)
            )[0].id;
        }

        return 'general-creation-agent'; // Fallback
    }

    /**
     * Clear routing cache
     */
    static clearCache() {
        this.routingCache.clear();
    }

    /**
     * Get routing statistics
     */
    static getRoutingStats(): Record<string, any> {
        const agentUsage: Record<string, number> = {};

        this.routingCache.forEach(agentId => {
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
        });

        return {
            totalRoutings: this.routingCache.size,
            agentUsage,
            cacheHitRate: this.routingCache.size > 0 ? 1 : 0 // Simplified calculation
        };
    }
}

// Initialize the router
AIAgentRouter.initialize();

export const aiAgentRouter = AIAgentRouter;