'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { FormError } from '@/components/ui/form-errors';
import {
  creatorStep1Schema,
  creatorStep2Schema,
  creatorStep3Schema,
  type CreatorStep1,
  type CreatorStep2,
  type CreatorStep3,
} from '@/lib/validations/onboarding';
import { CheckCircle, Palette, Target, Rocket } from 'lucide-react';

interface CreatorOnboardingProps {
  currentStep: number;
  completedSteps: number[];
  onStepComplete: (step: number, data: any) => Promise<void>;
}

const PRODUCT_TYPES = [
  'Digital Art',
  'Photography',
  'Illustrations',
  'UI/UX Templates',
  'Stock Photos',
  'Icons & Graphics',
  'Fonts',
  'Video Content',
  'Audio/Music',
  'Other',
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-1 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

export function CreatorOnboarding({
  currentStep,
  completedSteps,
  onStepComplete,
}: CreatorOnboardingProps) {
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
          Creator Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's set up your creator profile to help you succeed
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
        <CreatorStep1
          onSubmit={(data) => handleStepSubmit(1, data)}
          loading={loading}
          isCompleted={completedSteps.includes(1)}
        />
      )}

      {activeStep === 2 && (
        <CreatorStep2
          onSubmit={(data) => handleStepSubmit(2, data)}
          loading={loading}
          isCompleted={completedSteps.includes(2)}
        />
      )}

      {activeStep === 3 && (
        <CreatorStep3
          onSubmit={(data) => handleStepSubmit(3, data)}
          loading={loading}
          isCompleted={completedSteps.includes(3)}
        />
      )}
    </div>
  );
}

// Step 1: Product Types & Experience
function CreatorStep1({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: CreatorStep1Data) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatorStep1>({
    resolver: zodResolver(creatorStep1Schema),
  });

  const selectedTypes = watch('productTypes') || [];

  const handleProductTypeChange = (type: string, checked: boolean) => {
    const current = selectedTypes;
    if (checked) {
      setValue('productTypes', [...current, type]);
    } else {
      setValue(
        'productTypes',
        current.filter((t) => t !== type)
      );
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>What do you create?</CardTitle>
        <CardDescription>
          Tell us about the types of products you want to sell and your
          experience level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Types */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Product Types (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRODUCT_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) =>
                      handleProductTypeChange(type, checked as boolean)
                    }
                  />
                  <Label htmlFor={type} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
            <FormError errors={errors.productTypes} />
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Experience Level
            </Label>
            <RadioGroup
              onValueChange={(value) =>
                setValue('experienceLevel', value as any)
              }
              className="space-y-3"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.value} id={level.value} />
                  <Label htmlFor={level.value}>{level.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <FormError errors={errors.experienceLevel} />
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

// Step 2: Goals & Expectations
function CreatorStep2({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: CreatorStep2) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorStep2>({
    resolver: zodResolver(creatorStep2Schema),
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>
          Help us understand what you want to achieve on our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Monthly Revenue Goal */}
          <div>
            <Label
              htmlFor="monthlyRevenueGoal"
              className="text-base font-medium"
            >
              Monthly Revenue Goal (USD)
            </Label>
            <Input
              id="monthlyRevenueGoal"
              type="number"
              min="0"
              step="100"
              placeholder="e.g., 1000"
              {...register('monthlyRevenueGoal', { valueAsNumber: true })}
            />
            <FormError errors={errors.monthlyRevenueGoal} />
          </div>

          {/* Products Per Month */}
          <div>
            <Label htmlFor="productsPerMonth" className="text-base font-medium">
              How many products do you plan to create per month?
            </Label>
            <Input
              id="productsPerMonth"
              type="number"
              min="1"
              placeholder="e.g., 5"
              {...register('productsPerMonth', { valueAsNumber: true })}
            />
            <FormError errors={errors.productsPerMonth} />
          </div>

          {/* Marketing Experience */}
          <div>
            <Label
              htmlFor="marketingExperience"
              className="text-base font-medium"
            >
              Describe your marketing experience (optional)
            </Label>
            <Textarea
              id="marketingExperience"
              placeholder="Tell us about your experience with social media, SEO, advertising, etc."
              {...register('marketingExperience')}
            />
            <FormError errors={errors.marketingExperience} />
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

// Step 3: Profile Setup
function CreatorStep3({
  onSubmit,
  loading,
  isCompleted,
}: {
  onSubmit: (data: CreatorStep3) => void;
  loading: boolean;
  isCompleted: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorStep3>({
    resolver: zodResolver(creatorStep3Schema),
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Final step - let's set up your creator profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Display Name */}
          <div>
            <Label htmlFor="displayName" className="text-base font-medium">
              Display Name *
            </Label>
            <Input
              id="displayName"
              placeholder="Your creator name"
              {...register('displayName')}
            />
            <FormError errors={errors.displayName} />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-base font-medium">
              Bio *
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell potential customers about yourself and your work..."
              {...register('bio')}
            />
            <FormError errors={errors.bio} />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website" className="text-base font-medium">
              Website (optional)
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://your-website.com"
              {...register('website')}
            />
            <FormError errors={errors.website} />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="socialLinks.twitter"
                className="text-base font-medium"
              >
                Twitter (optional)
              </Label>
              <Input
                id="socialLinks.twitter"
                placeholder="@username"
                {...register('socialLinks.twitter')}
              />
            </div>
            <div>
              <Label
                htmlFor="socialLinks.instagram"
                className="text-base font-medium"
              >
                Instagram (optional)
              </Label>
              <Input
                id="socialLinks.instagram"
                placeholder="@username"
                {...register('socialLinks.instagram')}
              />
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
