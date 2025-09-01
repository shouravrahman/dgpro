import {
    createCheckout,
    getCustomer,
    getSubscription,
    updateSubscription,
    cancelSubscription,
    getOrder,
    listOrders,
    createCustomer,
    updateCustomer,
    listSubscriptions,
    getVariant,
    listProducts,
} from '@lemonsqueezy/lemonsqueezy.js';
import { LEMONSQUEEZY_CONFIG, LEMONSQUEEZY_PRODUCTS } from './config';
import type {
    CheckoutData,
    SubscriptionData,
    CustomerData,
    OrderData,
    RefundData,
} from '@/types/payments';

export class LemonSqueezyClient {
    private storeId: string;

    constructor() {
        this.storeId = LEMONSQUEEZY_CONFIG.storeId;
    }

    // Checkout Management
    async createCheckoutSession(data: CheckoutData) {
        try {
            const checkout = await createCheckout(this.storeId, data.variantId, {
                checkoutOptions: {
                    embed: false,
                    media: true,
                    logo: true,
                },
                checkoutData: {
                    email: data.customerEmail,
                    name: data.customerName,
                    custom: {
                        user_id: data.userId,
                        product_type: data.productType,
                        metadata: JSON.stringify(data.metadata || {}),
                    },
                },
                productOptions: {
                    name: data.productName,
                    description: data.productDescription,
                    media: data.productImages || [],
                    redirectUrl: data.successUrl,
                    receiptButtonText: 'Go to Dashboard',
                    receiptThankYouNote: 'Thank you for your purchase!',
                },
                expiresAt: data.expiresAt,
            });

            return {
                success: true,
                data: {
                    checkoutUrl: checkout.data?.attributes.url,
                    checkoutId: checkout.data?.id,
                },
            };
        } catch (error) {
            console.error('LemonSqueezy checkout creation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Checkout creation failed',
            };
        }
    }

    // Subscription Management
    async getSubscriptionDetails(subscriptionId: string) {
        try {
            const subscription = await getSubscription(subscriptionId);
            return {
                success: true,
                data: subscription.data,
            };
        } catch (error) {
            console.error('Failed to get subscription:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get subscription',
            };
        }
    }

    async updateSubscriptionPlan(subscriptionId: string, newVariantId: string) {
        try {
            const subscription = await updateSubscription(subscriptionId, {
                variantId: parseInt(newVariantId),
            });
            return {
                success: true,
                data: subscription.data,
            };
        } catch (error) {
            console.error('Failed to update subscription:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update subscription',
            };
        }
    }

    async cancelSubscriptionPlan(subscriptionId: string, cancelAtPeriodEnd = true) {
        try {
            const subscription = await cancelSubscription(subscriptionId, {
                cancelAtPeriodEnd,
            });
            return {
                success: true,
                data: subscription.data,
            };
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to cancel subscription',
            };
        }
    }

    async pauseSubscription(subscriptionId: string, resumeAt?: string) {
        try {
            const subscription = await updateSubscription(subscriptionId, {
                pause: {
                    mode: 'void',
                    resumesAt: resumeAt,
                },
            });
            return {
                success: true,
                data: subscription.data,
            };
        } catch (error) {
            console.error('Failed to pause subscription:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to pause subscription',
            };
        }
    }

    async resumeSubscription(subscriptionId: string) {
        try {
            const subscription = await updateSubscription(subscriptionId, {
                pause: null,
            });
            return {
                success: true,
                data: subscription.data,
            };
        } catch (error) {
            console.error('Failed to resume subscription:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to resume subscription',
            };
        }
    }

    // Customer Management
    async createCustomerRecord(customerData: CustomerData) {
        try {
            const customer = await createCustomer(this.storeId, {
                name: customerData.name,
                email: customerData.email,
                city: customerData.city,
                region: customerData.region,
                country: customerData.country,
            });
            return {
                success: true,
                data: customer.data,
            };
        } catch (error) {
            console.error('Failed to create customer:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create customer',
            };
        }
    }

    async getCustomerDetails(customerId: string) {
        try {
            const customer = await getCustomer(customerId);
            return {
                success: true,
                data: customer.data,
            };
        } catch (error) {
            console.error('Failed to get customer:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get customer',
            };
        }
    }

    async updateCustomerDetails(customerId: string, customerData: Partial<CustomerData>) {
        try {
            const customer = await updateCustomer(customerId, customerData);
            return {
                success: true,
                data: customer.data,
            };
        } catch (error) {
            console.error('Failed to update customer:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update customer',
            };
        }
    }

    // Order Management
    async getOrderDetails(orderId: string) {
        try {
            const order = await getOrder(orderId);
            return {
                success: true,
                data: order.data,
            };
        } catch (error) {
            console.error('Failed to get order:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get order',
            };
        }
    }

    async getCustomerOrders(customerId: string) {
        try {
            const orders = await listOrders({
                filter: {
                    customerId,
                },
            });
            return {
                success: true,
                data: orders.data || [],
            };
        } catch (error) {
            console.error('Failed to get customer orders:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get customer orders',
            };
        }
    }

    // Product and Variant Management
    async getProductVariants(productId: string) {
        try {
            const variants = await getVariant(productId);
            return {
                success: true,
                data: variants.data,
            };
        } catch (error) {
            console.error('Failed to get product variants:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get product variants',
            };
        }
    }

    async getStoreProducts() {
        try {
            const products = await listProducts({
                filter: {
                    storeId: this.storeId,
                },
            });
            return {
                success: true,
                data: products.data || [],
            };
        } catch (error) {
            console.error('Failed to get store products:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get store products',
            };
        }
    }

    // Utility Methods
    getSubscriptionVariantId(tier: 'pro', interval: 'monthly' | 'yearly') {
        return LEMONSQUEEZY_PRODUCTS.subscriptions[tier][interval];
    }

    getFeaturedListingVariantId(duration: 'daily' | 'weekly' | 'monthly') {
        return LEMONSQUEEZY_PRODUCTS.oneTime.featuredListing[duration];
    }

    // Refund Management (Note: LemonSqueezy doesn't have direct refund API, this would be handled via webhooks)
    async processRefund(refundData: RefundData) {
        // This would typically be handled through LemonSqueezy dashboard or webhooks
        // For now, we'll return a placeholder response
        console.log('Refund request received:', refundData);
        return {
            success: false,
            error: 'Refunds must be processed through LemonSqueezy dashboard',
        };
    }
}

// Export singleton instance
export const lemonSqueezyClient = new LemonSqueezyClient();