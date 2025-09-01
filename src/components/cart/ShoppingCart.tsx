'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  X,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { CartRecommendations } from './CartRecommendations';
import { CouponInput } from './CouponInput';
import { formatCurrency } from '@/lib/utils';

interface ShoppingCartProps {
  className?: string;
}

export function ShoppingCart({ className }: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    cart,
    recommendations,
    isLoading,
    isUpdating,
    animationState,
    updateCartItem,
    removeCartItem,
    clearCart,
    itemCount,
    totalAmount,
    hasItems,
  } = useCart();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeCartItem(itemId);
    } else {
      await updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const cartItemVariants = {
    hidden: { opacity: 0, x: -20, height: 0 },
    visible: {
      opacity: 1,
      x: 0,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: 20,
      height: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  const priceVariants = {
    initial: { scale: 1 },
    updated: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 },
    },
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CartIcon className="h-4 w-4" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center"
                >
                  {itemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="ml-2">Cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            {hasItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={isUpdating}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !hasItems ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <CartIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">
                Add some products to get started
              </p>
              <Button onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <AnimatePresence mode="popLayout">
                  {cart?.items?.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={cartItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className={`mb-4 ${
                        animationState.removedItemId === item.id
                          ? 'opacity-50'
                          : ''
                      }`}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                              {item.product?.assets?.images?.[0] ? (
                                <img
                                  src={item.product.assets.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <CartIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {item.product?.name || item.bundle?.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.price)}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2 mt-2">
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

                                <motion.span
                                  variants={priceVariants}
                                  animate={
                                    animationState.isUpdating
                                      ? 'updated'
                                      : 'initial'
                                  }
                                  className="w-8 text-center text-sm font-medium"
                                >
                                  {item.quantity}
                                </motion.span>

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
                            </div>

                            {/* Item Total & Remove */}
                            <div className="flex flex-col items-end space-y-2">
                              <motion.div
                                variants={priceVariants}
                                animate={
                                  animationState.isUpdating
                                    ? 'updated'
                                    : 'initial'
                                }
                                className="font-semibold"
                              >
                                {formatCurrency(item.price * item.quantity)}
                              </motion.div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCartItem(item.id)}
                                disabled={isUpdating}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Coupon Input */}
                <div className="mt-4">
                  <CouponInput />
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mt-6">
                    <CartRecommendations recommendations={recommendations} />
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>

                  {/* TODO: Add discount and tax calculations */}

                  <Separator />

                  <motion.div
                    variants={priceVariants}
                    animate={animationState.isUpdating ? 'updated' : 'initial'}
                    className="flex justify-between font-semibold text-lg"
                  >
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </motion.div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={isUpdating || !hasItems}
                  onClick={() => {
                    // TODO: Navigate to checkout
                    console.log('Navigate to checkout');
                  }}
                >
                  {isUpdating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
