import { z } from 'zod';

// Cart item validation
export const addToCartSchema = z.object({
    product_id: z.string().uuid().optional(),
    bundle_id: z.string().uuid().optional(),
    quantity: z.number().int().min(1).max(100).default(1),
}).refine(
    (data) => data.product_id || data.bundle_id,
    {
        message: "Either product_id or bundle_id must be provided",
        path: ["product_id"],
    }
);

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1).max(100),
});

// Coupon validation
export const applyCouponSchema = z.object({
    coupon_code: z.string().min(1).max(50).trim().toUpperCase(),
});

// Billing address validation
export const billingAddressSchema = z.object({
    name: z.string().min(1).max(255).trim(),
    company: z.string().max(255).trim().optional(),
    address_line_1: z.string().min(1).max(255).trim(),
    address_line_2: z.string().max(255).trim().optional(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().max(100).trim().optional(),
    postal_code: z.string().min(1).max(20).trim(),
    country: z.string().length(2).toUpperCase(), // ISO country code
    phone: z.string().max(20).trim().optional(),
});

// Checkout form validation
export const checkoutFormSchema = z.object({
    billing_email: z.string().email().max(255),
    billing_name: z.string().min(1).max(255).trim(),
    billing_address: billingAddressSchema,
    payment_method: z.string().min(1).max(50),
    coupon_code: z.string().max(50).trim().optional(),
    save_address: z.boolean().default(false),
    terms_accepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions",
    }),
});

// User address validation
export const userAddressSchema = z.object({
    type: z.enum(['billing', 'shipping']).default('billing'),
    is_default: z.boolean().default(false),
    name: z.string().min(1).max(255).trim(),
    company: z.string().max(255).trim().optional(),
    address_line_1: z.string().min(1).max(255).trim(),
    address_line_2: z.string().max(255).trim().optional(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().max(100).trim().optional(),
    postal_code: z.string().min(1).max(20).trim(),
    country: z.string().length(2).toUpperCase(),
    phone: z.string().max(20).trim().optional(),
});

// Bundle builder validation
export const bundleBuilderSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(1000).trim().optional(),
    selected_items: z.array(z.string().uuid()).min(2).max(20),
    bundle_discount: z.number().min(0).max(50).default(10), // Percentage
});

// Coupon creation validation (admin only)
export const createCouponSchema = z.object({
    code: z.string().min(3).max(50).trim().toUpperCase(),
    name: z.string().max(100).trim().optional(),
    description: z.string().max(500).trim().optional(),
    discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
    discount_value: z.number().min(0),
    minimum_amount: z.number().min(0).default(0),
    maximum_discount: z.number().min(0).optional(),
    usage_limit: z.number().int().min(1).optional(),
    user_limit: z.number().int().min(1).default(1),
    applicable_to: z.enum(['all', 'products', 'bundles', 'categories']).default('all'),
    applicable_ids: z.array(z.string().uuid()).default([]),
    starts_at: z.string().datetime().optional(),
    expires_at: z.string().datetime().optional(),
}).refine(
    (data) => {
        if (data.discount_type === 'percentage' && data.discount_value > 100) {
            return false;
        }
        return true;
    },
    {
        message: "Percentage discount cannot exceed 100%",
        path: ["discount_value"],
    }
).refine(
    (data) => {
        if (data.starts_at && data.expires_at) {
            return new Date(data.expires_at) > new Date(data.starts_at);
        }
        return true;
    },
    {
        message: "Expiry date must be after start date",
        path: ["expires_at"],
    }
);

// Cart query parameters
export const cartQuerySchema = z.object({
    include_recommendations: z.boolean().default(true),
    include_items: z.boolean().default(true),
});

// Checkout session creation
export const createCheckoutSessionSchema = z.object({
    cart_id: z.string().uuid(),
    billing_email: z.string().email(),
    billing_name: z.string().min(1).max(255),
    billing_address: billingAddressSchema,
    payment_method: z.string().min(1).max(50),
    applied_coupons: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
});

// Address autocomplete validation
export const addressAutocompleteSchema = z.object({
    query: z.string().min(3).max(200).trim(),
    country: z.string().length(2).toUpperCase().optional(),
    limit: z.number().int().min(1).max(10).default(5),
});

// Price calculation validation
export const calculatePriceSchema = z.object({
    cart_id: z.string().uuid(),
    coupon_codes: z.array(z.string()).default([]),
    tax_rate: z.number().min(0).max(1).default(0), // 0-1 (0% to 100%)
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type BillingAddressInput = z.infer<typeof billingAddressSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
export type UserAddressInput = z.infer<typeof userAddressSchema>;
export type BundleBuilderInput = z.infer<typeof bundleBuilderSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type CartQueryInput = z.infer<typeof cartQuerySchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type AddressAutocompleteInput = z.infer<typeof addressAutocompleteSchema>;
export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>;