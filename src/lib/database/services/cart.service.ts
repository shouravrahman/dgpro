// Shopping Cart Service
// Handles all shopping cart-related database operations

import type { DatabaseClient } from '../index';

export class CartService {
    constructor(private client: DatabaseClient) { }

    async getCart(userId?: string, sessionId?: string) {
        let query = this.client
            .from('shopping_carts')
            .select(`
        *,
        cart_items (
          *,
          products (
            id,
            name,
            slug,
            assets,
            pricing_type,
            price
          ),
          product_bundles (
            id,
            name,
            slug,
            bundle_price
          )
        )
      `);

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (sessionId) {
            query = query.eq('session_id', sessionId);
        }

        query = query.order('updated_at', { ascending: false }).limit(1);

        const { data, error } = await query;

        if (error) throw error;
        return data?.[0] || null;
    }

    async createCart(cartData: {
        userId?: string;
        sessionId?: string;
        currency?: string;
    }) {
        const { data, error } = await this.client
            .from('shopping_carts')
            .insert({
                user_id: cartData.userId,
                session_id: cartData.sessionId,
                total_amount: 0,
                currency: cartData.currency || 'USD'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async addToCart(cartData: {
        userId?: string;
        sessionId?: string;
        productId?: string;
        bundleId?: string;
        quantity: number;
        price: number;
    }) {
        // First, get or create cart
        let cart = await this.getCart(cartData.userId, cartData.sessionId);

        if (!cart) {
            cart = await this.createCart({
                userId: cartData.userId,
                sessionId: cartData.sessionId
            });
        }

        // Check if item already exists in cart
        const existingItem = cart.cart_items?.find(item =>
            (cartData.productId && item.product_id === cartData.productId) ||
            (cartData.bundleId && item.bundle_id === cartData.bundleId)
        );

        if (existingItem) {
            // Update quantity
            const { data, error } = await this.client
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + cartData.quantity,
                    price: cartData.price // Update price in case it changed
                })
                .eq('id', existingItem.id)
                .select()
                .single();

            if (error) throw error;
            await this.updateCartTotal(cart.id);
            return data;
        } else {
            // Add new item to cart
            const { data, error } = await this.client
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: cartData.productId,
                    bundle_id: cartData.bundleId,
                    quantity: cartData.quantity,
                    price: cartData.price,
                    currency: 'USD'
                })
                .select()
                .single();

            if (error) throw error;
            await this.updateCartTotal(cart.id);
            return data;
        }
    }

    async updateCartItem(itemId: string, updates: {
        quantity?: number;
        price?: number;
    }) {
        const { data, error } = await this.client
            .from('cart_items')
            .update(updates)
            .eq('id', itemId)
            .select(`
        *,
        shopping_carts (id)
      `)
            .single();

        if (error) throw error;

        // Update cart total
        if (data.shopping_carts) {
            await this.updateCartTotal(data.shopping_carts.id);
        }

        return data;
    }

    async removeFromCart(itemId: string) {
        // Get cart ID before deleting
        const { data: item } = await this.client
            .from('cart_items')
            .select('cart_id')
            .eq('id', itemId)
            .single();

        const { error } = await this.client
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        // Update cart total
        if (item) {
            await this.updateCartTotal(item.cart_id);
        }
    }

    async clearCart(cartId: string) {
        const { error } = await this.client
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId);

        if (error) throw error;

        // Reset cart total
        await this.client
            .from('shopping_carts')
            .update({ total_amount: 0 })
            .eq('id', cartId);
    }

    async updateCartTotal(cartId: string) {
        const { data: items, error: itemsError } = await this.client
            .from('cart_items')
            .select('price, quantity')
            .eq('cart_id', cartId);

        if (itemsError) throw itemsError;

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const { error } = await this.client
            .from('shopping_carts')
            .update({ total_amount: total })
            .eq('id', cartId);

        if (error) throw error;
        return total;
    }

    async getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
        const cart = await this.getCart(userId, sessionId);
        if (!cart || !cart.cart_items) return 0;

        return cart.cart_items.reduce((total, item) => total + item.quantity, 0);
    }

    async mergeGuestCartToUser(sessionId: string, userId: string) {
        // Get guest cart
        const guestCart = await this.getCart(undefined, sessionId);
        if (!guestCart || !guestCart.cart_items?.length) return;

        // Get or create user cart
        let userCart = await this.getCart(userId);
        if (!userCart) {
            userCart = await this.createCart({ userId });
        }

        // Move items from guest cart to user cart
        for (const item of guestCart.cart_items) {
            await this.addToCart({
                userId,
                productId: item.product_id || undefined,
                bundleId: item.bundle_id || undefined,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Delete guest cart
        await this.client
            .from('shopping_carts')
            .delete()
            .eq('id', guestCart.id);

        return userCart;
    }

    async validateCartItems(cartId: string) {
        const { data: items, error } = await this.client
            .from('cart_items')
            .select(`
        *,
        products (
          id,
          status,
          price,
          pricing_type
        ),
        product_bundles (
          id,
          status,
          bundle_price
        )
      `)
            .eq('cart_id', cartId);

        if (error) throw error;

        const validationResults = items.map(item => {
            const isValid = item.products
                ? item.products.status === 'published'
                : item.product_bundles?.status === 'active';

            const currentPrice = item.products?.price || item.product_bundles?.bundle_price || 0;
            const priceChanged = Math.abs(currentPrice - item.price) > 0.01;

            return {
                itemId: item.id,
                isValid,
                priceChanged,
                currentPrice,
                originalPrice: item.price
            };
        });

        return validationResults;
    }
}