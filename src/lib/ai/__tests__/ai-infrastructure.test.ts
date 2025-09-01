import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIInfrastructure } from '../ai-infrastructure';
import { EnhancedBaseAgent, EnhancedAgentConfig } from '../enhanced-base-agent';
import { AgentRequest, AgentResponse } from '../types';

// Mock agent for testing
class MockAgent extends EnhancedBaseAgent {
    constructor(config: EnhancedAgentConfig) {
        super(config);
    }

    protected async processOutput(content: string, request: AgentRequest): Promise<any> {
        return { processed: content, requestId: request.id };
    }

    protected async getEmergencyFallback(request: AgentRequest): Promise<any> {
        return { fallback: true, requestId: request.id };
    }

    public async process(input: any, context?: Record<string, any>): Promise<any> {
        return { result: input, context };
    }
}

describe('AIInfrastructure', () => {
    let infrastructure: AIInfrastructure;

    beforeEach(() => {
        // Reset singleton instance
        (AIInfrastructure as any).instance = null;

        infrastructure = AIInfrastructure.getInstance({
            enableGlobalCache: true,
            enableGlobalMonitoring: true,
            enableStreaming: true
        });
    });

    afterEach(() => {
        infrastructure.destroy();
    });

    describe('Initialization', () => {
        it('should create singleton instance', () => {
            const instance1 = AIInfrastructure.getInstance();
            const instance2 = AIInfrastructure.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should initialize with default config', () => {
            const config = infrastructure.getConfig();

            expect(config.enableGlobalCache).toBe(true);
            expect(config.enableGlobalMonitoring).toBe(true);
            expect(config.enableStreaming).toBe(true);
        });
    });

    describe('Agent Management', () => {
        beforeEach(() => {
            infrastructure.registerAgentClass('mock-agent', MockAgent);
        });

        it('should register agent class', () => {
            expect(() => {
                infrastructure.createAgent('mock-agent', {
                    id: 'test-agent',
                    name: 'Test Agent',
                    description: 'Test agent for unit tests',
                    primaryModel: 'gemini-1.5-pro',
                    fallbackModels: ['gemini-1.0-pro']
                });
            }).not.toThrow();
        });

        it('should throw error for unregistered agent', () => {
            expect(() => {
                infrastructure.createAgent('unknown-agent', {
                    id: 'test-agent',
                    name: 'Test Agent',
                    description: 'Test agent',
                    primaryModel: 'gemini-1.5-pro',
                    fallbackModels: []
                });
            }).toThrow('Agent class \'unknown-agent\' not registered');
        });

        it('should create multiple agent instances', () => {
            infrastructure.createAgent('mock-agent', {
                id: 'test-agent',
                name: 'Test Agent',
                description: 'Test agent',
                primaryModel: 'gemini-1.5-pro',
                fallbackModels: []
            }, 3);

            const stats = infrastructure.getAgentStats();
            expect(stats['mock-agent'].totalInstances).toBe(3);
        });
    });

    describe('Model Management', () => {
        it('should register and retrieve models', () => {
            const testModel = {
                name: 'test-model',
                provider: 'gemini' as const,
                version: '1.0',
                maxTokens: 1000,
                costPerToken: 0.001,
                capabilities: ['text', 'code']
            };

            infrastructure.registerModel(testModel);
            const retrieved = infrastructure.getModel('test-model');

            expect(retrieved).toEqual(testModel);
        });

        it('should find best model for task', () => {
            const model = infrastructure.getBestModelForTask(['text', 'code']);
            expect(model).toBeTruthy();
            expect(model?.capabilities).toContain('text');
            expect(model?.capabilities).toContain('code');
        });
    });

    describe('System Health', () => {
        it('should return system health', () => {
            const health = infrastructure.getSystemHealth();

            expect(health).toHaveProperty('infrastructure');
            expect(health).toHaveProperty('cache');
            expect(health).toHaveProperty('streaming');
        });

        it('should return agent stats', () => {
            infrastructure.registerAgentClass('mock-agent', MockAgent);
            infrastructure.createAgent('mock-agent', {
                id: 'test-agent',
                name: 'Test Agent',
                description: 'Test agent',
                primaryModel: 'gemini-1.5-pro',
                fallbackModels: []
            });

            const stats = infrastructure.getAgentStats();
            expect(stats).toHaveProperty('mock-agent');
            expect(stats['mock-agent']).toHaveProperty('totalInstances');
            expect(stats['mock-agent']).toHaveProperty('healthyInstances');
        });
    });

    describe('Streaming', () => {
        it('should create stream session', () => {
            const { sessionId, stream } = infrastructure.createStream('test-agent', 'user-123');

            expect(sessionId).toBeTruthy();
            expect(stream).toBeInstanceOf(ReadableStream);
        });

        it('should retrieve stream session', () => {
            const { sessionId } = infrastructure.createStream('test-agent', 'user-123');
            const session = infrastructure.getStreamSession(sessionId);

            expect(session).toBeTruthy();
            expect(session?.agentId).toBe('test-agent');
            expect(session?.userId).toBe('user-123');
        });
    });

    describe('Cache Management', () => {
        it('should clear cache', async () => {
            await expect(infrastructure.clearCache()).resolves.not.toThrow();
        });

        it('should clear agent-specific cache', async () => {
            await expect(infrastructure.clearCache('test-agent')).resolves.not.toThrow();
        });

        it('should get cache stats', () => {
            const stats = infrastructure.getCacheStats();

            expect(stats).toHaveProperty('totalEntries');
            expect(stats).toHaveProperty('totalSize');
            expect(stats).toHaveProperty('hitRate');
        });
    });

    describe('Configuration', () => {
        it('should update configuration', () => {
            infrastructure.updateConfig({
                enableGlobalCache: false
            });

            const config = infrastructure.getConfig();
            expect(config.enableGlobalCache).toBe(false);
        });

        it('should preserve existing configuration', () => {
            const originalConfig = infrastructure.getConfig();

            infrastructure.updateConfig({
                enableGlobalCache: false
            });

            const newConfig = infrastructure.getConfig();
            expect(newConfig.enableGlobalMonitoring).toBe(originalConfig.enableGlobalMonitoring);
            expect(newConfig.enableStreaming).toBe(originalConfig.enableStreaming);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing LangChain integration', () => {
            expect(() => {
                infrastructure.getLangChain();
            }).toThrow('LangChain integration not initialized');
        });

        it('should handle disabled monitoring', () => {
            // Create infrastructure without monitoring
            const infraWithoutMonitoring = AIInfrastructure.getInstance({
                enableGlobalMonitoring: false
            });

            expect(() => {
                infraWithoutMonitoring.getAgentMetrics('test-agent');
            }).toThrow('Monitoring not enabled');
        });

        it('should handle disabled streaming', () => {
            // Create infrastructure without streaming
            const infraWithoutStreaming = AIInfrastructure.getInstance({
                enableStreaming: false
            });

            expect(() => {
                infraWithoutStreaming.createStream('test-agent');
            }).toThrow('Streaming not enabled');
        });

        it('should handle disabled cache', () => {
            // Create infrastructure without cache
            const infraWithoutCache = AIInfrastructure.getInstance({
                enableGlobalCache: false
            });

            expect(() => {
                infraWithoutCache.getCacheStats();
            }).toThrow('Cache not enabled');
        });
    });
});

describe('AIInfrastructure Factory Methods', () => {
    let infrastructure: AIInfrastructure;

    beforeEach(() => {
        (AIInfrastructure as any).instance = null;
        infrastructure = AIInfrastructure.getInstance();

        // Register mock agents
        infrastructure.registerAgentClass('scraper', MockAgent);
        infrastructure.registerAgentClass('analyzer', MockAgent);
        infrastructure.registerAgentClass('predictor', MockAgent);
        infrastructure.registerAgentClass('creator', MockAgent);

        // Create agent instances
        infrastructure.createAgent('scraper', {
            id: 'scraper-1',
            name: 'Scraper Agent',
            description: 'Scrapes product data',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: []
        });

        infrastructure.createAgent('analyzer', {
            id: 'analyzer-1',
            name: 'Analyzer Agent',
            description: 'Analyzes product data',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: []
        });

        infrastructure.createAgent('predictor', {
            id: 'predictor-1',
            name: 'Predictor Agent',
            description: 'Predicts market trends',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: []
        });

        infrastructure.createAgent('creator', {
            id: 'creator-1',
            name: 'Creator Agent',
            description: 'Creates products',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: []
        });
    });

    afterEach(() => {
        infrastructure.destroy();
    });

    it('should execute product analysis workflow', async () => {
        // Mock the agent execution to avoid actual AI calls
        const mockExecuteAgent = vi.spyOn(infrastructure as any, 'executeAgent');
        mockExecuteAgent.mockImplementation(async (agentType: string, request: any) => {
            return {
                id: 'mock-response',
                agentId: agentType,
                requestId: request.id,
                output: { mockData: `${agentType} result` },
                model: 'mock-model',
                tokensUsed: 100,
                cost: 0.01,
                duration: 1000,
                cached: false,
                timestamp: new Date()
            };
        });

        const results = await AIInfrastructure.createProductAnalysisWorkflow(
            infrastructure,
            { url: 'https://example.com/product' }
        );

        expect(results.size).toBe(3);
        expect(mockExecuteAgent).toHaveBeenCalledTimes(3);

        mockExecuteAgent.mockRestore();
    });

    it('should execute product creation workflow', async () => {
        // Mock the agent execution
        const mockExecuteAgent = vi.spyOn(infrastructure as any, 'executeAgent');
        mockExecuteAgent.mockImplementation(async (agentType: string, request: any) => {
            return {
                id: 'mock-response',
                agentId: agentType,
                requestId: request.id,
                output: { mockData: `${agentType} result` },
                model: 'mock-model',
                tokensUsed: 100,
                cost: 0.01,
                duration: 1000,
                cached: false,
                timestamp: new Date()
            };
        });

        const results = await AIInfrastructure.createProductCreationWorkflow(
            infrastructure,
            { requirements: 'Create a digital product' }
        );

        expect(results.size).toBe(2);
        expect(mockExecuteAgent).toHaveBeenCalledTimes(2);

        mockExecuteAgent.mockRestore();
    });
});