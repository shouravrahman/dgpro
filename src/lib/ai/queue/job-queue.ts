import { QueueJob } from '../types';
import { EventEmitter } from 'events';

export interface QueueConfig {
    maxConcurrency: number;
    defaultDelay: number;
    maxRetries: number;
    retryDelay: number;
    jobTimeout: number;
}

export class JobQueue extends EventEmitter {
    private jobs: Map<string, QueueJob> = new Map();
    private processing: Set<string> = new Set();
    private config: QueueConfig;
    private isRunning: boolean = false;

    constructor(config: Partial<QueueConfig> = {}) {
        super();
        this.config = {
            maxConcurrency: 5,
            defaultDelay: 0,
            maxRetries: 3,
            retryDelay: 1000,
            jobTimeout: 30000,
            ...config
        };
    }

    public async add(
        type: string,
        data: any,
        options: {
            priority?: number;
            delay?: number;
            maxAttempts?: number;
            id?: string;
        } = {}
    ): Promise<string> {
        const job: QueueJob = {
            id: options.id || this.generateJobId(),
            type,
            data,
            priority: options.priority || 0,
            attempts: 0,
            maxAttempts: options.maxAttempts || this.config.maxRetries,
            delay: options.delay || this.config.defaultDelay,
            createdAt: new Date()
        };

        this.jobs.set(job.id, job);
        this.emit('job:added', job);

        if (this.isRunning) {
            this.processNext();
        }

        return job.id;
    }

    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.emit('queue:started');

        // Start processing jobs
        for (let i = 0; i < this.config.maxConcurrency; i++) {
            this.processNext();
        }
    }

    public stop(): void {
        this.isRunning = false;
        this.emit('queue:stopped');
    }

    public async process(
        type: string,
        processor: (job: QueueJob) => Promise<any>
    ): Promise<void> {
        this.on(`process:${type}`, async (job: QueueJob) => {
            try {
                const result = await this.executeWithTimeout(
                    () => processor(job),
                    this.config.jobTimeout
                );

                await this.completeJob(job.id, result);
            } catch (error) {
                await this.failJob(job.id, error as Error);
            }
        });
    }

    private async processNext(): Promise<void> {
        if (!this.isRunning || this.processing.size >= this.config.maxConcurrency) {
            return;
        }

        const job = this.getNextJob();
        if (!job) {
            // No jobs available, check again in a bit
            setTimeout(() => this.processNext(), 1000);
            return;
        }

        // Check if job should be delayed
        const now = new Date();
        const jobTime = new Date(job.createdAt.getTime() + job.delay);
        if (now < jobTime) {
            setTimeout(() => this.processNext(), jobTime.getTime() - now.getTime());
            return;
        }

        this.processing.add(job.id);
        job.attempts++;
        job.processedAt = new Date();

        this.emit('job:started', job);
        this.emit(`process:${job.type}`, job);

        // Continue processing other jobs
        setTimeout(() => this.processNext(), 0);
    }

    private getNextJob(): QueueJob | null {
        const availableJobs = Array.from(this.jobs.values())
            .filter(job =>
                !this.processing.has(job.id) &&
                !job.completedAt &&
                !job.failedAt &&
                job.attempts < job.maxAttempts
            )
            .sort((a, b) => {
                // Sort by priority (higher first), then by creation time
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

        return availableJobs[0] || null;
    }

    private async completeJob(jobId: string, result: any): Promise<void> {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.completedAt = new Date();
        this.processing.delete(jobId);

        this.emit('job:completed', job, result);

        // Clean up completed job after some time
        setTimeout(() => {
            this.jobs.delete(jobId);
        }, 60000); // Keep for 1 minute for debugging

        // Process next job
        this.processNext();
    }

    private async failJob(jobId: string, error: Error): Promise<void> {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.error = error.message;
        this.processing.delete(jobId);

        if (job.attempts >= job.maxAttempts) {
            job.failedAt = new Date();
            this.emit('job:failed', job, error);

            // Clean up failed job
            setTimeout(() => {
                this.jobs.delete(jobId);
            }, 300000); // Keep for 5 minutes for debugging
        } else {
            // Retry with exponential backoff
            job.delay = this.config.retryDelay * Math.pow(2, job.attempts - 1);
            this.emit('job:retry', job, error);
        }

        // Process next job
        this.processNext();
    }

    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeout: number
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeout}ms`));
            }, timeout);

            operation()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    private generateJobId(): string {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public getStats(): {
        totalJobs: number;
        pendingJobs: number;
        processingJobs: number;
        completedJobs: number;
        failedJobs: number;
    } {
        const jobs = Array.from(this.jobs.values());

        return {
            totalJobs: jobs.length,
            pendingJobs: jobs.filter(j => !j.processedAt && !j.failedAt).length,
            processingJobs: this.processing.size,
            completedJobs: jobs.filter(j => j.completedAt).length,
            failedJobs: jobs.filter(j => j.failedAt).length
        };
    }

    public getJob(id: string): QueueJob | undefined {
        return this.jobs.get(id);
    }

    public removeJob(id: string): boolean {
        if (this.processing.has(id)) {
            return false; // Cannot remove job that's currently processing
        }
        return this.jobs.delete(id);
    }

    public clear(): void {
        // Only clear non-processing jobs
        for (const [id, job] of this.jobs) {
            if (!this.processing.has(id)) {
                this.jobs.delete(id);
            }
        }
    }
}