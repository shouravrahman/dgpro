// LemonSqueezy Payment Types

export interface CheckoutData {
    variantId: string;
    userId: string;
    customerEmail: string;
    customerName: string;
    productType: 'subscription' | 'one-time' | 'marketplace-product';
    productName: string;
    productDescription?: string;
    productImages?: string[];
    successUrl: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
}

export interface SubscriptionData {
    id: string;
    customerId: string;
    variantId: string;
    status: 'active' | 'cancelled' | 'expired' | 'paused' | 'past_due' | 'unpaid';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEnd?: string;
    cancelAtPeriodEnd: boolean;
    pausedAt?: string;
    resumesAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerData {
    id?: string;
    name: string;
    email: string;
    city?: string;
    region?: string;
    country?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderData {
    id: string;
    customerId: string;
    variantId: string;
    status: 'pending' | 'paid' | 'refunded' | 'partial_refund';
    total: number;
    subtotal: number;
    tax: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface RefundData {
    orderId: string;
    amount: number;
    reason: string;
    refundType: 'full' | 'partial';
}

export interface WebhookEvent {
    meta: {
        event_name: string;
        custom_data?: Record<string, any>;
    };
    data: {
        type: string;
        id: string;
        attributes: Record<string, any>;
        relationships?: Record<string, any>;
    };
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    customerId: string;
    productId?: string;
    metadata?: Record<string, any>;
}

export interface SubscriptionTier {
    id: 'free' | 'pro';
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    limits: {
        aiRequests: number;
        products: number;
        marketplaceListings: number;
        fileUploads: number;
        storage: string; // e.g., "1GB", "10GB"
    };
}

export interface BillingInfo {
    customerId?: string;
    subscriptionId?: string;
    currentTier: 'free' | 'pro';
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    usage: {
        aiRequests: number;
        products: number;
        marketplaceListings: number;
        fileUploads: number;
        storageUsed: number; // in bytes
    };
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'bank_transfer';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
}

export interface Invoice {
    id: string;
    customerId: string;
    subscriptionId?: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    dueDate: string;
    paidAt?: string;
    createdAt: string;
}

// Marketplace-specific payment types
export interface MarketplaceTransaction {
    id: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    affiliateId?: string;
    amount: number;
    platformFee: number;
    sellerEarnings: number;
    affiliateCommission: number;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    lemonSqueezyOrderId: string;
    createdAt: string;
}

export interface CommissionStructure {
    platformFee: number; // 0.30 = 30%
    paymentProcessing: number; // 0.029 = 2.9%
    affiliateCommission: number; // 0.10 = 10%
    creatorEarnings: number; // 0.60 = 60%
}

export interface PaymentError {
    code: string;
    message: string;
    type: 'validation' | 'payment' | 'network' | 'server';
    details?: Record<string, any>;
}