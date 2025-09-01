'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Rocket,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Share,
  Bell,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishStepProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  updateProductData: (updates: any) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  canProceed: boolean;
  isLastStep: boolean;
}

export function PublishStep({
  productType,
  productData,
  updateProductData,
  onSubmit,
  isSubmitting,
  canProceed,
  isLastStep,
}: PublishStepProps) {
  const [publishNotes, setPublishNotes] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);

  const handleVisibilityChange = (
    visibility: 'public' | 'private' | 'unlisted'
  ) => {
    updateProductData({ visibility });
  };

  const handlePublishModeChange = (publishImmediately: boolean) => {
    updateProductData({ publishImmediately });
  };

  const visibilityOptions = [
    {
      value: 'public',
      icon: Globe,
      title: 'Public',
      description: 'Anyone can discover and purchase your product',
      badge: 'Recommended',
      badgeVariant: 'default' as const,
    },
    {
      value: 'unlisted',
      icon: Eye,
      title: 'Unlisted',
      description: 'Only people with the direct link can access',
      badge: 'Private sharing',
      badgeVariant: 'secondary' as const,
    },
    {
      value: 'private',
      icon: Lock,
      title: 'Private',
      description: 'Only you can see this product',
      badge: 'Draft mode',
      badgeVariant: 'outline' as const,
    },
  ];

  const getEstimatedReach = () => {
    if (productData.visibility === 'public') {
      return {
        reach: 'High',
        description:
          'Your product will be discoverable in search and marketplace',
        color: 'text-green-600',
      };
    } else if (productData.visibility === 'unlisted') {
      return {
        reach: 'Medium',
        description: 'Shareable via direct link, good for exclusive access',
        color: 'text-blue-600',
      };
    } else {
      return {
        reach: 'None',
        description: 'Only visible to you, perfect for testing',
        color: 'text-gray-600',
      };
    }
  };

  const reach = getEstimatedReach();

  return (
    <div className="space-y-8">
      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={productData.visibility}
              onValueChange={handleVisibilityChange}
              className="space-y-4"
            >
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-3 p-4 border rounded-lg transition-colors',
                      productData.visibility === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/30'
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{option.title}</span>
                        <Badge variant={option.badgeVariant}>
                          {option.badge}
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Reach Indicator */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Estimated Reach:</span>
                  <span className={cn('text-sm font-semibold', reach.color)}>
                    {reach.reach}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reach.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Publishing Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Publishing Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={productData.publishImmediately ? 'immediate' : 'draft'}
              onValueChange={(value) =>
                handlePublishModeChange(value === 'immediate')
              }
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="immediate" id="immediate" />
                <div className="flex-1">
                  <Label
                    htmlFor="immediate"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Publish Immediately</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      Go Live
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your product will be available right after creation
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="draft" id="draft" />
                <div className="flex-1">
                  <Label
                    htmlFor="draft"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Save as Draft</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Review Later
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save your product and publish it later when ready
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about sales, reviews, and product performance
                  </p>
                </div>
                <Switch
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track views, downloads, and customer behavior
                  </p>
                </div>
                <Switch
                  checked={enableAnalytics}
                  onCheckedChange={setEnableAnalytics}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Publishing Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this product or version..."
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                className="min-h-[80px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {publishNotes.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pre-launch Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pre-launch Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: 'Product title is compelling and descriptive',
                  completed: !!productData.title,
                },
                {
                  label: 'Description clearly explains the value',
                  completed:
                    !!productData.description &&
                    productData.description.length > 50,
                },
                {
                  label: 'Category and tags are relevant',
                  completed:
                    !!productData.category && productData.tags.length > 0,
                },
                {
                  label: 'Content files are uploaded and ready',
                  completed:
                    productData.content.files.length > 0 ||
                    !!productData.content.instructions,
                },
                {
                  label: 'Pricing is set appropriately',
                  completed:
                    productData.pricing.type === 'free' ||
                    (productData.pricing.amount &&
                      productData.pricing.amount > 0),
                },
                {
                  label: 'Visibility settings are configured',
                  completed: !!productData.visibility,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      item.completed
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Prediction */}
      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Great Success Potential!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Your product meets all quality criteria and is ready for
                    launch.
                    {productData.visibility === 'public' &&
                      ' It will be discoverable in our marketplace.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Final Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {productData.publishImmediately
            ? 'Your product will be published immediately after creation'
            : 'Your product will be saved as a draft'}
        </div>
        <Button
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              {productData.publishImmediately
                ? 'Publish Product'
                : 'Save Draft'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
