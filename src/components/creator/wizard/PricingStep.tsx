'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DollarSign,
  Gift,
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingStepProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  updateProductData: (updates: any) => void;
  canProceed: boolean;
}

const PRICING_SUGGESTIONS = {
  pdf: {
    free: {
      min: 0,
      max: 0,
      description: 'Great for building audience and showcasing quality',
    },
    low: { min: 5, max: 15, description: 'Simple templates and basic guides' },
    medium: {
      min: 15,
      max: 50,
      description: 'Comprehensive guides and professional templates',
    },
    high: {
      min: 50,
      max: 200,
      description: 'Premium courses and extensive resources',
    },
  },
  image: {
    free: { min: 0, max: 0, description: 'Sample packs to attract customers' },
    low: {
      min: 3,
      max: 10,
      description: 'Small icon sets and simple graphics',
    },
    medium: {
      min: 10,
      max: 30,
      description: 'Professional graphics and template packs',
    },
    high: {
      min: 30,
      max: 100,
      description: 'Extensive design systems and premium assets',
    },
  },
  text: {
    free: { min: 0, max: 0, description: 'Lead magnets and content samples' },
    low: {
      min: 2,
      max: 8,
      description: 'Short articles and basic copy templates',
    },
    medium: { min: 8, max: 25, description: 'Comprehensive content packages' },
    high: {
      min: 25,
      max: 75,
      description: 'Premium content series and specialized copy',
    },
  },
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function PricingStep({
  productType,
  productData,
  updateProductData,
  canProceed,
}: PricingStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const suggestions = PRICING_SUGGESTIONS[productType];
  const selectedCurrency =
    CURRENCIES.find((c) => c.code === productData.pricing.currency) ||
    CURRENCIES[0];

  const handlePricingTypeChange = (type: 'free' | 'one-time') => {
    updateProductData({
      pricing: {
        ...productData.pricing,
        type,
        amount:
          type === 'free'
            ? 0
            : productData.pricing.amount || suggestions.low.min,
      },
    });
  };

  const handleAmountChange = (amount: number) => {
    updateProductData({
      pricing: {
        ...productData.pricing,
        amount: Math.max(0, amount),
      },
    });
  };

  const handleCurrencyChange = (currency: string) => {
    updateProductData({
      pricing: {
        ...productData.pricing,
        currency,
      },
    });
  };

  const getSuggestionLevel = (amount: number) => {
    if (amount === 0) return 'free';
    if (amount <= suggestions.low.max) return 'low';
    if (amount <= suggestions.medium.max) return 'medium';
    return 'high';
  };

  const currentLevel = getSuggestionLevel(productData.pricing.amount || 0);
  const currentSuggestion =
    suggestions[currentLevel as keyof typeof suggestions];

  return (
    <div className="space-y-8">
      {/* Pricing Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={productData.pricing.type}
              onValueChange={handlePricingTypeChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="free" id="free" />
                <div className="flex-1">
                  <Label
                    htmlFor="free"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Free</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Lead Magnet
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Perfect for building your audience and showcasing your
                    quality
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="one-time" id="one-time" />
                <div className="flex-1">
                  <Label
                    htmlFor="one-time"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">One-time Purchase</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Most Popular
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers pay once and own the product forever
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Setting */}
      {productData.pricing.type === 'one-time' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Set Your Price</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Currency</Label>
                  <select
                    value={productData.pricing.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Price</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.pricing.amount || ''}
                      onChange={(e) =>
                        handleAmountChange(parseFloat(e.target.value) || 0)
                      }
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Suggestions */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Pricing Suggestions for {productType.toUpperCase()} Products
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(suggestions).map(([level, suggestion]) => (
                    <Button
                      key={level}
                      variant={currentLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAmountChange(suggestion.min)}
                      className="h-auto p-3 flex flex-col items-start text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{level}</span>
                        {level !== 'free' && (
                          <span className="text-xs">
                            {selectedCurrency.symbol}
                            {suggestion.min}-{suggestion.max}
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-80 text-left">
                        {suggestion.description}
                      </p>
                    </Button>
                  ))}
                </div>

                {/* Current Selection Feedback */}
                <div
                  className={cn(
                    'p-3 rounded-lg border',
                    currentLevel === 'free'
                      ? 'bg-green-50 border-green-200'
                      : currentLevel === 'low'
                        ? 'bg-blue-50 border-blue-200'
                        : currentLevel === 'medium'
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-orange-50 border-orange-200'
                  )}
                >
                  <p className="text-sm font-medium">
                    {currentLevel === 'free'
                      ? 'Free Product'
                      : `${selectedCurrency.symbol}${productData.pricing.amount} - ${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Pricing`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentSuggestion.description}
                  </p>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Advanced Pricing Options</Label>
                  <Switch
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                </div>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t pt-4"
                  >
                    <div>
                      <Label>Original Price (for discount display)</Label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {selectedCurrency.symbol}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productData.pricing.originalPrice || ''}
                          onChange={(e) =>
                            updateProductData({
                              pricing: {
                                ...productData.pricing,
                                originalPrice:
                                  parseFloat(e.target.value) || undefined,
                              },
                            })
                          }
                          className="pl-8"
                          placeholder="Optional"
                        />
                      </div>
                      {productData.pricing.originalPrice &&
                        productData.pricing.originalPrice >
                          (productData.pricing.amount || 0) && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="destructive">
                              {Math.round(
                                (1 -
                                  (productData.pricing.amount || 0) /
                                    productData.pricing.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                            <span className="text-sm text-muted-foreground line-through">
                              {selectedCurrency.symbol}
                              {productData.pricing.originalPrice}
                            </span>
                          </div>
                        )}
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Pricing Strategy Tips
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>
                    • Start with competitive pricing and adjust based on demand
                  </li>
                  <li>• Consider offering a free sample to build trust</li>
                  <li>
                    • Price based on value delivered, not just time invested
                  </li>
                  <li>• Test different price points to find your sweet spot</li>
                  <li>• Bundle related products for higher perceived value</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Status */}
      <Card
        className={cn(
          'border-2',
          canProceed
            ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
            : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {canProceed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <p
                className={cn(
                  'font-medium',
                  canProceed
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-orange-900 dark:text-orange-100'
                )}
              >
                {canProceed ? 'Pricing Configured' : 'Pricing Required'}
              </p>
              <p
                className={cn(
                  'text-sm',
                  canProceed
                    ? 'text-green-700 dark:text-green-200'
                    : 'text-orange-700 dark:text-orange-200'
                )}
              >
                {canProceed
                  ? `Your product is priced at ${productData.pricing.type === 'free' ? 'Free' : `${selectedCurrency.symbol}${productData.pricing.amount}`}`
                  : 'Please set a valid price for your product'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
