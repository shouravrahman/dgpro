// Shopping Cart and Checkout Types

export interface ShoppingCart {
    id: string;
    user_id?: string;
    session_id?: string;
    total_amount: number;
    currency: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    expires_at: string;
    items?: CartItem[];
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id?: string;
    bundle_id?: string;
    quantity: number;
    price: number;
    currency: string;
    created_at: string;
    product?: {
        id: string;
        name: string;
        description?: string;
        assets: Record<string, any>;
        category_id?: string;
    };
    bundle?: {
        id: string;
        name: string;
        description?: string;
        bundle_price: number;
    };
}

export interface Coupon {
    id: string;
    code: string;
    name?: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
    discount_value: number;
    minimum_amount: number;
    maximum_discount?: number;
    usage_limit?: number;
    usage_count: number;
    user_limit: number;
    applicable_to: 'all' | 'products' | 'bundles' | 'categories';
    applicable_ids: string[];
    is_active: boolean;
    starts_at: string;
    expires_at?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface CouponValidation {
    is_valid: boolean;
    coupon_id?: string;
    discount_amount: number;
    error_message?: string;
}

export interface CheckoutSession {
    id: string;
    cart_id: string;
    user_id?: string;
    session_id?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

    // Billing information
    billing_email: string;
    billing_name: string;
    billing_address?: BillingAddress;

    // Payment information
    payment_method?: string;
    payment_provider?: string;
    payment_provider_session_id?: string;

    // Totals
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    currency: string;

    // Applied coupons
    applied_coupons: AppliedCoupon[];

    // Metadata
    metadata: Record<string, any>;

    // Timestamps
    created_at: string;
    updated_at: string;
    expires_at: string;
    completed_at?: string;
}

export interface BillingAddress {
    name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
}

export interface AppliedCoupon {
    coupon_id: string;
    code: string;
    discount_amount: number;
    discount_type: string;
}

export interface CartRecommendation {
    product_id: string;
    name: string;
    price: number;
    recommendation_type: 'frequently_bought_together' | 'similar' | 'upsell' | 'cross_sell';
    score: number;
    reason?: string;
    product?: {
        id: string;
        name: string;
        description?: string;
        assets: Record<string, any>;
        category_id?: string;
    };
}

export interface UserAddress {
    id: string;
    user_id: string;
    type: 'billing' | 'shipping';
    is_default: boolean;
    name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

// Form types for checkout
export interface CheckoutFormData {
    billing_email: string;
    billing_name: string;
    billing_address: BillingAddress;
    payment_method: string;
    coupon_code?: string;
    save_address?: boolean;
    terms_accepted: boolean;
}

// Cart operations
export interface AddToCartRequest {
    product_id?: string;
    bundle_id?: string;
    quantity?: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface ApplyCouponRequest {
    coupon_code: string;
}

// Bundle builder types
export interface BundleBuilderItem {
    id: string;
    type: 'product' | 'bundle';
    name: string;
    price: number;
    original_price?: number;
    discount_percentage?: number;
    image_url?: string;
    description?: string;
    category?: string;
    selected: boolean;
}

export interface BundleBuilderState {
    items: BundleBuilderItem[];
    selected_items: BundleBuilderItem[];
    total_price: number;
    total_savings: number;
    bundle_discount: number;
}

// Checkout progress
export interface CheckoutStep {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    current: boolean;
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
    {
        id: 'cart',
        title: 'Review Cart',
        description: 'Review your items and apply coupons',
        completed: false,
        current: false,
    },
    {
        id: 'billing',
        title: 'Billing Information',
        description: 'Enter your billing details',
        completed: false,
        current: false,
    },
    {
        id: 'payment',
        title: 'Payment',
        description: 'Complete your purchase',
        completed: false,
        current: false,
    },
    {
        id: 'confirmation',
        title: 'Confirmation',
        description: 'Order confirmed',
        completed: false,
        current: false,
    },
];

// Animation states
export interface CartAnimationState {
    isAdding: boolean;
    isRemoving: boolean;
    isUpdating: boolean;
    addedItemId?: string;
    removedItemId?: string;
}

// Price calculation helpers
export interface PriceCalculation {
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    savings: number;
    applied_coupons: AppliedCoupon[];
}