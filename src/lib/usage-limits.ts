import { createClient } from '@/lib/supabase/server';

export type UsageType = 'ai_requests' | 'products' | 'marketplace_listings' | 'file_uploads';

export interface UsageLimits {
    free: {
        aiRequests: number;
        products: number;
        marketplaceListings: number;
        fileUploads: number;
        storageBytes: number;
    };
    pro: {
        aiRequests: number; // -1 for unlimited
        products: number; // -1 for unlimited
        marketplaceListings: number; // -1 for unlimited
        fileUploads: number; // -1 for unlimited
        storageBytes: number;
    };
}

export const USAGE_LIMITS: UsageLimits = {
    free: {
        aiRequests: 10,
        products: 3,
        marketplaceListings: 1,
        fileUploads: 5,
        storageBytes: 100 * 1024 * 1024, // 100MB
    },
    pro: {
        aiRequests: -1, // Unlimited
        products: -1, // Unlimited
        marketplaceListings: -1, // Unlimited
        fileUploads: -1, // Unlimited
        storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    },
};

export class UsageLimitError extends Error {
    constructor(
        public usageType: UsageType,
        public currentUsage: number,
        public limit: number,
        public tier: string
    ) {
        super(`Usage limit exceeded for ${usageType}. Current: ${currentUsage}, Limit: ${limit} (${tier} tier)`);
        this.name = 'UsageLimitError';
    }
}

export async function checkUsageLimit(
    userId: string,
    usageType: UsageType,
    increment: number = 1
): Promise<{ canUse: boolean; currentUsage: number; limit: number; tier: string }> {
    const supabase = createClient();

    // Get user's current tier and usage
    const { data: user, error } = await supabase
        .from('users')
        .select(`
      subscription_tier,
      usage_ai_requests,
      usage_products,
      usage_marketplace_listings,
      usage_file_uploads,
      usage_storage_bytes
    `)
        .eq('id', userId)
        .single();

    if (error || !user) {
        throw new Error('Failed to get user usage data');
    }

    const tier = user.subscription_tier || 'free';
    const limits = USAGE_LIMITS[tier as keyof UsageLimits];

    // Get current usage based on type
    let currentUsage = 0;
    let limit = 0;

    switch (usageType) {
        case 'ai_requests':
            currentUsage = user.usage_ai_requests || 0;
            limit = limits.aiRequests;
            break;
        case 'products':
            currentUsage = user.usage_products || 0;
            limit = limits.products;
            break;
        case 'marketplace_listings':
            currentUsage = user.usage_marketplace_listings || 0;
            limit = limits.marketplaceListings;
            break;
        case 'file_uploads':
            currentUsage = user.usage_file_uploads || 0;
            limit = limits.fileUploads;
            break;
        default:
            throw new Error(`Invalid usage type: ${usageType}`);
    }

    // -1 means unlimited (pro tier)
    const canUse = limit === -1 || (currentUsage + increment) <= limit;

    return {
        canUse,
        currentUsage,
        limit,
        tier,
    };
}

export async function incrementUsage(
    userId: string,
    usageType: UsageType,
    increment: number = 1
): Promise<void> {
    // Check if usage is allowed
    const usageCheck = await checkUsageLimit(userId, usageType, increment);

    if (!usageCheck.canUse) {
        throw new UsageLimitError(
            usageType,
            usageCheck.currentUsage,
            usageCheck.limit,
            usageCheck.tier
        );
    }

    // Increment usage using the database function
    const supabase = createClient();
    const { error } = await supabase.rpc('increment_user_usage', {
        user_uuid: userId,
        usage_type: usageType,
        increment_by: increment,
    });

    if (error) {
        throw new Error(`Failed to increment usage: ${error.message}`);
    }
}

export async function updateStorageUsage(
    userId: string,
    bytesChange: number
): Promise<void> {
    const supabase = createClient();

    // Get current storage usage and tier
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_tier, usage_storage_bytes')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        throw new Error('Failed to get user storage data');
    }

    const tier = user.subscription_tier || 'free';
    const limits = USAGE_LIMITS[tier as keyof UsageLimits];
    const currentUsage = user.usage_storage_bytes || 0;
    const newUsage = Math.max(0, currentUsage + bytesChange);

    // Check storage limit (only for positive changes)
    if (bytesChange > 0 && limits.storageBytes !== -1 && newUsage > limits.storageBytes) {
        throw new UsageLimitError(
            'storage' as UsageType,
            currentUsage,
            limits.storageBytes,
            tier
        );
    }

    // Update storage usage
    const { error } = await supabase.rpc('update_user_storage_usage', {
        user_uuid: userId,
        bytes_change: bytesChange,
    });

    if (error) {
        throw new Error(`Failed to update storage usage: ${error.message}`);
    }
}

export function formatStorageSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getUsagePercentage(current: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    return Math.round((current / limit) * 100);
}

export function isNearLimit(current: number, limit: number, threshold: number = 80): boolean {
    if (limit === -1) return false; // Unlimited
    return getUsagePercentage(current, limit) >= threshold;
}

// Middleware function to check usage before API operations
export async function withUsageCheck<T>(
    userId: string,
    usageType: UsageType,
    operation: () => Promise<T>,
    increment: number = 1
): Promise<T> {
    // Check usage limit first
    const usageCheck = await checkUsageLimit(userId, usageType, increment);

    if (!usageCheck.canUse) {
        throw new UsageLimitError(
            usageType,
            usageCheck.currentUsage,
            usageCheck.limit,
            usageCheck.tier
        );
    }

    // Execute the operation
    const result = await operation();

    // Increment usage after successful operation
    await incrementUsage(userId, usageType, increment);

    return result;
}