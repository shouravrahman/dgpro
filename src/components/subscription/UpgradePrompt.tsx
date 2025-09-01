'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import {
  Crown,
  Zap,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  feature: string;
  currentPlan: string;
  className?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  feature,
  currentPlan,
  className,
  compact = false,
}: UpgradePromptProps) {
  const { upgradeToProPlan, isCreatingCheckout } = useSubscription();
  const [selectedInterval, setSelectedInterval] = useState<
    'monthly' | 'yearly'
  >('monthly');

  const proTier = SUBSCRIPTION_TIERS.pro;
  const savings = proTier.price.monthly * 12 - proTier.price.yearly;

  const handleUpgrade = async () => {
    try {
      await upgradeToProPlan(selectedInterval);
    } catch (error) {
      console.error('Failed to upgrade:', error);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
              <p className="text-xs text-muted-foreground">
                Unlock {feature} and more
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleUpgrade}
            disabled={isCreatingCheckout}
            className="bg-primary hover:bg-primary/90"
          >
            {isCreatingCheckout ? 'Processing...' : 'Upgrade'}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Upgrade to Pro
          </CardTitle>
          <p className="text-muted-foreground">
            You need a Pro subscription to access {feature}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-muted p-1 rounded-lg flex">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  selectedInterval === 'monthly'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval('yearly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all relative',
                  selectedInterval === 'yearly'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1">
                  Save ${savings}
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="text-center">
            <div className="text-4xl font-bold">
              $
              {selectedInterval === 'yearly'
                ? proTier.price.yearly
                : proTier.price.monthly}
            </div>
            <div className="text-muted-foreground">
              per {selectedInterval === 'yearly' ? 'year' : 'month'}
            </div>
            {selectedInterval === 'yearly' && (
              <div className="text-sm text-green-600 mt-1">
                Save 17% with yearly billing
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              What you'll get
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {proTier.features.slice(0, 6).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isCreatingCheckout}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3"
              size="lg"
            >
              {isCreatingCheckout ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime. No hidden fees. 30-day money-back guarantee.
            </p>
          </div>

          {/* Current Plan Badge */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Currently on {currentPlan} plan
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
