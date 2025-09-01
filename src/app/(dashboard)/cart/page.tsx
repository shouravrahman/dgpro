'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
  Shield,
  Clock,
  Download,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/useCart';
import { CartRecommendations } from '@/components/cart/CartRecommendations';
import { CouponInput } from '@/components/cart/CouponInput';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    recommendations,
    isLoading,
    isUpdating,
    updateCartItem,
    removeCartItem,
    clearCart,
    itemCount,
    totalAmount,
    hasItems,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeCartItem(itemId);
    } else {
      await updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!cart?.items) return;

    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map((item) => item.id)));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) return;

    try {
      for (const itemId of selectedItems) {
        await removeCartItem(itemId);
      }
      setSelectedItems(new Set());
      toast.success(`Removed ${selectedItems.size} items from cart`);
    } catch (error) {
      toast.error('Failed to remove items');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateSelectedTotal = () => {
    if (!cart?.items || selectedItems.size === 0) return totalAmount;

    return cart.items
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {hasItems && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="w-full sm:w-auto"
            >
              {selectedItems.size === cart?.items?.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
            {selectedItems.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleRemoveSelected}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Selected ({selectedItems.size})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Clear Cart
            </Button>
          </div>
        )}
      </div>

      {!hasItems ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={() => router.push('/marketplace')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart?.items?.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <div className="flex items-center pt-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                          />
                        </div>

                        {/* Product Image */}
                        <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {item.product?.assets?.images?.[0] ? (
                            <Image
                              src={item.product.assets.images[0]}
                              alt={item.product.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {item.product?.name || item.bundle?.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.product?.short_description}
                              </p>

                              {/* Creator */}
                              {item.product?.creator && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage
                                      src={item.product.creator.avatar}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {item.product.creator.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    by {item.product.creator.name}
                                  </span>
                                </div>
                              )}

                              {/* Category */}
                              {item.product?.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.product.category}
                                </Badge>
                              )}
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCartItem(item.id)}
                              disabled={isUpdating}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>

                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Unit Price */}
                              <div className="text-sm text-muted-foreground">
                                {formatPrice(item.price)} each
                              </div>
                            </div>

                            {/* Total Price */}
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              {item.original_price &&
                                item.original_price > item.price && (
                                  <div className="text-sm text-muted-foreground line-through">
                                    {formatPrice(
                                      item.original_price * item.quantity
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Coupon Input */}
            <Card>
              <CardContent className="p-4">
                <CouponInput />
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <CartRecommendations recommendations={recommendations} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>

                  {selectedItems.size > 0 &&
                    selectedItems.size < (cart?.items?.length || 0) && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Selected ({selectedItems.size} items)</span>
                        <span>{formatPrice(calculateSelectedTotal())}</span>
                      </div>
                    )}

                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={isUpdating || !hasItems}
                  onClick={() => router.push('/checkout')}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Features */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-600" />
                    <span>Instant digital delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span>Lifetime access to updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Card>
              <CardContent className="p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/marketplace')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
