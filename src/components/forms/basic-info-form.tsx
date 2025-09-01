'use client';

/**
 * Basic Info Form Component
 * Form for basic product information with real-time validation
 */

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Hash, Type, FileText, Tag } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { formValidator } from '@/lib/forms/validation';
import type { ProductFormData } from '@/types/product-forms';

import { RichTextEditor } from './rich-text-editor';
import { TagInput } from './tag-input';

export function BasicInfoForm() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<ProductFormData>();

  const [showPreview, setShowPreview] = useState(false);
  const [slugGenerated, setSlugGenerated] = useState(false);

  const name = watch('name');
  const slug = watch('slug');
  const shortDescription = watch('shortDescription');
  const description = watch('description');
  const tags = watch('tags') || [];

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slugGenerated) {
      const generatedSlug = formValidator.generateSlug(name);
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, slugGenerated]);

  // Character counts
  const shortDescriptionCount = shortDescription?.length || 0;
  const descriptionCount = description?.length || 0;

  const handleSlugChange = (value: string) => {
    setSlugGenerated(true);
    setValue('slug', formValidator.generateSlug(value));
  };

  const handleTagsChange = (newTags: string[]) => {
    setValue('tags', newTags);
    trigger('tags');
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Product Name *
        </Label>
        <Input
          id="name"
          placeholder="Enter a compelling product name"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Choose a clear, descriptive name that highlights your product's main
          benefit
        </p>
      </div>

      {/* URL Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug" className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          URL Slug
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="slug"
              placeholder="auto-generated-from-name"
              value={slug || ''}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">
                {errors.slug.message}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (name) {
                const newSlug = formValidator.generateSlug(name);
                setValue('slug', newSlug);
                setSlugGenerated(false);
              }
            }}
            disabled={!name}
          >
            Regenerate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          URL-friendly version of your product name. Preview:
          <span className="font-mono ml-1 text-primary">
            /products/{slug || 'your-product-slug'}
          </span>
        </p>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Short Description
        </Label>
        <Textarea
          id="shortDescription"
          placeholder="Brief description for listings and previews"
          rows={3}
          {...register('shortDescription')}
          className={errors.shortDescription ? 'border-destructive' : ''}
        />
        <div className="flex justify-between items-center">
          {errors.shortDescription ? (
            <p className="text-sm text-destructive">
              {errors.shortDescription.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              A concise summary that appears in search results and product cards
            </p>
          )}
          <span
            className={`text-xs ${shortDescriptionCount > 200 ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {shortDescriptionCount}/200
          </span>
        </div>
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Full Description *
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>

        {showPreview ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: description || '<p>No description yet...</p>',
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <RichTextEditor
            value={description || ''}
            onChange={(value) => {
              setValue('description', value);
              trigger('description');
            }}
            placeholder="Detailed product description with features, benefits, and usage instructions..."
            error={errors.description?.message}
          />
        )}

        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Comprehensive description with features, benefits, and usage
          instructions
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </Label>
        <TagInput
          value={tags}
          onChange={handleTagsChange}
          placeholder="Add relevant tags..."
          maxTags={10}
        />
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Help users discover your product with relevant keywords (max 10 tags)
        </p>
      </div>

      {/* Live Preview Card */}
      {(name || shortDescription) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </CardTitle>
              <CardDescription>
                How your product will appear in listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {name || 'Your Product Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    /products/{slug || 'your-product-slug'}
                  </p>
                </div>

                {shortDescription && (
                  <p className="text-sm">{shortDescription}</p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 5).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {tags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{tags.length - 5} more
                      </Badge>
                    )}
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
