'use client';

/**
 * Pricing Setup Form Component
 * Comprehensive pricing configuration with smart suggestions
 */

import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Gift,
  AlertCircle,
  Info,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { getCategoryById } from '@/lib/categories';
import type { ProductFormData, PricingType } from '@/types/product-forms';

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
];

const subscriptionIntervals = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function PricingSetupForm() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const pricingType = watch('pricingType');
  const price = watch('price') || 0;
  const compareAtPrice = watch('compareAtPrice') || 0;
  const currency = watch('currency') || 'USD';
  const subscriptionInterval = watch('subscriptionInterval');
  const categoryId = watch('categoryId');

  const category = categoryId ? getCategoryById(categoryId) : null;
  const currencySymbol =
    currencies.find((c) => c.value === currency)?.symbol || '$';

  // Pricing suggestions based on category
  const pricingSuggestions = useMemo(() => {
    if (!category) return null;

    const { min, max } = category.metadata.averagePrice;
    const suggested = Math.round((min + max) / 2);

    return {
      min,
      max,
      suggested,
      ranges: [
        { label: 'Budget', min: min, max: Math.round(min + (max - min) * 0.3) },
        {
          label: 'Standard',
          min: Math.round(min + (max - min) * 0.3),
          max: Math.round(min + (max - min) * 0.7),
        },
        {
          label: 'Premium',
          min: Math.round(min + (max - min) * 0.7),
          max: max,
        },
      ],
    };
  }, [category]);

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (!compareAtPrice || !price || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }, [price, compareAtPrice]);

  // Revenue projections
  const revenueProjections = useMemo(() => {
    if (!price) return null;

    const monthlyEstimates = [
      { sales: 5, revenue: price * 5, label: 'Conservative' },
      { sales: 15, revenue: price * 15, label: 'Realistic' },
      { sales: 30, revenue: price * 30, label: 'Optimistic' },
    ];

    return monthlyEstimates;
  }, [price]);

  const handlePricingTypeChange = (type: PricingType) => {
    setValue('pricingType', type);

    // Reset price if switching to free
    if (type === 'free') {
      setValue('price', 0);
    }

    // Set suggested price for paid types
    if (type !== 'free' && pricingSuggestions && price === 0) {
      setValue('price', pricingSuggestions.suggested);
    }
  };

  const handleSuggestedPriceClick = (suggestedPrice: number) => {
    setValue('price', suggestedPrice);
  };

  return (
    <div className="space-y-6">
      {/* Pricing Model Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Pricing Model *</Label>
        <RadioGroup
          value={pricingType}
          onValueChange={handlePricingTypeChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <RadioGroupItem value="free" id="free" className="peer sr-only" />
            <Label
              htmlFor="free"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Gift className="mb-3 h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Free</div>
                <div className="text-sm text-muted-foreground">
                  No cost to users
                </div>
              </div>
            </Label>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <RadioGroupItem
              value="one_time"
              id="one_time"
              className="peer sr-only"
            />
            <Label
              htmlFor="one_time"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <DollarSign className="mb-3 h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">One-time Payment</div>
                <div className="text-sm text-muted-foreground">
                  Single purchase
                </div>
              </div>
            </Label>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <RadioGroupItem
              value="subscription"
              id="subscription"
              className="peer sr-only"
            />
            <Label
              htmlFor="subscription"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Calendar className="mb-3 h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Subscription</div>
                <div className="text-sm text-muted-foreground">
                  Recurring payments
                </div>
              </div>
            </Label>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <RadioGroupItem
              value="bundle"
              id="bundle"
              className="peer sr-only"
            />
            <Label
              htmlFor="bundle"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <TrendingUp className="mb-3 h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Bundle</div>
                <div className="text-sm text-muted-foreground">
                  Multiple products
                </div>
              </div>
            </Label>
          </motion.div>
        </RadioGroup>
      </div>

      {/* Pricing Configuration */}
      {pricingType && pricingType !== 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <select
                {...register('currency')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currencies.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subscription Interval */}
            {pricingType === 'subscription' && (
              <div className="space-y-2">
                <Label htmlFor="subscriptionInterval">Billing Interval *</Label>
                <select
                  {...register('subscriptionInterval')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {subscriptionIntervals.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price Input */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price *{' '}
                  {pricingType === 'subscription' && subscriptionInterval && (
                    <span className="text-sm text-muted-foreground">
                      (per {subscriptionInterval.replace('ly', '')})
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">
                  Compare at Price
                  <span className="text-sm text-muted-foreground ml-1">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    {...register('compareAtPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                {discountPercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-600">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Suggestions */}
            {pricingSuggestions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Pricing Suggestions for {category?.name}
                  </CardTitle>
                  <CardDescription>
                    Based on similar products in this category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {pricingSuggestions.ranges.map((range) => (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() =>
                          handleSuggestedPriceClick(
                            Math.round((range.min + range.max) / 2)
                          )
                        }
                        className="p-3 text-center border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium text-sm">{range.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {currencySymbol}
                          {range.min} - {currencySymbol}
                          {range.max}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleSuggestedPriceClick(pricingSuggestions.suggested)
                      }
                      className="text-sm text-primary hover:underline"
                    >
                      Use suggested price: {currencySymbol}
                      {pricingSuggestions.suggested}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Projections */}
            {revenueProjections && price > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Revenue Projections
                  </CardTitle>
                  <CardDescription>
                    Estimated monthly revenue based on your pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {revenueProjections.map((projection) => (
                      <div key={projection.label} className="text-center">
                        <div className="text-2xl font-bold">
                          {currencySymbol}
                          {projection.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {projection.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {projection.sales} sales/month
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {/* Free Product Message */}
      {pricingType === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Free Product</h3>
                  <p className="text-sm text-green-700">
                    This product will be available at no cost to users. Great
                    for building an audience!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Validation Errors */}
      {(errors.pricingType || errors.price || errors.currency) && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium text-destructive">
              Please fix the following errors:
            </h3>
          </div>
          <ul className="mt-2 text-sm text-destructive space-y-1">
            {errors.pricingType && <li>• {errors.pricingType.message}</li>}
            {errors.price && <li>• {errors.price.message}</li>}
            {errors.currency && <li>• {errors.currency.message}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
