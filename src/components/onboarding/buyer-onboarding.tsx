'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { FormError } from '@/components/ui/form-errors';
import {
  buyerStep1Schema,
  buyerStep2Schema,
  buyerStep3Schema,
  type BuyerStep1,
  type BuyerStep2,
  type BuyerStep3,
  BUYER_CATEGORIES,
  PREFERRED_FORMATS,
} from '@/lib/validations/onboarding';
import { CheckCircle, ShoppingCart, Heart, User } from 'lucide-react';

interface BuyerOnboardingProps {
  currentStep: number;
  completedSteps: number[];
  onStepComplete: (step: number, data: any) => Promise<void>;
}

const BUYER_INTERESTS = [
  'Design & Graphics',
  'Business & Marketing',
  'Technology & Development',
  'Education & Learning',
  'Health & Wellness',
  'Entertainment & Media',
  'Photography',
  'Music & Audio',
  'Writing & Content',
  'Other',
];

const BUDGET_RANGES = [
  { value: 'free', label: 'Free products only' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-200', label: '$50 - $200' },
  { value: 'premium', label: '$200+' },
];

const PURCHASE_FREQUENCIES = [
  { value: 'rarely', label: 'Rarely (few times a year)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

const FIRST_ACTIONS = [
  { value: 'browse-trending', label: 'Browse trending products' },
  { value: 'search-specific', label: 'Search for something specific' },
  { value: 'view-recommendations', label: 'View personalized recommendations' },
  { value: 'follow-creators', label: 'Follow favorite creators' },
];

export function BuyerOnboarding({
  currentStep,
  completedSteps,
  onStepComplete,
}: BuyerOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(currentStep);

  const progress = (completedSteps.length / 3) * 100;

  const handleStepSubmit = async (step: number, data: any) => {
    setLoading(true);
    try {
      await onStepComplete(step, data);
      if (step < 3) {
        setActiveStep(step + 1);
      }
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Buyer Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's personalize your shopping experience
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedSteps.length}/3 steps completed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  completedSteps.includes(step)
                    ? 'bg-green-500 border-green-500 text-white'
                    : activeStep === step
                      ? 'border-blue-500 text-blue-500'
                      : 'border-gray-300 text-gray-400'
                }`}
              >
                {completedSteps.includes(step) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-0.5 ${
                    completedSteps.includes(step)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {activeStep === 1 && (
        <BuyerStep1
          onSubmit={(data) => handleStepSubmit(1, data)}
          loading={loading}
          isCompleted={completedSteps.includes(1)}
        />
      )}

      {activeStep === 2 && (
        <BuyerStep2
          onSubmit={(data) => handleStepSubmit(2, data)}
          loading={loading}
          isCompleted={completedSteps.includes(2)}
        />
      )}

      {activeStep === 3 && (
        <BuyerStep3
          onSubmit={(data) => handleStepSubmit(3, data)}
          loading={loading}
          isCompleted={completedSteps.includes(3)}
        />
      )}
    </div>
  );
}

// Step 1: Interests & Budget
function BuyerStep1({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: BuyerStep1) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuyerStep1>({
    resolver: zodResolver(buyerStep1Schema),
  });

  const selectedInterests = watch('interests') || [];

  const handleInterestChange = (interest: string, checked: boolean) => {
    const current = selectedInterests;
    if (checked) {
      setValue('interests', [...current, interest]);
    } else {
      setValue(
        'interests',
        current.filter((i) => i !== interest)
      );
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>What interests you?</CardTitle>
        <CardDescription>
          Tell us about your interests and budget to help us recommend the best
          products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Interests */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Interests (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUYER_INTERESTS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={(checked) =>
                      handleInterestChange(interest, checked as boolean)
                    }
                  />
                  <Label htmlFor={interest} className="text-sm">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            <FormError errors={errors.interests} />
          </div>

          {/* Budget Range */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Budget Range
            </Label>
            <RadioGroup
              onValueChange={(value) => setValue('budgetRange', value as any)}
              className="space-y-3"
            >
              {BUDGET_RANGES.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.value} id={range.value} />
                  <Label htmlFor={range.value}>{range.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <FormError errors={errors.budgetRange} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || isCompleted}>
              {loading ? <LoadingSpinner size="sm" /> : 'Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 2: Categories & Preferences
function BuyerStep2({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: BuyerStep2) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuyerStep2>({
    resolver: zodResolver(buyerStep2Schema),
  });

  const selectedCategories = watch('categories') || [];
  const selectedFormats = watch('preferredFormats') || [];

  const handleCategoryChange = (category: string, checked: boolean) => {
    const current = selectedCategories;
    if (checked) {
      setValue('categories', [...current, category]);
    } else {
      setValue(
        'categories',
        current.filter((c) => c !== category)
      );
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    const current = selectedFormats;
    if (checked) {
      setValue('preferredFormats', [...current, format]);
    } else {
      setValue(
        'preferredFormats',
        current.filter((f) => f !== format)
      );
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle>Shopping Preferences</CardTitle>
        <CardDescription>
          Help us understand what you're looking for and how often you shop
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Product Categories (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUYER_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={category.id} className="text-sm">
                    {category.icon} {category.label}
                  </Label>
                </div>
              ))}
            </div>
            <FormError errors={errors.categories} />
          </div>

          {/* Purchase Frequency */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              How often do you purchase digital products?
            </Label>
            <RadioGroup
              onValueChange={(value) =>
                setValue('purchaseFrequency', value as any)
              }
              className="space-y-3"
            >
              {PURCHASE_FREQUENCIES.map((freq) => (
                <div key={freq.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={freq.value} id={freq.value} />
                  <Label htmlFor={freq.value}>{freq.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <FormError errors={errors.purchaseFrequency} />
          </div>

          {/* Preferred Formats */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Preferred Product Formats (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PREFERRED_FORMATS.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={format.id}
                    checked={selectedFormats.includes(format.id)}
                    onCheckedChange={(checked) =>
                      handleFormatChange(format.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={format.id} className="text-sm">
                    {format.icon} {format.label}
                  </Label>
                </div>
              ))}
            </div>
            <FormError errors={errors.preferredFormats} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || isCompleted}>
              {loading ? <LoadingSpinner size="sm" /> : 'Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 3: First Action & Notifications
function BuyerStep3({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: BuyerStep3) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuyerStep3>({
    resolver: zodResolver(buyerStep3Schema),
    defaultValues: {
      notifications: {
        email: true,
        push: true,
        deals: true,
        newProducts: false,
      },
    },
  });

  const notifications = watch('notifications');

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <CardTitle>Almost Done!</CardTitle>
        <CardDescription>
          Choose your first action and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First Action */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              What would you like to do first?
            </Label>
            <RadioGroup
              onValueChange={(value) => setValue('firstAction', value as any)}
              className="space-y-3"
            >
              {FIRST_ACTIONS.map((action) => (
                <div key={action.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={action.value} id={action.value} />
                  <Label htmlFor={action.value}>{action.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <FormError errors={errors.firstAction} />
          </div>

          {/* Notifications */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Notification Preferences
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={notifications?.email}
                  onCheckedChange={(checked) =>
                    setValue('notifications.email', checked as boolean)
                  }
                />
                <Label htmlFor="email">Email notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={notifications?.push}
                  onCheckedChange={(checked) =>
                    setValue('notifications.push', checked as boolean)
                  }
                />
                <Label htmlFor="push">Push notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deals"
                  checked={notifications?.deals}
                  onCheckedChange={(checked) =>
                    setValue('notifications.deals', checked as boolean)
                  }
                />
                <Label htmlFor="deals">Special deals and discounts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newProducts"
                  checked={notifications?.newProducts}
                  onCheckedChange={(checked) =>
                    setValue('notifications.newProducts', checked as boolean)
                  }
                />
                <Label htmlFor="newProducts">New product releases</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || isCompleted}>
              {loading ? <LoadingSpinner size="sm" /> : 'Complete Onboarding'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
