'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';

export function CouponInput() {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);

  const { applyCoupon, removeCoupon } = useCart();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsApplying(true);
      await applyCoupon({ coupon_code: couponCode.trim() });
      setAppliedCoupons((prev) => [...prev, couponCode.trim().toUpperCase()]);
      setCouponCode('');
    } catch (error) {
      console.error('Apply coupon error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    try {
      await removeCoupon(code);
      setAppliedCoupons((prev) => prev.filter((c) => c !== code));
    } catch (error) {
      console.error('Remove coupon error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            <span>Promo Code</span>
          </div>

          {/* Applied Coupons */}
          <AnimatePresence>
            {appliedCoupons.map((code) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-2 w-fit"
                >
                  <Check className="h-3 w-3 text-green-600" />
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCoupon(code)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={isApplying}
              className="flex-1"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isApplying}
              size="sm"
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {/* Popular Coupons */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Popular codes:</p>
            <div className="flex flex-wrap gap-2">
              {['SAVE10', 'WELCOME20', 'BUNDLE15'].map((code) => (
                <Button
                  key={code}
                  variant="outline"
                  size="sm"
                  onClick={() => setCouponCode(code)}
                  disabled={isApplying || appliedCoupons.includes(code)}
                  className="h-7 text-xs"
                >
                  {code}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
