import { EnhancedBaseAgent, EnhancedAgentConfig } from '../enhanced-base-agent';
import { AgentRequest, AgentResponse } from '../types';
import { JobQueue } from '../queue/job-queue';
import { AgentMonitor } from '../monitoring/agent-monitor';
import { EventEmitter } from 'events';

export interface OrchestrationConfig {
    maxConcurrentAgents: number;
    defaultTimeout: number;
    enableLoadBalancing: boolean;
    enableFailover: boolean;
    healthCheckInterval: number;
}

export interface AgentInstance {
    id: string;
    agent: EnhancedBaseAgent;
    config: EnhancedAgentConfig;
    isHealthy: boolean;
    lastHealthCheck: Date;
    activeRequests: number;
    totalRequests: number;
}

export class AgentOrchestrator extends EventEmitter {
    private agents: Map<string, AgentInstance[]> = new Map();
    private globalQueue: JobQueue;
    private monitor: AgentMonitor;
    private config: OrchestrationConfig;
    private healthCheckInterval: NodeJS.Timeout;

    constructor(config: Partial<OrchestrationConfig> = {}) {
        super();

        this.config = {
            maxConcurrentAgents: 10,
            defaultTimeout: 30000,
            enableLoadBalancing: true,
            enableFailover: true,
            healthCheckInterval: 60000, // 1 minute
            ...config
        };

        this.globalQueue = new JobQueue({
            maxConcurrency: this.config.maxConcurrentAgents,
            defaultDelay: 0,
            maxRetries: 3,
            retryDelay: 1000,
            jobTimeout: this.config.defaultTimeout
        });

        this.monitor = AgentMonitor.getInstance();

        this.setupGlobalQueueProcessors();
        this.startHealthChecks();
    }

    public registerAgent(
        agentType: string,
        agentClass: new (config: EnhancedAgentConfig) => EnhancedBaseAgent,
        config: EnhancedAgentConfig,
        instances: number = 1
    ): void {
        const agentInstances: AgentInstance[] = [];

        for (let i = 0; i < instances; i++) {
            const instanceId = `${agentType}_${i}`;
            const instanceConfig = {
                ...config,
                id: instanceId
            };

            const agent = new agentClass(instanceConfig);

            const instance: AgentInstance = {
                id: instanceId,
                agent,
                config: instanceConfig,
                isHealthy: true,
                lastHealthCheck: new Date(),
                activeRequests: 0,
                totalRequests: 0
            };

            agentInstances.push(instance);
        }

        this.agents.set(agentType, agentInstances);
        this.emit('agents:registered', { agentType, instances: agentInstances.length });
    }

    public async executeAgent(
        agentType: string,
        request: AgentRequest
    ): Promise<AgentResponse> {
        const instance = this.selectAgentInstance(agentType);

        if (!instance) {
            throw new Error(`No healthy instances available for agent type: ${agentType}`);
        }

        instance.activeRequests++;
        instance.totalRequests++;

        try {
            const response = await instance.agent.processRequest(request);

            this.emit('request:completed', {
                agentType,
                instanceId: instance.id,
                requestId: request.id,
                success: true
            });

            return response;

        } catch (error) {
            this.emit('request:failed', {
                agentType,
                instanceId: instance.id,
                requestId: request.id,
                error: (error as Error).message
            });

            // Mark instance as unhealthy if it fails repeatedly
            await this.checkInstanceHealth(instance);

            throw error;

        } finally {
            instance.activeRequests--;
        }
    }

    public async queueAgentRequest(
        agentType: string,
        request: AgentRequest,
        priority: number = 50
    ): Promise<string> {
        return await this.globalQueue.add('agent-execution', {
            agentType,
            request
        }, {
            priority,
            id: request.id
        });
    }

    public async executeParallel(
        requests: Array<{ agentType: string; request: AgentRequest }>
    ): Promise<AgentResponse[]> {
        const promises = requests.map(({ agentType, request }) =>
            this.executeAgent(agentType, request)
        );

        return Promise.all(promises);
    }

    public async executeSequential(
        requests: Array<{ agentType: string; request: AgentRequest }>,
        stopOnFailure: boolean = false
    ): Promise<AgentResponse[]> {
        const results: AgentResponse[] = [];

        for (const { agentType, request } of requests) {
            try {
                const result = await this.executeAgent(agentType, request);
                results.push(result);
            } catch (error) {
                if (stopOnFailure) {
                    throw error;
                }

                // Create error response
                results.push({
                    id: `error_${Date.now()}`,
                    agentId: agentType,
                    requestId: request.id,
                    output: null,
                    model: 'error',
                    tokensUsed: 0,
                    cost: 0,
                    duration: 0,
                    cached: false,
                    error: (error as Error).message,
                    timestamp: new Date()
                });
            }
        }

        return results;
    }

    public async executeWorkflow(
        workflow: Array<{
            agentType: string;
            request: AgentRequest;
            dependsOn?: string[];
            transform?: (input: unknown, previousResults: Map<string, AgentResponse>) => unknown;
        }>
    ): Promise<Map<string, AgentResponse>> {
        const results = new Map<string, AgentResponse>();
        const completed = new Set<string>();
        const pending = new Map(workflow.map(step => [step.request.id, step]));

        while (pending.size > 0) {
            const readySteps = Array.from(pending.values()).filter(step =>
                !step.dependsOn || step.dependsOn.every(dep => completed.has(dep))
            );

            if (readySteps.length === 0) {
                throw new Error('Circular dependency detected in workflow');
            }

            // Execute ready steps in parallel
            const stepPromises = readySteps.map(async (step) => {
                let input = step.request.input;

                // Transform input if transform function is provided
                if (step.transform) {
                    input = step.transform(input, results);
                }

                const transformedRequest = {
                    ...step.request,
                    input
                };

                const result = await this.executeAgent(step.agentType, transformedRequest);
                return { stepId: step.request.id, result };
            });

            const stepResults = await Promise.all(stepPromises);

            // Process results
            for (const { stepId, result } of stepResults) {
                results.set(stepId, result);
                completed.add(stepId);
                pending.delete(stepId);
            }
        }

        return results;
    }

    private selectAgentInstance(agentType: string): AgentInstance | null {
        const instances = this.agents.get(agentType);

        if (!instances || instances.length === 0) {
            return null;
        }

        // Filter healthy instances
        const healthyInstances = instances.filter(instance => instance.isHealthy);

        if (healthyInstances.length === 0) {
            return null;
        }

        if (!this.config.enableLoadBalancing) {
            return healthyInstances[0];
        }

        // Load balancing: select instance with least active requests
        return healthyInstances.reduce((best, current) =>
            current.activeRequests < best.activeRequests ? current : best
        );
    }

    private async checkInstanceHealth(instance: AgentInstance): Promise<void> {
        try {
            const health = instance.agent.getHealth();
            instance.isHealthy = health.isHealthy;
            instance.lastHealthCheck = new Date();

            if (!instance.isHealthy) {
                this.emit('instance:unhealthy', {
                    agentType: this.getAgentTypeByInstance(instance),
                    instanceId: instance.id,
                    health
                });
            }

        } catch (error) {
            instance.isHealthy = false;
            instance.lastHealthCheck = new Date();

            this.emit('instance:health_check_failed', {
                instanceId: instance.id,
                error: (error as Error).message
            });
        }
    }

    private getAgentTypeByInstance(targetInstance: AgentInstance): string | null {
        for (const [agentType, instances] of this.agents) {
            if (instances.some(instance => instance.id === targetInstance.id)) {
                return agentType;
            }
        }
        return null;
    }

    private setupGlobalQueueProcessors(): void {
        this.globalQueue.process('agent-execution', async (job) => {
            const { agentType, request } = job.data;
            return await this.executeAgent(agentType, request);
        });

        this.globalQueue.start();
    }

    private startHealthChecks(): void {
        this.healthCheckInterval = setInterval(async () => {
            for (const instances of this.agents.values()) {
                for (const instance of instances) {
                    await this.checkInstanceHealth(instance);
                }
            }
        }, this.config.healthCheckInterval);
    }

    public getAgentStats(): Record<string, {
        totalInstances: number;
        healthyInstances: number;
        activeRequests: number;
        totalRequests: number;
    }> {
        const stats: Record<string, any> = {};

        for (const [agentType, instances] of this.agents) {
            const healthyInstances = instances.filter(i => i.isHealthy).length;
            const activeRequests = instances.reduce((sum, i) => sum + i.activeRequests, 0);
            const totalRequests = instances.reduce((sum, i) => sum + i.totalRequests, 0);

            stats[agentType] = {
                totalInstances: instances.length,
                healthyInstances,
                activeRequests,
                totalRequests
            };
        }

        return stats;
    }

    public getSystemHealth(): {
        totalAgents: number;
        healthyAgents: number;
        queueStats: ReturnType<JobQueue['getStats']>;
        systemHealth: ReturnType<AgentMonitor['getSystemHealth']>;
    } {
        let totalAgents = 0;
        let healthyAgents = 0;

        for (const instances of this.agents.values()) {
            totalAgents += instances.length;
            healthyAgents += instances.filter(i => i.isHealthy).length;
        }

        return {
            totalAgents,
            healthyAgents,
            queueStats: this.globalQueue.getStats(),
            systemHealth: this.monitor.getSystemHealth()
        };
    }

    public async scaleAgent(agentType: string, targetInstances: number): Promise<void> {
        const currentInstances = this.agents.get(agentType) || [];
        const currentCount = currentInstances.length;

        if (targetInstances === currentCount) {
            return;
        }

        if (targetInstances > currentCount) {
            // Scale up - add more instances
            const toAdd = targetInstances - currentCount;
            // Implementation would require storing agent class reference
            this.emit('scaling:up', { agentType, from: currentCount, to: targetInstances });
        } else {
            // Scale down - remove instances
            const toRemove = currentCount - targetInstances;
            const instancesToRemove = currentInstances
                .filter(i => i.activeRequests === 0)
                .slice(0, toRemove);

            for (const instance of instancesToRemove) {
                const index = currentInstances.indexOf(instance);
                if (index > -1) {
                    currentInstances.splice(index, 1);
                }
            }

            this.emit('scaling:down', { agentType, from: currentCount, to: currentInstances.length });
        }
    }

    public destroy(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.globalQueue.stop();
        this.agents.clear();
    }
}