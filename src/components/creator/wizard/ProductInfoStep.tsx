'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, X, Lightbulb, TrendingUp, Target } from 'lucide-react';

interface ProductInfoStepProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  updateProductData: (updates: any) => void;
  canProceed: boolean;
}

const CATEGORIES = {
  pdf: [
    {
      value: 'business',
      label: 'Business & Finance',
      subcategories: ['Templates', 'Guides', 'Planners', 'Reports'],
    },
    {
      value: 'education',
      label: 'Education & Learning',
      subcategories: ['Courses', 'Workbooks', 'Study Guides', 'Worksheets'],
    },
    {
      value: 'lifestyle',
      label: 'Lifestyle & Health',
      subcategories: ['Fitness', 'Nutrition', 'Self-Care', 'Productivity'],
    },
    {
      value: 'creative',
      label: 'Creative & Design',
      subcategories: ['Templates', 'Guides', 'Inspiration', 'Tutorials'],
    },
    {
      value: 'technology',
      label: 'Technology & Software',
      subcategories: ['Guides', 'Documentation', 'Tutorials', 'References'],
    },
  ],
  image: [
    {
      value: 'graphics',
      label: 'Graphics & Design',
      subcategories: ['Social Media', 'Logos', 'Icons', 'Illustrations'],
    },
    {
      value: 'photography',
      label: 'Photography',
      subcategories: ['Stock Photos', 'Backgrounds', 'Textures', 'Overlays'],
    },
    {
      value: 'marketing',
      label: 'Marketing Materials',
      subcategories: ['Banners', 'Flyers', 'Brochures', 'Ads'],
    },
    {
      value: 'web',
      label: 'Web & UI',
      subcategories: ['UI Kits', 'Mockups', 'Wireframes', 'Assets'],
    },
    {
      value: 'print',
      label: 'Print Design',
      subcategories: ['Business Cards', 'Posters', 'Invitations', 'Stationery'],
    },
  ],
  text: [
    {
      value: 'content',
      label: 'Content & Copy',
      subcategories: ['Blog Posts', 'Articles', 'Copy Templates', 'Scripts'],
    },
    {
      value: 'marketing',
      label: 'Marketing Content',
      subcategories: ['Email Templates', 'Sales Copy', 'Social Media', 'Ads'],
    },
    {
      value: 'creative',
      label: 'Creative Writing',
      subcategories: ['Stories', 'Poetry', 'Scripts', 'Lyrics'],
    },
    {
      value: 'business',
      label: 'Business Content',
      subcategories: ['Proposals', 'Reports', 'Presentations', 'Documentation'],
    },
    {
      value: 'educational',
      label: 'Educational Content',
      subcategories: ['Courses', 'Tutorials', 'Guides', 'References'],
    },
  ],
};

const TRENDING_TAGS = {
  pdf: [
    'productivity',
    'business-plan',
    'social-media',
    'fitness',
    'education',
    'templates',
    'planner',
    'guide',
  ],
  image: [
    'social-media',
    'instagram',
    'logo',
    'branding',
    'mockup',
    'ui-kit',
    'icons',
    'graphics',
  ],
  text: [
    'copywriting',
    'blog-post',
    'email-marketing',
    'social-media',
    'content-strategy',
    'seo',
    'scripts',
    'articles',
  ],
};

export function ProductInfoStep({
  productType,
  productData,
  updateProductData,
  canProceed,
}: ProductInfoStepProps) {
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const categories = CATEGORIES[productType];
  const trendingTags = TRENDING_TAGS[productType];
  const selectedCategory = categories.find(
    (cat) => cat.value === productData.category
  );

  useEffect(() => {
    // Generate tag suggestions based on title and category
    const titleWords = productData.title
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);
    const categoryTags = trendingTags.filter(
      (tag) =>
        tag.includes(productData.category) ||
        titleWords.some((word) => tag.includes(word))
    );
    setSuggestions(
      [...new Set([...categoryTags, ...trendingTags])].slice(0, 8)
    );
  }, [productData.title, productData.category, trendingTags]);

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().trim();
    if (
      cleanTag &&
      !productData.tags.includes(cleanTag) &&
      productData.tags.length < 10
    ) {
      updateProductData({
        tags: [...productData.tags, cleanTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateProductData({
      tags: productData.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="title" className="text-base font-medium">
              Product Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter a compelling product title..."
              value={productData.title}
              onChange={(e) => updateProductData({ title: e.target.value })}
              className="mt-2"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {productData.title.length}/100 characters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="description" className="text-base font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what your product offers and who it's for..."
              value={productData.description}
              onChange={(e) =>
                updateProductData({ description: e.target.value })
              }
              className="mt-2 min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {productData.description.length}/500 characters
            </p>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="text-base font-medium">Category *</Label>
            <Select
              value={productData.category}
              onValueChange={(value) =>
                updateProductData({
                  category: value,
                  subcategory: '', // Reset subcategory when category changes
                })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-base font-medium">Subcategory</Label>
              <Select
                value={productData.subcategory}
                onValueChange={(value) =>
                  updateProductData({ subcategory: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <SelectItem
                      key={subcategory}
                      value={subcategory.toLowerCase()}
                    >
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-base font-medium">Tags</Label>
          <p className="text-sm text-muted-foreground">
            Add relevant tags to help people discover your product
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-muted/30">
          {productData.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Input
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-none bg-transparent flex-1 min-w-[120px] focus-visible:ring-0"
          />
        </div>

        {/* Tag Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Trending tags for {productType} products:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(tag)}
                  disabled={productData.tags.includes(tag)}
                  className="text-xs h-7"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Tips for Better Discoverability
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>
                    • Use clear, descriptive titles that explain the benefit
                  </li>
                  <li>• Include relevant keywords in your description</li>
                  <li>
                    • Add 5-8 specific tags that your target audience would
                    search for
                  </li>
                  <li>• Choose the most accurate category and subcategory</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Summary */}
      {!canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-200">
            <Target className="w-4 h-4" />
            <span className="font-medium">Required fields:</span>
          </div>
          <ul className="mt-2 text-sm text-orange-600 dark:text-orange-300 space-y-1">
            {!productData.title && <li>• Product title is required</li>}
            {!productData.description && (
              <li>• Product description is required</li>
            )}
            {!productData.category && <li>• Category selection is required</li>}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
