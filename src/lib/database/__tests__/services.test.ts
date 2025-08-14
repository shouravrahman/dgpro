// Database Services Tests
// Tests for the new service-based database architecture

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { CartService } from '../services/cart.service';
import type { Database } from '@/types/database';

// Mock Supabase client
const mockSupabaseClient = {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
        getUser: vi.fn(),
    },
};

// Mock query builder that can be used as a promise
const createMockQueryBuilder = (resolveValue: any) => {
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
        textSearch: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(resolveValue),
        maybeSingle: vi.fn().mockResolvedValue(resolveValue),
        // Make it thenable so it can be awaited directly
        then: vi.fn((onResolve) => Promise.resolve(resolveValue).then(onResolve)),
        catch: vi.fn((onReject) => Promise.resolve(resolveValue).catch(onReject)),
        finally: vi.fn((onFinally) => Promise.resolve(resolveValue).finally(onFinally)),
    };

    return mockQueryBuilder;
};

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        vi.clearAllMocks();
        userService = new UserService(mockSupabaseClient as any);
    });

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

        const mockQueryBuilder = createMockQueryBuilder({ data: mockUser, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await userService.getUser('123');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123');
        expect(result).toEqual(mockUser);
    });

    it('should update user successfully', async () => {
        const updates = { full_name: 'Updated Name' };
        const mockUpdatedUser = { id: '123', ...updates };

        const mockQueryBuilder = createMockQueryBuilder({ data: mockUpdatedUser, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await userService.updateUser('123', updates);

        expect(mockQueryBuilder.update).toHaveBeenCalledWith(updates);
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123');
        expect(result).toEqual(mockUpdatedUser);
    });

    it('should follow user successfully', async () => {
        const mockFollow = {
            id: 'follow-123',
            follower_id: '123',
            following_id: '456',
            created_at: new Date().toISOString()
        };

        const mockQueryBuilder = createMockQueryBuilder({ data: mockFollow, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await userService.followUser('123', '456');

        expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
            follower_id: '123',
            following_id: '456'
        });
        expect(result).toEqual(mockFollow);
    });
});

describe('ProductService', () => {
    let productService: ProductService;

    beforeEach(() => {
        vi.clearAllMocks();
        productService = new ProductService(mockSupabaseClient as any);
    });

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

        const mockQueryBuilder = createMockQueryBuilder({ data: mockProduct, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await productService.getProduct('456');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '456');
        expect(result).toEqual(mockProduct);
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
        const mockQueryBuilder = createMockQueryBuilder({ data: mockCreatedProduct, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await productService.createProduct(newProduct);

        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(newProduct);
        expect(result).toEqual(mockCreatedProduct);
    });

    it('should like product successfully', async () => {
        const mockLike = {
            id: 'like-123',
            product_id: '456',
            user_id: '123',
            created_at: new Date().toISOString()
        };

        const mockQueryBuilder = createMockQueryBuilder({ data: mockLike, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null });

        const result = await productService.likeProduct('456', '123');

        expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
            product_id: '456',
            user_id: '123'
        });
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_product_likes', { product_id: '456' });
        expect(result).toEqual(mockLike);
    });
});

describe('CategoryService', () => {
    let categoryService: CategoryService;

    beforeEach(() => {
        vi.clearAllMocks();
        categoryService = new CategoryService(mockSupabaseClient as any);
    });

    it('should get root categories', async () => {
        const mockCategories = [
            { id: '1', name: 'Templates', parent_id: null, sort_order: 1 },
            { id: '2', name: 'Software', parent_id: null, sort_order: 2 }
        ];

        const mockQueryBuilder = createMockQueryBuilder({ data: mockCategories, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await categoryService.getCategories();

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

        const mockQueryBuilder = createMockQueryBuilder({ data: mockSubcategories, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await categoryService.getCategories('1');

        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('parent_id', '1');
        expect(result).toEqual(mockSubcategories);
    });
});

describe('CartService', () => {
    let cartService: CartService;

    beforeEach(() => {
        vi.clearAllMocks();
        cartService = new CartService(mockSupabaseClient as any);
    });

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
                }
            ]
        };

        const mockQueryBuilder = createMockQueryBuilder({ data: [mockCart], error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await cartService.getCart('123');

        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', '123');
        expect(result).toEqual(mockCart);
    });

    it('should create new cart', async () => {
        const mockCart = {
            id: 'cart-123',
            user_id: '123',
            total_amount: 0,
            currency: 'USD'
        };

        const mockQueryBuilder = createMockQueryBuilder({ data: mockCart, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await cartService.createCart({ userId: '123' });

        expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
            user_id: '123',
            session_id: undefined,
            total_amount: 0,
            currency: 'USD'
        });
        expect(result).toEqual(mockCart);
    });

    it('should validate cart items', async () => {
        const mockItems = [
            {
                id: 'item-1',
                product_id: '456',
                price: 29.99,
                products: { id: '456', status: 'published', price: 29.99 }
            },
            {
                id: 'item-2',
                product_id: '789',
                price: 19.99,
                products: { id: '789', status: 'archived', price: 24.99 }
            }
        ];

        const mockQueryBuilder = createMockQueryBuilder({ data: mockItems, error: null });
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const result = await cartService.validateCartItems('cart-123');

        expect(result).toHaveLength(2);
        expect(result[0].isValid).toBe(true);
        expect(result[0].priceChanged).toBe(false);
        expect(result[1].isValid).toBe(false);
        expect(result[1].priceChanged).toBe(true);
    });
});