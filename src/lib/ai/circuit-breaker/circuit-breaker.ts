import { CircuitBreakerState } from '../types';

export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    halfOpenMaxCalls: number;
}

export class CircuitBreaker {
    private state: CircuitBreakerState;
    private config: CircuitBreakerConfig;
    private successCount: number = 0;
    private lastResetAttempt: Date | null = null;

    constructor(
        private name: string,
        config: Partial<CircuitBreakerConfig> = {}
    ) {
        this.config = {
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            monitoringPeriod: 300000, // 5 minutes
            halfOpenMaxCalls: 3,
            ...config
        };

        this.state = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            nextAttemptTime: null
        };
    }

    public async execute<T>(
        operation: () => Promise<T>,
        fallback?: () => Promise<T>
    ): Promise<T> {
        if (this.state.isOpen) {
            if (this.shouldAttemptReset()) {
                return this.attemptReset(operation, fallback);
            } else {
                if (fallback) {
                    return fallback();
                }
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();

            if (fallback && this.state.isOpen) {
                return fallback();
            }

            throw error;
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.state.nextAttemptTime) {
            return false;
        }
        return new Date() >= this.state.nextAttemptTime;
    }

    private async attemptReset<T>(
        operation: () => Promise<T>,
        fallback?: () => Promise<T>
    ): Promise<T> {
        this.lastResetAttempt = new Date();

        try {
            const result = await operation();
            this.reset();
            return result;
        } catch (error) {
            this.onFailure();

            if (fallback) {
                return fallback();
            }

            throw error;
        }
    }

    private onSuccess(): void {
        this.successCount++;

        if (this.state.isOpen && this.successCount >= this.config.halfOpenMaxCalls) {
            this.reset();
        } else if (!this.state.isOpen) {
            // Reset failure count on successful operation
            this.state.failureCount = Math.max(0, this.state.failureCount - 1);
        }
    }

    private onFailure(): void {
        this.state.failureCount++;
        this.state.lastFailureTime = new Date();
        this.successCount = 0;

        if (this.state.failureCount >= this.config.failureThreshold) {
            this.open();
        }
    }

    private open(): void {
        this.state.isOpen = true;
        this.state.nextAttemptTime = new Date(
            Date.now() + this.config.resetTimeout
        );

        console.warn(`Circuit breaker ${this.name} opened due to ${this.state.failureCount} failures`);
    }

    private reset(): void {
        this.state.isOpen = false;
        this.state.failureCount = 0;
        this.state.lastFailureTime = null;
        this.state.nextAttemptTime = null;
        this.successCount = 0;

        console.info(`Circuit breaker ${this.name} reset`);
    }

    public getState(): CircuitBreakerState {
        return { ...this.state };
    }

    public getMetrics(): {
        name: string;
        state: string;
        failureCount: number;
        successCount: number;
        lastFailureTime: Date | null;
        nextAttemptTime: Date | null;
    } {
        return {
            name: this.name,
            state: this.state.isOpen ? 'OPEN' : 'CLOSED',
            failureCount: this.state.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.state.lastFailureTime,
            nextAttemptTime: this.state.nextAttemptTime
        };
    }

    public forceOpen(): void {
        this.open();
    }

    public forceClose(): void {
        this.reset();
    }
}