import { z } from 'zod';

// Payment method enums
export const PaymentMethodEnum = z.enum([
    'credit_card',
    'debit_card',
    'paypal',
    'apple_pay',
    'google_pay',
    'bank_transfer',
    'crypto'
]);

export const CurrencyEnum = z.enum([
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
    'CHF',
    'SEK',
    'NOK',
    'DKK'
]);

export const PaymentStatusEnum = z.enum([
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
]);

export const SubscriptionStatusEnum = z.enum([
    'active',
    'inactive',
    'cancelled',
    'past_due',
    'unpaid',
    'trialing'
]);

// Credit card validation
const creditCardSchema = z.object({
    number: z
        .string()
        .regex(/^\d{13,19}$/, 'Invalid card number')
        .refine((num) => {
            // Luhn algorithm validation
            let sum = 0;
            let isEven = false;
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num[i]);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        }, 'Invalid card number'),

    expiryMonth: z
        .number()
        .min(1, 'Invalid month')
        .max(12, 'Invalid month'),

    expiryYear: z
        .number()
        .min(new Date().getFullYear(), 'Card has expired')
        .max(new Date().getFullYear() + 20, 'Invalid expiry year'),

    cvv: z
        .string()
        .regex(/^\d{3,4}$/, 'Invalid CVV'),

    holderName: z
        .string()
        .min(2, 'Cardholder name is required')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
});

// Billing address schema
const billingAddressSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in first name'),

    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in last name'),

    email: z
        .string()
        .email('Invalid email address')
        .max(255, 'Email too long'),

    phone: z
        .string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')
        .min(10, 'Phone number too short')
        .max(20, 'Phone number too long')
        .optional(),

    company: z
        .string()
        .max(100, 'Company name too long')
        .optional(),

    address1: z
        .string()
        .min(1, 'Address is required')
        .max(100, 'Address too long'),

    address2: z
        .string()
        .max(100, 'Address too long')
        .optional(),

    city: z
        .string()
        .min(1, 'City is required')
        .max(50, 'City name too long'),

    state: z
        .string()
        .min(1, 'State/Province is required')
        .max(50, 'State/Province too long'),

    postalCode: z
        .string()
        .min(1, 'Postal code is required')
        .max(20, 'Postal code too long'),

    country: z
        .string()
        .length(2, 'Invalid country code')
        .regex(/^[A-Z]{2}$/, 'Country code must be uppercase'),
});

// Cart item schema
const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100'),
    price: z
        .number()
        .min(0, 'Price cannot be negative')
        .max(10000, 'Price too high'),
    licenseType: z.string().optional(),
});

// Checkout schema
export const checkoutSchema = z.object({
    items: z
        .array(cartItemSchema)
        .min(1, 'Cart cannot be empty')
        .max(50, 'Too many items in cart'),

    paymentMethod: PaymentMethodEnum,

    creditCard: creditCardSchema.optional(),

    billingAddress: billingAddressSchema,

    currency: CurrencyEnum.default('USD'),

    couponCode: z
        .string()
        .max(50, 'Coupon code too long')
        .regex(/^[A-Z0-9-_]+$/i, 'Invalid coupon code format')
        .optional(),

    savePaymentMethod: z.boolean().default(false),

    agreeToTerms: z
        .boolean()
        .refine(val => val === true, 'You must agree to the terms and conditions'),

    subscribeToNewsletter: z.boolean().default(false),
});

// Payment processing schema
export const processPaymentSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z
        .number()
        .min(0.01, 'Amount must be greater than 0')
        .max(100000, 'Amount too high'),
    currency: CurrencyEnum,
    paymentMethodId: z.string().min(1, 'Payment method ID is required'),
    customerId: z.string().min(1, 'Customer ID is required'),
});

// Refund schema
export const refundSchema = z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    amount: z
        .number()
        .min(0.01, 'Refund amount must be greater than 0')
        .max(100000, 'Refund amount too high')
        .optional(), // If not provided, full refund
    reason: z
        .string()
        .min(1, 'Refund reason is required')
        .max(500, 'Reason too long'),
    notifyCustomer: z.boolean().default(true),
});

// Subscription schema
export const subscriptionSchema = z.object({
    planId: z.string().min(1, 'Plan ID is required'),
    customerId: z.string().min(1, 'Customer ID is required'),
    paymentMethodId: z.string().min(1, 'Payment method ID is required'),
    trialDays: z
        .number()
        .int('Trial days must be a whole number')
        .min(0, 'Trial days cannot be negative')
        .max(365, 'Trial period too long')
        .optional(),
    couponCode: z
        .string()
        .max(50, 'Coupon code too long')
        .optional(),
});

// Subscription update schema
export const updateSubscriptionSchema = z.object({
    subscriptionId: z.string().min(1, 'Subscription ID is required'),
    planId: z.string().min(1, 'Plan ID is required').optional(),
    paymentMethodId: z.string().min(1, 'Payment method ID is required').optional(),
    couponCode: z.string().max(50, 'Coupon code too long').optional(),
    prorate: z.boolean().default(true),
});

// Coupon schema
export const couponSchema = z.object({
    code: z
        .string()
        .min(3, 'Coupon code must be at least 3 characters')
        .max(50, 'Coupon code too long')
        .regex(/^[A-Z0-9-_]+$/i, 'Invalid coupon code format'),

    type: z.enum(['percentage', 'fixed_amount']),

    value: z
        .number()
        .min(0.01, 'Coupon value must be greater than 0'),

    minimumAmount: z
        .number()
        .min(0, 'Minimum amount cannot be negative')
        .optional(),

    maximumDiscount: z
        .number()
        .min(0, 'Maximum discount cannot be negative')
        .optional(),

    usageLimit: z
        .number()
        .int('Usage limit must be a whole number')
        .min(1, 'Usage limit must be at least 1')
        .optional(),

    expiresAt: z.date().optional(),

    isActive: z.boolean().default(true),

    applicableProducts: z
        .array(z.string())
        .optional(),

    applicableCategories: z
        .array(z.string())
        .optional(),
});

// Webhook schema for payment events
export const paymentWebhookSchema = z.object({
    eventType: z.enum([
        'payment.completed',
        'payment.failed',
        'subscription.created',
        'subscription.updated',
        'subscription.cancelled',
        'refund.created'
    ]),
    data: z.record(z.any()),
    timestamp: z.number(),
    signature: z.string().min(1, 'Webhook signature is required'),
});

// Export types
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type Currency = z.infer<typeof CurrencyEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export type CreditCard = z.infer<typeof creditCardSchema>;
export type BillingAddress = z.infer<typeof billingAddressSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;
export type ProcessPaymentData = z.infer<typeof processPaymentSchema>;
export type RefundData = z.infer<typeof refundSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
export type UpdateSubscriptionData = z.infer<typeof updateSubscriptionSchema>;
export type CouponData = z.infer<typeof couponSchema>;
export type PaymentWebhookData = z.infer<typeof paymentWebhookSchema>;

// Validation refinements
export const checkoutSchemaRefined = checkoutSchema
    .refine((data) => {
        // Credit card required for card payments
        if (['credit_card', 'debit_card'].includes(data.paymentMethod) && !data.creditCard) {
            return false;
        }
        return true;
    }, {
        message: 'Credit card information is required for card payments',
        path: ['creditCard'],
    })
    .refine((data) => {
        // Validate total amount
        const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total > 0 && total <= 100000;
    }, {
        message: 'Invalid order total',
        path: ['items'],
    });

// Payment validation utilities
export function validateCreditCardNumber(number: string): {
    isValid: boolean;
    cardType: string;
} {
    const cleaned = number.replace(/\s/g, '');

    // Card type detection
    const cardTypes = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    };

    let cardType = 'unknown';
    for (const [type, regex] of Object.entries(cardTypes)) {
        if (regex.test(cleaned)) {
            cardType = type;
            break;
        }
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }

    return {
        isValid: sum % 10 === 0 && cardType !== 'unknown',
        cardType,
    };
}

export function validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const expiry = new Date(year, month - 1);
    return expiry > now;
}

export function formatCreditCardNumber(number: string): string {
    const cleaned = number.replace(/\s/g, '');
    const match = cleaned.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/);
    if (match) {
        return [match[1], match[2], match[3], match[4]]
            .filter(Boolean)
            .join(' ');
    }
    return cleaned;
}

export function maskCreditCardNumber(number: string): string {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    return '**** **** **** ' + cleaned.slice(-4);
}

// Input sanitization
export function sanitizeCouponCode(code: string): string {
    return code.toUpperCase().trim().replace(/[^A-Z0-9-_]/g, '');
}

export function sanitizeAmount(amount: number): number {
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
}