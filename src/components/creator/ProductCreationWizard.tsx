'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductInfoStep } from './wizard/ProductInfoStep';
import { ContentCreationStep } from './wizard/ContentCreationStep';
import { PricingStep } from './wizard/PricingStep';
import { PreviewStep } from './wizard/PreviewStep';
import { PublishStep } from './wizard/PublishStep';
import { useSubscription } from '@/hooks/useSubscription';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Image,
  FileType,
  Sparkles,
  Info,
  DollarSign,
  Eye,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ProductType = 'pdf' | 'image' | 'text';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  required: boolean;
}

interface ProductData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];

  // Content
  content: {
    files: File[];
    preview?: string;
    instructions?: string;
    aiGenerated?: boolean;
    type: ProductType;
  };

  // Pricing
  pricing: {
    type: 'free' | 'one-time';
    amount?: number;
    currency: string;
    originalPrice?: number;
  };

  // Metadata
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: string;
    requirements?: string[];
    compatibility?: string[];
  };

  // Publishing
  visibility: 'public' | 'private' | 'unlisted';
  publishImmediately: boolean;
}

interface ProductCreationWizardProps {
  productType: ProductType;
  onBack: () => void;
  onComplete: (productId: string) => void;
}

export function ProductCreationWizard({
  productType,
  onBack,
  onComplete,
}: ProductCreationWizardProps) {
  const { checkUsageLimit } = useSubscription();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState<ProductData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    content: {
      files: [],
      type: productType,
    },
    pricing: {
      type: 'free',
      currency: 'USD',
    },
    metadata: {
      difficulty: 'beginner',
    },
    visibility: 'public',
    publishImmediately: true,
  });

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: 'info',
        title: 'Product Info',
        description: 'Basic details about your product',
        icon: Info,
        component: ProductInfoStep,
        required: true,
      },
      {
        id: 'content',
        title: 'Create Content',
        description: 'Build your product content',
        icon:
          productType === 'pdf'
            ? FileText
            : productType === 'image'
              ? Image
              : FileType,
        component: ContentCreationStep,
        required: true,
      },
      {
        id: 'pricing',
        title: 'Pricing',
        description: 'Set your product price',
        icon: DollarSign,
        component: PricingStep,
        required: true,
      },
      {
        id: 'preview',
        title: 'Preview',
        description: 'Review your product',
        icon: Eye,
        component: PreviewStep,
        required: false,
      },
      {
        id: 'publish',
        title: 'Publish',
        description: 'Launch your product',
        icon: Rocket,
        component: PublishStep,
        required: true,
      },
    ],
    [productType]
  );

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateProductData = useCallback((updates: Partial<ProductData>) => {
    setProductData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      const step = steps[stepIndex];

      switch (step.id) {
        case 'info':
          return !!(
            productData.title &&
            productData.description &&
            productData.category
          );
        case 'content':
          return (
            productData.content.files.length > 0 ||
            !!productData.content.instructions
          );
        case 'pricing':
          return (
            productData.pricing.type === 'free' ||
            (productData.pricing.amount && productData.pricing.amount > 0)
          );
        case 'preview':
          return true; // Preview is optional
        case 'publish':
          return true; // Publish step handles its own validation
        default:
          return true;
      }
    },
    [productData, steps]
  );

  const canProceed = validateStep(currentStep);

  const handleNext = useCallback(() => {
    if (!canProceed) {
      toast.error('Please complete all required fields before continuing');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [canProceed, currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Allow going back to previous steps or to the next step if current is valid
      if (
        stepIndex <= currentStep ||
        (stepIndex === currentStep + 1 && canProceed)
      ) {
        setCurrentStep(stepIndex);
      }
    },
    [currentStep, canProceed]
  );

  const handleSubmit = useCallback(async () => {
    // Check usage limits before creating
    const usageCheck = checkUsageLimit('products');
    if (!usageCheck.canUse) {
      toast.error(
        'You have reached your product creation limit. Please upgrade to continue.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add basic product data
      formData.append('title', productData.title);
      formData.append('description', productData.description);
      formData.append('category', productData.category);
      formData.append('subcategory', productData.subcategory);
      formData.append('tags', JSON.stringify(productData.tags));
      formData.append('type', productType);
      formData.append('pricing', JSON.stringify(productData.pricing));
      formData.append('metadata', JSON.stringify(productData.metadata));
      formData.append('visibility', productData.visibility);
      formData.append(
        'publishImmediately',
        productData.publishImmediately.toString()
      );

      // Add content files
      productData.content.files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Add content metadata
      if (productData.content.instructions) {
        formData.append('instructions', productData.content.instructions);
      }
      if (productData.content.preview) {
        formData.append('preview', productData.content.preview);
      }
      formData.append(
        'aiGenerated',
        (productData.content.aiGenerated || false).toString()
      );

      const response = await fetch('/api/creator/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }

      const result = await response.json();
      toast.success('Product created successfully!');
      onComplete(result.data.id);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [productData, productType, checkUsageLimit, onComplete]);

  const getStepIcon = (step: WizardStep, index: number) => {
    const Icon = step.icon;
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;

    if (isCompleted) {
      return <Check className="w-4 h-4 text-white" />;
    }

    return (
      <Icon
        className={cn(
          'w-4 h-4',
          isCurrent ? 'text-white' : 'text-muted-foreground'
        )}
      />
    );
  };

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            Create {productType.toUpperCase()} Product
          </h2>
          <p className="text-muted-foreground">
            Follow these steps to create and publish your product
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                disabled={
                  index > currentStep + 1 ||
                  (index === currentStep + 1 && !canProceed)
                }
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  index < currentStep
                    ? 'bg-primary border-primary text-white'
                    : index === currentStep
                      ? 'bg-primary border-primary text-white'
                      : index === currentStep + 1 && canProceed
                        ? 'border-primary/50 text-primary hover:bg-primary/10'
                        : 'border-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {getStepIcon(step, index)}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center text-center max-w-[120px]"
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  index <= currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {step.description}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(currentStepData.icon, {
                className: 'w-5 h-5',
              })}
              {currentStepData.title}
              {currentStepData.required && (
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  productType={productType}
                  productData={productData}
                  updateProductData={updateProductData}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  canProceed={canProceed}
                  isLastStep={currentStep === steps.length - 1}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onBack : handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Back to Types' : 'Previous'}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Create Product
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
