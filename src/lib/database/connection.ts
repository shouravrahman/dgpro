// Database Connection Management and Optimization
// Handles connection pooling, query optimization, and performance monitoring

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Connection pool configuration
interface ConnectionConfig {
    maxConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}

const defaultConfig: ConnectionConfig = {
    maxConnections: 20,
    idleTimeout: 30000, // 30 seconds
    connectionTimeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};

// Connection pool manager
class ConnectionPool {
    private connections: Map<string, any> = new Map();
    private config: ConnectionConfig;
    private metrics: {
        totalConnections: number;
        activeConnections: number;
        failedConnections: number;
        queryCount: number;
        avgQueryTime: number;
    } = {
            totalConnections: 0,
            activeConnections: 0,
            failedConnections: 0,
            queryCount: 0,
            avgQueryTime: 0,
        };

    constructor(config: Partial<ConnectionConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    async getConnection(key = 'default') {
        if (this.connections.has(key)) {
            return this.connections.get(key);
        }

        if (this.connections.size >= this.config.maxConnections) {
            throw new Error('Maximum connections reached');
        }

        try {
            const client = createClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                    },
                    db: {
                        schema: 'public',
                    },
                    global: {
                        headers: {
                            'x-connection-pool': 'true',
                        },
                    },
                }
            );

            this.connections.set(key, client);
            this.metrics.totalConnections++;
            this.metrics.activeConnections++;

            // Set up connection cleanup
            setTimeout(() => {
                this.releaseConnection(key);
            }, this.config.idleTimeout);

            return client;
        } catch (error) {
            this.metrics.failedConnections++;
            throw error;
        }
    }

    releaseConnection(key: string) {
        if (this.connections.has(key)) {
            this.connections.delete(key);
            this.metrics.activeConnections--;
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    async healthCheck() {
        try {
            const client = await this.getConnection('health-check');
            const { data, error } = await client
                .from('system_settings')
                .select('key')
                .limit(1);

            this.releaseConnection('health-check');

            return {
                healthy: !error,
                error: error?.message,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                healthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }
}

// Global connection pool instance
export const connectionPool = new ConnectionPool();

// Query optimization utilities
export class QueryOptimizer {
    private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    private queryMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

    // Cache query results
    async cacheQuery<T>(
        key: string,
        queryFn: () => Promise<T>,
        ttl = 300000 // 5 minutes default
    ): Promise<T> {
        const cached = this.queryCache.get(key);
        const now = Date.now();

        if (cached && now - cached.timestamp < cached.ttl) {
            return cached.data;
        }

        const startTime = Date.now();
        const data = await queryFn();
        const endTime = Date.now();
        const queryTime = endTime - startTime;

        // Update metrics
        const metrics = this.queryMetrics.get(key) || { count: 0, totalTime: 0, avgTime: 0 };
        metrics.count++;
        metrics.totalTime += queryTime;
        metrics.avgTime = metrics.totalTime / metrics.count;
        this.queryMetrics.set(key, metrics);

        // Cache the result
        this.queryCache.set(key, {
            data,
            timestamp: now,
            ttl,
        });

        return data;
    }

    // Get query performance metrics
    getQueryMetrics(key?: string) {
        if (key) {
            return this.queryMetrics.get(key);
        }
        return Object.fromEntries(this.queryMetrics);
    }

    // Clear cache
    clearCache(key?: string) {
        if (key) {
            this.queryCache.delete(key);
        } else {
            this.queryCache.clear();
        }
    }

    // Optimize query with automatic retries
    async executeWithRetry<T>(
        queryFn: () => Promise<T>,
        maxRetries = 3,
        delay = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await queryFn();
            } catch (error) {
                lastError = error as Error;

                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
            }
        }

        throw lastError!;
    }

    // Batch queries for better performance
    async batchQueries<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
        return Promise.all(queries.map(query => query()));
    }
}

// Global query optimizer instance
export const queryOptimizer = new QueryOptimizer();

// Database performance monitoring
export class PerformanceMonitor {
    private metrics: {
        slowQueries: Array<{
            query: string;
            duration: number;
            timestamp: string;
        }>;
        errorCount: number;
        totalQueries: number;
        avgResponseTime: number;
    } = {
            slowQueries: [],
            errorCount: 0,
            totalQueries: 0,
            avgResponseTime: 0,
        };

    private slowQueryThreshold = 1000; // 1 second

    logQuery(query: string, duration: number, error?: Error) {
        this.metrics.totalQueries++;

        if (error) {
            this.metrics.errorCount++;
        }

        // Update average response time
        this.metrics.avgResponseTime =
            (this.metrics.avgResponseTime * (this.metrics.totalQueries - 1) + duration) /
            this.metrics.totalQueries;

        // Log slow queries
        if (duration > this.slowQueryThreshold) {
            this.metrics.slowQueries.push({
                query,
                duration,
                timestamp: new Date().toISOString(),
            });

            // Keep only last 100 slow queries
            if (this.metrics.slowQueries.length > 100) {
                this.metrics.slowQueries = this.metrics.slowQueries.slice(-100);
            }
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            errorRate: this.metrics.totalQueries > 0
                ? (this.metrics.errorCount / this.metrics.totalQueries) * 100
                : 0,
        };
    }

    getSlowQueries(limit = 10) {
        return this.metrics.slowQueries
            .sort((a, b) => b.duration - a.duration)
            .slice(0, limit);
    }

    reset() {
        this.metrics = {
            slowQueries: [],
            errorCount: 0,
            totalQueries: 0,
            avgResponseTime: 0,
        };
    }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Enhanced database client with monitoring
export function createMonitoredClient() {
    const client = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    // Wrap client methods with monitoring
    const originalFrom = client.from.bind(client);
    client.from = function (table: string) {
        const query = originalFrom(table);

        // Wrap query execution methods
        const wrapMethod = (methodName: string, originalMethod: Function) => {
            return async function (...args: any[]) {
                const startTime = Date.now();
                const queryString = `${methodName} on ${table}`;

                try {
                    const result = await originalMethod.apply(this, args);
                    const duration = Date.now() - startTime;
                    performanceMonitor.logQuery(queryString, duration);
                    return result;
                } catch (error) {
                    const duration = Date.now() - startTime;
                    performanceMonitor.logQuery(queryString, duration, error as Error);
                    throw error;
                }
            };
        };

        // Wrap common query methods
        ['select', 'insert', 'update', 'delete', 'upsert'].forEach(method => {
            if (query[method]) {
                const original = query[method].bind(query);
                query[method] = wrapMethod(method, original);
            }
        });

        return query;
    };

    return client;
}

// Database backup and disaster recovery utilities
export class BackupManager {
    async createBackup(tables: string[] = []) {
        // This would integrate with Supabase's backup APIs
        // For now, we'll create a simple export function
        const client = await connectionPool.getConnection('backup');
        const backupData: Record<string, any[]> = {};

        try {
            for (const table of tables) {
                const { data, error } = await client
                    .from(table)
                    .select('*');

                if (error) {
                    throw new Error(`Failed to backup table ${table}: ${error.message}`);
                }

                backupData[table] = data || [];
            }

            return {
                timestamp: new Date().toISOString(),
                tables: Object.keys(backupData),
                recordCount: Object.values(backupData).reduce((sum, records) => sum + records.length, 0),
                data: backupData,
            };
        } finally {
            connectionPool.releaseConnection('backup');
        }
    }

    async restoreFromBackup(backupData: any) {
        const client = await connectionPool.getConnection('restore');
        const results: Record<string, { success: boolean; error?: string }> = {};

        try {
            for (const [table, records] of Object.entries(backupData.data)) {
                try {
                    const { error } = await client
                        .from(table)
                        .insert(records as any[]);

                    results[table] = { success: !error, error: error?.message };
                } catch (error) {
                    results[table] = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            }

            return results;
        } finally {
            connectionPool.releaseConnection('restore');
        }
    }

    async validateBackup(backupData: any): Promise<boolean> {
        // Validate backup data structure and integrity
        if (!backupData.timestamp || !backupData.tables || !backupData.data) {
            return false;
        }

        // Check if all declared tables have data
        for (const table of backupData.tables) {
            if (!Array.isArray(backupData.data[table])) {
                return false;
            }
        }

        return true;
    }
}

// Global backup manager instance
export const backupManager = new BackupManager();

// Health check endpoint data
export async function getDatabaseHealth() {
    const connectionHealth = await connectionPool.healthCheck();
    const connectionMetrics = connectionPool.getMetrics();
    const performanceMetrics = performanceMonitor.getMetrics();
    const queryMetrics = queryOptimizer.getQueryMetrics();

    return {
        connection: connectionHealth,
        metrics: {
            connections: connectionMetrics,
            performance: performanceMetrics,
            queries: queryMetrics,
        },
        timestamp: new Date().toISOString(),
    };
}