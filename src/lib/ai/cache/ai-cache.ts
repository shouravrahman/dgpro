import { createHash } from 'crypto';

export interface CacheEntry {
    key: string;
    value: any;
    expiresAt: Date;
    metadata: {
        agentId: string;
        model: string;
        tokensUsed: number;
        cost: number;
        createdAt: Date;
    };
}

export class AICache {
    private static instance: AICache;
    private cache: Map<string, CacheEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    private constructor() {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    public static getInstance(): AICache {
        if (!AICache.instance) {
            AICache.instance = new AICache();
        }
        return AICache.instance;
    }

    public generateKey(
        agentId: string,
        input: any,
        model: string,
        context?: Record<string, any>
    ): string {
        const data = {
            agentId,
            input: typeof input === 'string' ? input : JSON.stringify(input),
            model,
            context: context ? JSON.stringify(context) : null
        };

        return createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    public async get(key: string): Promise<any | null> {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (new Date() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    public async set(
        key: string,
        value: any,
        ttlSeconds: number,
        metadata: {
            agentId: string;
            model: string;
            tokensUsed: number;
            cost: number;
        }
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        const entry: CacheEntry = {
            key,
            value,
            expiresAt,
            metadata: {
                ...metadata,
                createdAt: new Date()
            }
        };

        this.cache.set(key, entry);
    }

    public async invalidate(pattern?: string): Promise<void> {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        const regex = new RegExp(pattern);
        for (const [key] of this.cache) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    public async invalidateByAgent(agentId: string): Promise<void> {
        for (const [key, entry] of this.cache) {
            if (entry.metadata.agentId === agentId) {
                this.cache.delete(key);
            }
        }
    }

    public getStats(): {
        totalEntries: number;
        totalSize: number;
        hitRate: number;
        avgCost: number;
        avgTokens: number;
    } {
        const entries = Array.from(this.cache.values());
        const totalEntries = entries.length;

        if (totalEntries === 0) {
            return {
                totalEntries: 0,
                totalSize: 0,
                hitRate: 0,
                avgCost: 0,
                avgTokens: 0
            };
        }

        const totalSize = JSON.stringify(entries).length;
        const totalCost = entries.reduce((sum, entry) => sum + entry.metadata.cost, 0);
        const totalTokens = entries.reduce((sum, entry) => sum + entry.metadata.tokensUsed, 0);

        return {
            totalEntries,
            totalSize,
            hitRate: 0, // This would be calculated from metrics
            avgCost: totalCost / totalEntries,
            avgTokens: totalTokens / totalEntries
        };
    }

    private cleanup(): void {
        const now = new Date();
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
    }
}