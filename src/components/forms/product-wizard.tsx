'use client';

/**
 * Product Creation Wizard
 * Step-by-step product creation with advanced forms
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { formGenerator } from '@/lib/forms/form-generator';
import { autoSaveManager } from '@/lib/forms/auto-save';
import { formValidator } from '@/lib/forms/validation';

import type {
  FormStep,
  FormConfig,
  ProductFormData,
  FormState,
  FormMode,
} from '@/types/product-forms';

import { CategorySelector } from './category-selector';
import { BasicInfoForm } from './basic-info-form';
import { ContentDetailsForm } from './content-details-form';
import { PricingSetupForm } from './pricing-setup-form';
import { AssetsUploadForm } from './assets-upload-form';
import { ProductPreview } from './product-preview';

interface ProductWizardProps {
  mode?: FormMode;
  categoryId?: string;
  productId?: string;
  initialData?: Partial<ProductFormData>;
  onSave?: (data: ProductFormData) => Promise<void>;
  onPublish?: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
}

const STEPS: { id: FormStep; title: string; description: string }[] = [
  {
    id: 'category-selection',
    title: 'Category',
    description: 'Choose your product category',
  },
  {
    id: 'basic-info',
    title: 'Basic Info',
    description: 'Product name and description',
  },
  {
    id: 'content-details',
    title: 'Content',
    description: 'Detailed product information',
  },
  {
    id: 'pricing-setup',
    title: 'Pricing',
    description: 'Set your pricing strategy',
  },
  {
    id: 'assets-upload',
    title: 'Assets',
    description: 'Upload files and media',
  },
  {
    id: 'preview-publish',
    title: 'Preview',
    description: 'Review and publish',
  },
];

export function ProductWizard({
  mode = 'create',
  categoryId,
  productId,
  initialData,
  onSave,
  onPublish,
  onCancel,
}: ProductWizardProps) {
  const [currentStep, setCurrentStep] =
    useState<FormStep>('category-selection');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<{
    isEnabled: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
  }>({
    isEnabled: false,
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  // Initialize form with React Hook Form
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(formValidator.getBaseValidationSchema()),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      categoryId: categoryId || '',
      pricingType: 'one_time',
      price: 0,
      currency: 'USD',
      features: [],
      tags: [],
      seoKeywords: [],
      status: 'draft',
      isFeatured: false,
      allowComments: true,
      allowReviews: true,
      images: [],
      documents: [],
      media: [],
      downloadableFiles: [],
      metadata: {},
      ...initialData,
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isValid, isDirty },
  } = methods;
  const watchedCategoryId = watch('categoryId');

  // Generate form configuration when category changes
  useEffect(() => {
    if (watchedCategoryId) {
      try {
        const config = formGenerator.generateFormConfig(
          watchedCategoryId,
          mode
        );
        setFormConfig(config);

        // Initialize auto-save
        const formId = `product-form-${productId || 'new'}`;
        autoSaveManager.initializeAutoSave(
          formId,
          {
            enabled: true,
            interval: 30000,
            maxDrafts: 5,
            compression: false,
            encryption: false,
          },
          (draft) => {
            setAutoSaveStatus((prev) => ({
              ...prev,
              lastSaved: new Date(),
              hasUnsavedChanges: false,
            }));
            toast.success('Draft saved automatically');
          },
          (error) => {
            console.error('Auto-save failed:', error);
            toast.error('Failed to auto-save draft');
          }
        );

        setAutoSaveStatus((prev) => ({ ...prev, isEnabled: true }));
      } catch (error) {
        console.error('Failed to generate form config:', error);
        toast.error('Failed to load form configuration');
      }
    }
  }, [watchedCategoryId, mode, productId]);

  // Update auto-save status when form changes
  useEffect(() => {
    setAutoSaveStatus((prev) => ({
      ...prev,
      hasUnsavedChanges: isDirty,
    }));
  }, [isDirty]);

  // Get current step index
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Navigation handlers
  const goToStep = useCallback(
    async (step: FormStep) => {
      // Validate current step before moving
      const isCurrentStepValid = await validateCurrentStep();
      if (
        !isCurrentStepValid &&
        STEPS.findIndex((s) => s.id === step) > currentStepIndex
      ) {
        return;
      }

      setCurrentStep(step);

      // Mark previous steps as completed
      const stepIndex = STEPS.findIndex((s) => s.id === step);
      const newCompletedSteps = STEPS.slice(0, stepIndex).map((s) => s.id);
      setCompletedSteps(newCompletedSteps);
    },
    [currentStepIndex]
  );

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < STEPS.length) {
      const nextStep = STEPS[nextStepIndex];
      await goToStep(nextStep.id);
    }
  }, [currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      const prevStep = STEPS[prevStepIndex];
      setCurrentStep(prevStep.id);
    }
  }, [currentStepIndex]);

  // Validation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(currentStep);
    const isValid = await trigger(stepFields);

    if (isValid) {
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    }

    return isValid;
  }, [currentStep, trigger]);

  const getStepFields = (step: FormStep): (keyof ProductFormData)[] => {
    switch (step) {
      case 'category-selection':
        return ['categoryId'];
      case 'basic-info':
        return ['name', 'shortDescription', 'description', 'tags'];
      case 'content-details':
        return ['features'];
      case 'pricing-setup':
        return ['pricingType', 'price', 'currency'];
      case 'assets-upload':
        return ['images', 'downloadableFiles'];
      default:
        return [];
    }
  };

  // Save handlers
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const formData = getValues();
      await onSave?.(formData);

      // Force auto-save
      const formId = `product-form-${productId || 'new'}`;
      await autoSaveManager.forceSave(formId);

      toast.success('Product saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  }, [getValues, onSave, productId]);

  const handlePublish = useCallback(async () => {
    // Validate entire form
    const isFormValid = await trigger();
    if (!isFormValid) {
      toast.error('Please fix all errors before publishing');
      return;
    }

    setIsLoading(true);
    try {
      const formData = getValues();
      formData.status = 'published';
      await onPublish?.(formData);

      toast.success('Product published successfully');
    } catch (error) {
      console.error('Publish failed:', error);
      toast.error('Failed to publish product');
    } finally {
      setIsLoading(false);
    }
  }, [trigger, getValues, onPublish]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'category-selection':
        return (
          <CategorySelector
            value={watchedCategoryId}
            onChange={(categoryId) => setValue('categoryId', categoryId)}
            error={errors.categoryId?.message}
          />
        );

      case 'basic-info':
        return <BasicInfoForm />;

      case 'content-details':
        return <ContentDetailsForm categoryId={watchedCategoryId} />;

      case 'pricing-setup':
        return <PricingSetupForm />;

      case 'assets-upload':
        return <AssetsUploadForm categoryId={watchedCategoryId} />;

      case 'preview-publish':
        return <ProductPreview data={getValues()} />;

      default:
        return null;
    }
  };

  if (!formConfig && watchedCategoryId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Create Product' : 'Edit Product'}
              </h1>
              <p className="text-muted-foreground">
                {formConfig?.description ||
                  'Create your digital product step by step'}
              </p>
            </div>

            {/* Auto-save status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {autoSaveStatus.isEnabled && (
                <>
                  {autoSaveStatus.hasUnsavedChanges ? (
                    <Badge variant="outline" className="text-orange-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unsaved changes
                    </Badge>
                  ) : autoSaveStatus.lastSaved ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Saved {autoSaveStatus.lastSaved.toLocaleTimeString()}
                    </Badge>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              const isAccessible = index <= currentStepIndex || isCompleted;

              return (
                <Button
                  key={step.id}
                  variant={
                    isActive ? 'default' : isCompleted ? 'secondary' : 'ghost'
                  }
                  size="sm"
                  className={`flex-shrink-0 ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => isAccessible && goToStep(step.id)}
                  disabled={!isAccessible}
                >
                  <span className="mr-2">{index + 1}</span>
                  {step.title}
                  {isCompleted && <CheckCircle className="w-3 h-3 ml-1" />}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Form content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStepIndex]?.title}</CardTitle>
            <CardDescription>
              {STEPS[currentStepIndex]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Form errors */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors:
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error?.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {currentStep !== 'preview-publish' && (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-1" />
              Save Draft
            </Button>

            {currentStep === 'preview-publish' && (
              <Button onClick={handlePublish} disabled={isLoading || !isValid}>
                <Eye className="w-4 h-4 mr-1" />
                Publish Product
              </Button>
            )}

            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
