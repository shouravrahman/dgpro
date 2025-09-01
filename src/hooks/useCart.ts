'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type {
    ShoppingCart,
    CartItem,
    CartRecommendation,
    AddToCartRequest,
    UpdateCartItemRequest,
    ApplyCouponRequest,
    CartAnimationState,
    PriceCalculation
} from '@/types/cart';

interface UseCartReturn {
    // State
    cart: ShoppingCart | null;
    recommendations: CartRecommendation[];
    isLoading: boolean;
    isUpdating: boolean;
    animationState: CartAnimationState;

    // Actions
    fetchCart: () => Promise<void>;
    addToCart: (request: AddToCartRequest) => Promise<void>;
    updateCartItem: (itemId: string, request: UpdateCartItemRequest) => Promise<void>;
    removeCartItem: (itemId: string) => Promise<void>;
    applyCoupon: (request: ApplyCouponRequest) => Promise<void>;
    removeCoupon: (couponCode: string) => Promise<void>;
    clearCart: () => Promise<void>;

    // Computed
    itemCount: number;
    totalAmount: number;
    hasItems: boolean;
}

export function useCart(): UseCartReturn {
    const [cart, setCart] = useState<ShoppingCart | null>(null);
    const [recommendations, setRecommendations] = useState<CartRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [animationState, setAnimationState] = useState<CartAnimationState>({
        isAdding: false,
        isRemoving: false,
        isUpdating: false,
    });

    const { toast } = useToast();

    // Generate session ID for guest users
    const getSessionId = useCallback(() => {
        let sessionId = localStorage.getItem('cart-session-id');
        if (!sessionId) {
            sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('cart-session-id', sessionId);
        }
        return sessionId;
    }, []);

    // Fetch cart data
    const fetchCart = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/cart?include_items=true&include_recommendations=true', {
                headers: {
                    'x-session-id': getSessionId(),
                },
            });

            const result = await response.json();

            if (result.success) {
                setCart(result.data.cart);
                setRecommendations(result.data.recommendations || []);
            } else {
                console.error('Failed to fetch cart:', result.error);
                toast({
                    title: 'Error',
                    description: 'Failed to load cart',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Cart fetch error:', error);
            toast({
                title: 'Error',
                description: 'Failed to load cart',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [getSessionId, toast]);

    // Add item to cart
    const addToCart = useCallback(async (request: AddToCartRequest) => {
        try {
            setAnimationState(prev => ({ ...prev, isAdding: true }));

            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': getSessionId(),
                },
                body: JSON.stringify(request),
            });

            const result = await response.json();

            if (result.success) {
                setCart(result.data.cart);
                setAnimationState(prev => ({
                    ...prev,
                    addedItemId: result.data.cart_item.id
                }));

                toast({
                    title: 'Added to cart',
                    description: 'Item has been added to your cart',
                });

                // Fetch updated recommendations
                setTimeout(() => fetchCart(), 500);
            } else {
                toast({
                    title: 'Error',
                    description: result.error.message || 'Failed to add item to cart',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            toast({
                title: 'Error',
                description: 'Failed to add item to cart',
                variant: 'destructive',
            });
        } finally {
            setAnimationState(prev => ({
                ...prev,
                isAdding: false,
                addedItemId: undefined
            }));
        }
    }, [getSessionId, toast, fetchCart]);

    // Update cart item
    const updateCartItem = useCallback(async (itemId: string, request: UpdateCartItemRequest) => {
        try {
            setIsUpdating(true);
            setAnimationState(prev => ({ ...prev, isUpdating: true }));

            const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': getSessionId(),
                },
                body: JSON.stringify(request),
            });

            const result = await response.json();

            if (result.success) {
                setCart(result.data.cart);

                toast({
                    title: 'Cart updated',
                    description: 'Item quantity has been updated',
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.error.message || 'Failed to update cart item',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Update cart item error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update cart item',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
            setAnimationState(prev => ({ ...prev, isUpdating: false }));
        }
    }, [getSessionId, toast]);

    // Remove cart item
    const removeCartItem = useCallback(async (itemId: string) => {
        try {
            setAnimationState(prev => ({
                ...prev,
                isRemoving: true,
                removedItemId: itemId
            }));

            const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'x-session-id': getSessionId(),
                },
            });

            const result = await response.json();

            if (result.success) {
                setCart(result.data.cart);

                toast({
                    title: 'Item removed',
                    description: 'Item has been removed from your cart',
                });

                // Fetch updated recommendations
                setTimeout(() => fetchCart(), 500);
            } else {
                toast({
                    title: 'Error',
                    description: result.error.message || 'Failed to remove cart item',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Remove cart item error:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove cart item',
                variant: 'destructive',
            });
        } finally {
            setAnimationState(prev => ({
                ...prev,
                isRemoving: false,
                removedItemId: undefined
            }));
        }
    }, [getSessionId, toast, fetchCart]);

    // Apply coupon
    const applyCoupon = useCallback(async (request: ApplyCouponRequest) => {
        try {
            setIsUpdating(true);

            const response = await fetch('/api/cart/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: 'Coupon applied',
                    description: `You saved $${result.data.discount_amount.toFixed(2)}!`,
                });

                // Refresh cart to get updated totals
                await fetchCart();
            } else {
                toast({
                    title: 'Invalid coupon',
                    description: result.error.message || 'Coupon code is not valid',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Apply coupon error:', error);
            toast({
                title: 'Error',
                description: 'Failed to apply coupon',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    }, [toast, fetchCart]);

    // Remove coupon
    const removeCoupon = useCallback(async (couponCode: string) => {
        try {
            setIsUpdating(true);

            const response = await fetch(`/api/cart/coupons?code=${encodeURIComponent(couponCode)}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: 'Coupon removed',
                    description: 'Coupon has been removed from your cart',
                });

                // Refresh cart to get updated totals
                await fetchCart();
            } else {
                toast({
                    title: 'Error',
                    description: result.error.message || 'Failed to remove coupon',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Remove coupon error:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove coupon',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    }, [toast, fetchCart]);

    // Clear cart
    const clearCart = useCallback(async () => {
        if (!cart?.items) return;

        try {
            setIsUpdating(true);

            // Remove all items
            const promises = cart.items.map(item =>
                fetch(`/api/cart/items/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-session-id': getSessionId(),
                    },
                })
            );

            await Promise.all(promises);

            toast({
                title: 'Cart cleared',
                description: 'All items have been removed from your cart',
            });

            await fetchCart();
        } catch (error) {
            console.error('Clear cart error:', error);
            toast({
                title: 'Error',
                description: 'Failed to clear cart',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    }, [cart?.items, getSessionId, toast, fetchCart]);

    // Computed values
    const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    const totalAmount = cart?.total_amount || 0;
    const hasItems = itemCount > 0;

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        // State
        cart,
        recommendations,
        isLoading,
        isUpdating,
        animationState,

        // Actions
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        applyCoupon,
        removeCoupon,
        clearCart,

        // Computed
        itemCount,
        totalAmount,
        hasItems,
    };
}