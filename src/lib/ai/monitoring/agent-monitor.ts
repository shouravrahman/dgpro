import { AgentMetrics, AgentEvent, AgentEventType } from '../types';
import { EventEmitter } from 'events';

export class AgentMonitor extends EventEmitter {
    private static instance: AgentMonitor;
    private metrics: Map<string, AgentMetrics> = new Map();
    private events: AgentEvent[] = [];
    private maxEvents: number = 1000;

    private constructor() {
        super();
    }

    public static getInstance(): AgentMonitor {
        if (!AgentMonitor.instance) {
            AgentMonitor.instance = new AgentMonitor();
        }
        return AgentMonitor.instance;
    }

    public recordEvent(
        type: AgentEventType,
        agentId: string,
        data: Record<string, any>,
        requestId?: string
    ): void {
        const event: AgentEvent = {
            type,
            agentId,
            requestId,
            data,
            timestamp: new Date()
        };

        this.events.push(event);

        // Keep only the last N events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        this.emit('event', event);
        this.updateMetrics(event);
    }

    private updateMetrics(event: AgentEvent): void {
        const agentId = event.agentId;
        let metrics = this.metrics.get(agentId);

        if (!metrics) {
            metrics = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                totalTokensUsed: 0,
                totalCost: 0,
                cacheHitRate: 0,
                circuitBreakerTrips: 0
            };
            this.metrics.set(agentId, metrics);
        }

        switch (event.type) {
            case 'request_started':
                metrics.totalRequests++;
                break;

            case 'request_completed':
                metrics.successfulRequests++;
                if (event.data.responseTime) {
                    metrics.averageResponseTime =
                        (metrics.averageResponseTime * (metrics.successfulRequests - 1) + event.data.responseTime) /
                        metrics.successfulRequests;
                }
                if (event.data.tokensUsed) {
                    metrics.totalTokensUsed += event.data.tokensUsed;
                }
                if (event.data.cost) {
                    metrics.totalCost += event.data.cost;
                }
                break;

            case 'request_failed':
                metrics.failedRequests++;
                break;

            case 'circuit_breaker_opened':
                metrics.circuitBreakerTrips++;
                break;

            case 'cache_hit':
                this.updateCacheHitRate(agentId, true);
                break;

            case 'cache_miss':
                this.updateCacheHitRate(agentId, false);
                break;
        }
    }

    private updateCacheHitRate(agentId: string, isHit: boolean): void {
        const cacheEvents = this.events.filter(
            e => e.agentId === agentId && (e.type === 'cache_hit' || e.type === 'cache_miss')
        );

        if (cacheEvents.length === 0) return;

        const hits = cacheEvents.filter(e => e.type === 'cache_hit').length;
        const metrics = this.metrics.get(agentId);

        if (metrics) {
            metrics.cacheHitRate = hits / cacheEvents.length;
        }
    }

    public getMetrics(agentId: string): AgentMetrics | null {
        return this.metrics.get(agentId) || null;
    }

    public getAllMetrics(): Map<string, AgentMetrics> {
        return new Map(this.metrics);
    }

    public getEvents(
        agentId?: string,
        type?: AgentEventType,
        limit?: number
    ): AgentEvent[] {
        let filteredEvents = this.events;

        if (agentId) {
            filteredEvents = filteredEvents.filter(e => e.agentId === agentId);
        }

        if (type) {
            filteredEvents = filteredEvents.filter(e => e.type === type);
        }

        if (limit) {
            filteredEvents = filteredEvents.slice(-limit);
        }

        return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    public getSystemHealth(): {
        totalAgents: number;
        activeAgents: number;
        totalRequests: number;
        successRate: number;
        averageResponseTime: number;
        totalCost: number;
        circuitBreakerTrips: number;
    } {
        const allMetrics = Array.from(this.metrics.values());

        if (allMetrics.length === 0) {
            return {
                totalAgents: 0,
                activeAgents: 0,
                totalRequests: 0,
                successRate: 0,
                averageResponseTime: 0,
                totalCost: 0,
                circuitBreakerTrips: 0
            };
        }

        const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
        const successfulRequests = allMetrics.reduce((sum, m) => sum + m.successfulRequests, 0);
        const totalCost = allMetrics.reduce((sum, m) => sum + m.totalCost, 0);
        const circuitBreakerTrips = allMetrics.reduce((sum, m) => sum + m.circuitBreakerTrips, 0);

        // Calculate weighted average response time
        let totalWeightedTime = 0;
        let totalWeight = 0;

        for (const metrics of allMetrics) {
            if (metrics.successfulRequests > 0) {
                totalWeightedTime += metrics.averageResponseTime * metrics.successfulRequests;
                totalWeight += metrics.successfulRequests;
            }
        }

        const averageResponseTime = totalWeight > 0 ? totalWeightedTime / totalWeight : 0;

        // Count active agents (agents with requests in the last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activeAgents = new Set(
            this.events
                .filter(e => e.timestamp > oneHourAgo)
                .map(e => e.agentId)
        ).size;

        return {
            totalAgents: this.metrics.size,
            activeAgents,
            totalRequests,
            successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
            averageResponseTime,
            totalCost,
            circuitBreakerTrips
        };
    }

    public getAgentHealth(agentId: string): {
        isHealthy: boolean;
        successRate: number;
        averageResponseTime: number;
        recentErrors: AgentEvent[];
        circuitBreakerStatus: string;
    } {
        const metrics = this.metrics.get(agentId);
        const recentEvents = this.getEvents(agentId, undefined, 100);
        const recentErrors = recentEvents.filter(e => e.type === 'request_failed');

        if (!metrics) {
            return {
                isHealthy: false,
                successRate: 0,
                averageResponseTime: 0,
                recentErrors: [],
                circuitBreakerStatus: 'unknown'
            };
        }

        const successRate = metrics.totalRequests > 0
            ? metrics.successfulRequests / metrics.totalRequests
            : 0;

        const isHealthy = successRate > 0.95 && metrics.averageResponseTime < 5000;

        // Determine circuit breaker status from recent events
        const recentCircuitEvents = recentEvents.filter(
            e => e.type === 'circuit_breaker_opened' || e.type === 'circuit_breaker_closed'
        );

        let circuitBreakerStatus = 'closed';
        if (recentCircuitEvents.length > 0) {
            const lastEvent = recentCircuitEvents[0];
            circuitBreakerStatus = lastEvent.type === 'circuit_breaker_opened' ? 'open' : 'closed';
        }

        return {
            isHealthy,
            successRate,
            averageResponseTime: metrics.averageResponseTime,
            recentErrors: recentErrors.slice(0, 10),
            circuitBreakerStatus
        };
    }

    public clearMetrics(agentId?: string): void {
        if (agentId) {
            this.metrics.delete(agentId);
            this.events = this.events.filter(e => e.agentId !== agentId);
        } else {
            this.metrics.clear();
            this.events = [];
        }
    }

    public exportMetrics(): {
        metrics: Record<string, AgentMetrics>;
        events: AgentEvent[];
        systemHealth: ReturnType<AgentMonitor['getSystemHealth']>;
        timestamp: Date;
    } {
        return {
            metrics: Object.fromEntries(this.metrics),
            events: this.events,
            systemHealth: this.getSystemHealth(),
            timestamp: new Date()
        };
    }
}