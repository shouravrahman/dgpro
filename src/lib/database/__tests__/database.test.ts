// Database Service Tests
// Comprehensive tests for database operations and performance

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../index';
import { connectionPool, queryOptimizer, performanceMonitor } from '../connection';
import type { Database } from '@/types/database';

// Mock Supabase client
const mockSupabaseClient = {
    from: vi.fn(),
    auth: {
        getUser: vi.fn(),
    },
};

// Mock query builder
const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    csv: vi.fn(),
    geojson: vi.fn(),
    explain: vi.fn(),
    rollback: vi.fn(),
    returns: vi.fn().mockReturnThis(),
};

describe('DatabaseService', () => {
    let dbService: DatabaseService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
        dbService = new DatabaseService(mockSupabaseClient as any);
    });

    describe('User Operations', () => {
        it('should get user with profile', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                full_name: 'Test User',
                subscription_tier: 'free',
                user_profiles: [{
                    bio: 'Test bio',
                    skills: ['JavaScript', 'TypeScript']
                }]
            };

            mockQueryBuilder.single.mockResolvedValue({ data: mockUser, error: null });

            const result = await dbService.getUser('123');

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(`
        *,
        user_profiles (*)
      `);
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123');
            expect(result).toEqual(mockUser);
        });

        it('should handle user not found error', async () => {
            const mockError = new Error('User not found');
            mockQueryBuilder.single.mockResolvedValue({ data: null, error: mockError });

            await expect(dbService.getUser('nonexistent')).rejects.toThrow('User not found');
        });

        it('should update user successfully', async () => {
            const updates = { full_name: 'Updated Name' };
            const mockUpdatedUser = { id: '123', ...updates };

            mockQueryBuilder.single.mockResolvedValue({ data: mockUpdatedUser, error: null });

            const result = await dbService.updateUser('123', updates);

            expect(mockQueryBuilder.update).toHaveBeenCalledWith(updates);
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123');
            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('Product Operations', () => {
        it('should get product with related data', async () => {
            const mockProduct = {
                id: '456',
                name: 'Test Product',
                description: 'Test description',
                price: 29.99,
                users: { id: '123', full_name: 'Creator' },
                product_categories: { id: '789', name: 'Templates' },
                marketplace_listings: { id: '101', price: 29.99, status: 'active' }
            };

            mockQueryBuilder.single.mockResolvedValue({ data: mockProduct, error: null });

            const result = await dbService.getProduct('456');

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(expect.stringContaining('users!products_user_id_fkey'));
            expect(result).toEqual(mockProduct);
        });

        it('should get products with filters', async () => {
            const mockProducts = [
                { id: '1', name: 'Product 1', status: 'published' },
                { id: '2', name: 'Product 2', status: 'published' }
            ];

            mockQueryBuilder.mockResolvedValue({ data: mockProducts, error: null });

            const filters = {
                status: 'published' as Database['public']['Enums']['product_status'],
                featured: true,
                limit: 10
            };

            const result = await dbService.getProducts(filters);

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'published');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_featured', true);
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
            expect(result).toEqual(mockProducts);
        });

        it('should create product successfully', async () => {
            const newProduct = {
                user_id: '123',
                name: 'New Product',
                slug: 'new-product',
                description: 'A new product',
                pricing_type: 'one_time' as Database['public']['Enums']['pricing_type'],
                price: 19.99,
                currency: 'USD',
                features: ['Feature 1', 'Feature 2'],
                tags: ['tag1', 'tag2'],
                assets: {},
                metadata: {},
                status: 'draft' as Database['public']['Enums']['product_status'],
                is_featured: false,
                view_count: 0,
                download_count: 0,
                like_count: 0,
                quality_score: 0,
                seo_keywords: []
            };

            const mockCreatedProduct = { id: '789', ...newProduct };
            mockQueryBuilder.single.mockResolvedValue({ data: mockCreatedProduct, error: null });

            const result = await dbService.createProduct(newProduct);

            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(newProduct);
            expect(result).toEqual(mockCreatedProduct);
        });
    });

    describe('Category Operations', () => {
        it('should get root categories', async () => {
            const mockCategories = [
                { id: '1', name: 'Templates', parent_id: null, sort_order: 1 },
                { id: '2', name: 'Software', parent_id: null, sort_order: 2 }
            ];

            mockQueryBuilder.mockResolvedValue({ data: mockCategories, error: null });

            const result = await dbService.getCategories();

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('is_active', true);
            expect(mockQueryBuilder.is).toHaveBeenCalledWith('parent_id', null);
            expect(mockQueryBuilder.order).toHaveBeenCalledWith('sort_order');
            expect(result).toEqual(mockCategories);
        });

        it('should get subcategories', async () => {
            const mockSubcategories = [
                { id: '3', name: 'Website Templates', parent_id: '1', sort_order: 1 },
                { id: '4', name: 'Document Templates', parent_id: '1', sort_order: 2 }
            ];

            mockQueryBuilder.mockResolvedValue({ data: mockSubcategories, error: null });

            const result = await dbService.getCategories('1');

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('parent_id', '1');
            expect(result).toEqual(mockSubcategories);
        });
    });

    describe('Shopping Cart Operations', () => {
        it('should get user cart with items', async () => {
            const mockCart = {
                id: 'cart-123',
                user_id: '123',
                total_amount: 49.98,
                cart_items: [
                    {
                        id: 'item-1',
                        product_id: '456',
                        quantity: 1,
                        price: 29.99,
                        products: { id: '456', name: 'Product 1' }
                    },
                    {
                        id: 'item-2',
                        product_id: '789',
                        quantity: 1,
                        price: 19.99,
                        products: { id: '789', name: 'Product 2' }
                    }
                ]
            };

            mockQueryBuilder.mockResolvedValue({ data: [mockCart], error: null });

            const result = await dbService.getCart('123');

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', '123');
            expect(result).toEqual(mockCart);
        });

        it('should add item to existing cart', async () => {
            const existingCart = {
                id: 'cart-123',
                user_id: '123',
                total_amount: 29.99,
                cart_items: []
            };

            // Mock getCart to return existing cart
            vi.spyOn(dbService, 'getCart').mockResolvedValue(existingCart);
            vi.spyOn(dbService, 'updateCartTotal').mockResolvedValue();

            const newItem = {
                id: 'item-2',
                cart_id: 'cart-123',
                product_id: '789',
                quantity: 1,
                price: 19.99,
                currency: 'USD',
                created_at: new Date().toISOString()
            };

            mockQueryBuilder.single.mockResolvedValue({ data: newItem, error: null });

            const result = await dbService.addToCart({
                userId: '123',
                productId: '789',
                quantity: 1,
                price: 19.99
            });

            expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
                cart_id: 'cart-123',
                product_id: '789',
                bundle_id: undefined,
                quantity: 1,
                price: 19.99,
                currency: 'USD'
            });
            expect(result).toEqual(newItem);
        });
    });

    describe('Market Trends Operations', () => {
        it('should get market trends for category', async () => {
            const mockTrends = [
                {
                    id: '1',
                    category: 'Templates',
                    trend_data: { growth_rate: 15.2 },
                    predictions: { six_month_growth: 18.5 },
                    confidence_score: 0.87
                }
            ];

            mockQueryBuilder.mockResolvedValue({ data: mockTrends, error: null });

            const result = await dbService.getMarketTrends('Templates', 5);

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('category', 'Templates');
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
            expect(result).toEqual(mockTrends);
        });
    });
});

describe('Connection Pool', () => {
    beforeEach(() => {
        // Reset connection pool state
        connectionPool['connections'].clear();
        connectionPool['metrics'] = {
            totalConnections: 0,
            activeConnections: 0,
            failedConnections: 0,
            queryCount: 0,
            avgQueryTime: 0,
        };
    });

    it('should create and manage connections', async () => {
        const connection = await connectionPool.getConnection('test');
        expect(connection).toBeDefined();

        const metrics = connectionPool.getMetrics();
        expect(metrics.totalConnections).toBe(1);
        expect(metrics.activeConnections).toBe(1);
    });

    it('should release connections', async () => {
        await connectionPool.getConnection('test');
        connectionPool.releaseConnection('test');

        const metrics = connectionPool.getMetrics();
        expect(metrics.activeConnections).toBe(0);
    });

    it('should perform health check', async () => {
        const health = await connectionPool.healthCheck();
        expect(health).toHaveProperty('healthy');
        expect(health).toHaveProperty('timestamp');
    });
});

describe('Query Optimizer', () => {
    beforeEach(() => {
        queryOptimizer.clearCache();
    });

    it('should cache query results', async () => {
        const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' });

        // First call should execute the query
        const result1 = await queryOptimizer.cacheQuery('test-key', mockQueryFn, 1000);
        expect(mockQueryFn).toHaveBeenCalledTimes(1);
        expect(result1).toEqual({ data: 'test' });

        // Second call should return cached result
        const result2 = await queryOptimizer.cacheQuery('test-key', mockQueryFn, 1000);
        expect(mockQueryFn).toHaveBeenCalledTimes(1); // Still only called once
        expect(result2).toEqual({ data: 'test' });
    });

    it('should execute queries with retry logic', async () => {
        let attempts = 0;
        const mockQueryFn = vi.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Temporary failure');
            }
            return Promise.resolve({ data: 'success' });
        });

        const result = await queryOptimizer.executeWithRetry(mockQueryFn, 3, 10);
        expect(result).toEqual({ data: 'success' });
        expect(mockQueryFn).toHaveBeenCalledTimes(3);
    });

    it('should batch queries', async () => {
        const queries = [
            () => Promise.resolve('result1'),
            () => Promise.resolve('result2'),
            () => Promise.resolve('result3'),
        ];

        const results = await queryOptimizer.batchQueries(queries);
        expect(results).toEqual(['result1', 'result2', 'result3']);
    });
});

describe('Performance Monitor', () => {
    beforeEach(() => {
        performanceMonitor.reset();
    });

    it('should log query performance', () => {
        performanceMonitor.logQuery('SELECT * FROM users', 500);
        performanceMonitor.logQuery('SELECT * FROM products', 1500); // Slow query

        const metrics = performanceMonitor.getMetrics();
        expect(metrics.totalQueries).toBe(2);
        expect(metrics.avgResponseTime).toBe(1000);

        const slowQueries = performanceMonitor.getSlowQueries();
        expect(slowQueries).toHaveLength(1);
        expect(slowQueries[0].duration).toBe(1500);
    });

    it('should track error rates', () => {
        performanceMonitor.logQuery('SELECT * FROM users', 500);
        performanceMonitor.logQuery('SELECT * FROM products', 300, new Error('Query failed'));

        const metrics = performanceMonitor.getMetrics();
        expect(metrics.errorCount).toBe(1);
        expect(metrics.errorRate).toBe(50);
    });
});