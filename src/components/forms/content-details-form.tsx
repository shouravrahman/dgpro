'use client';

/**
 * Content Details Form Component
 * Category-specific content form with dynamic fields
 */

import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Star, Zap, Target, Clock, Users, Award } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { getCategoryById } from '@/lib/categories';
import type { ProductFormData } from '@/types/product-forms';

import { TagInput } from './tag-input';

interface ContentDetailsFormProps {
  categoryId?: string;
}

export function ContentDetailsForm({ categoryId }: ContentDetailsFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const features = watch('features') || [];
  const category = categoryId ? getCategoryById(categoryId) : null;

  // Category-specific fields configuration
  const categoryFields = useMemo(() => {
    if (!category) return [];

    const fieldConfigs = {
      'design-graphics': [
        {
          id: 'designType',
          label: 'Design Type',
          type: 'select',
          options: [
            { value: 'logo', label: 'Logo Design' },
            { value: 'template', label: 'Template' },
            { value: 'illustration', label: 'Illustration' },
            { value: 'icon-set', label: 'Icon Set' },
            { value: 'mockup', label: 'Mockup' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'softwareUsed',
          label: 'Software Used',
          type: 'multiselect',
          options: [
            { value: 'photoshop', label: 'Adobe Photoshop' },
            { value: 'illustrator', label: 'Adobe Illustrator' },
            { value: 'figma', label: 'Figma' },
            { value: 'sketch', label: 'Sketch' },
            { value: 'canva', label: 'Canva' },
          ],
        },
        {
          id: 'fileFormats',
          label: 'File Formats Included',
          type: 'multiselect',
          options: [
            { value: 'psd', label: 'PSD (Photoshop)' },
            { value: 'ai', label: 'AI (Illustrator)' },
            { value: 'fig', label: 'FIG (Figma)' },
            { value: 'png', label: 'PNG' },
            { value: 'jpg', label: 'JPG' },
            { value: 'svg', label: 'SVG' },
          ],
        },
      ],
      'software-tools': [
        {
          id: 'platform',
          label: 'Platform',
          type: 'multiselect',
          options: [
            { value: 'web', label: 'Web Application' },
            { value: 'desktop', label: 'Desktop Application' },
            { value: 'mobile', label: 'Mobile App' },
            { value: 'api', label: 'API/Service' },
          ],
        },
        {
          id: 'programmingLanguage',
          label: 'Programming Languages',
          type: 'multiselect',
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'csharp', label: 'C#' },
            { value: 'php', label: 'PHP' },
          ],
        },
        {
          id: 'licenseType',
          label: 'License Type',
          type: 'select',
          options: [
            { value: 'mit', label: 'MIT License' },
            { value: 'gpl', label: 'GPL License' },
            { value: 'commercial', label: 'Commercial License' },
            { value: 'proprietary', label: 'Proprietary' },
          ],
        },
      ],
      'educational-content': [
        {
          id: 'contentType',
          label: 'Content Type',
          type: 'select',
          options: [
            { value: 'course', label: 'Online Course' },
            { value: 'tutorial', label: 'Tutorial Series' },
            { value: 'ebook', label: 'E-book' },
            { value: 'guide', label: 'Guide/Manual' },
            { value: 'template', label: 'Template' },
          ],
        },
        {
          id: 'skillLevel',
          label: 'Skill Level',
          type: 'select',
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
            { value: 'expert', label: 'Expert' },
          ],
        },
        {
          id: 'duration',
          label: 'Duration',
          type: 'text',
          placeholder: 'e.g., 2 hours, 5 days, 3 weeks',
        },
      ],
      'business-templates': [
        {
          id: 'templateType',
          label: 'Template Type',
          type: 'select',
          options: [
            { value: 'presentation', label: 'Presentation' },
            { value: 'document', label: 'Document' },
            { value: 'spreadsheet', label: 'Spreadsheet' },
            { value: 'form', label: 'Form' },
            { value: 'contract', label: 'Contract' },
          ],
        },
        {
          id: 'industry',
          label: 'Target Industries',
          type: 'multiselect',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'finance', label: 'Finance' },
            { value: 'education', label: 'Education' },
            { value: 'retail', label: 'Retail' },
            { value: 'consulting', label: 'Consulting' },
          ],
        },
      ],
    };

    return fieldConfigs[category.type as keyof typeof fieldConfigs] || [];
  }, [category]);

  const handleFeaturesChange = (newFeatures: string[]) => {
    setValue('features', newFeatures);
  };

  const renderField = (field: any) => {
    const fieldName = `metadata.${field.id}`;
    const fieldValue = watch(fieldName);

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={fieldValue || ''}
              onValueChange={(value) => setValue(fieldName, value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={fieldValue?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = fieldValue || [];
                      if (checked) {
                        setValue(fieldName, [...currentValues, option.value]);
                      } else {
                        setValue(
                          fieldName,
                          currentValues.filter(
                            (v: string) => v !== option.value
                          )
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${option.value}`}
                    className="text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              {...register(fieldName)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Features */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          Key Features *
        </Label>
        <TagInput
          value={features}
          onChange={handleFeaturesChange}
          placeholder="Add key features..."
          maxTags={20}
          suggestions={[
            'easy-to-use',
            'customizable',
            'responsive',
            'modern-design',
            'professional',
            'high-quality',
            'well-documented',
            'support-included',
            'mobile-friendly',
            'cross-platform',
            'secure',
            'fast-loading',
            'seo-optimized',
            'accessible',
            'multilingual',
            'drag-and-drop',
            'no-coding-required',
            'instant-download',
            'lifetime-updates',
          ]}
        />
        {errors.features && (
          <p className="text-sm text-destructive">{errors.features.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          List the main features and benefits of your product (1-20 features)
        </p>
      </div>

      {/* Category-specific fields */}
      {category && categoryFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {category.name} Details
            </CardTitle>
            <CardDescription>
              Specific information for {category.name.toLowerCase()} products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryFields.map(renderField)}
          </CardContent>
        </Card>
      )}

      {/* Product Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Product Specifications
          </CardTitle>
          <CardDescription>
            Additional details about your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Small business owners, Designers, Students"
                {...register('metadata.targetAudience')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={watch('metadata.difficulty') || ''}
                onValueChange={(value) =>
                  setValue('metadata.difficulty', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Setup Time</Label>
              <Input
                id="estimatedTime"
                placeholder="e.g., 30 minutes, 2 hours, 1 day"
                {...register('metadata.estimatedTime')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Input
                id="requirements"
                placeholder="e.g., Adobe Photoshop, Basic HTML knowledge"
                {...register('metadata.requirements')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            What's Included
          </CardTitle>
          <CardDescription>
            Let customers know exactly what they'll receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagInput
            value={watch('metadata.included') || []}
            onChange={(included) => setValue('metadata.included', included)}
            placeholder="Add items included..."
            maxTags={15}
            suggestions={[
              'source-files',
              'documentation',
              'video-tutorial',
              'email-support',
              'lifetime-updates',
              'commercial-license',
              'fonts-included',
              'stock-photos',
              'icons',
              'templates',
              'examples',
              'bonus-content',
              'installation-guide',
              'customization-guide',
              'money-back-guarantee',
            ]}
          />
        </CardContent>
      </Card>

      {/* Live Preview */}
      {features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Feature Preview
              </CardTitle>
              <CardDescription>
                How your features will be displayed to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm capitalize">
                      {feature.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
                {features.length > 8 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm">
                      +{features.length - 8} more features
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
