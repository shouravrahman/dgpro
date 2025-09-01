'use client';

/**
 * Category Selector Component
 * Interactive category selection with search and filtering
 */

import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Filter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getAllCategories, getCategoriesByType } from '@/lib/categories';
import type { ProductCategory } from '@/types/database';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string) => void;
  error?: string;
  showDescription?: boolean;
  allowMultiple?: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'popular' | 'trending' | 'new';

export function CategorySelector({
  value,
  onChange,
  error,
  showDescription = true,
  allowMultiple = false,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const categories = getAllCategories();
  const categoryTypes = [
    'all',
    'design-graphics',
    'software-tools',
    'educational-content',
    'business-templates',
  ];

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = getCategoriesByType(selectedType as any);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.description.toLowerCase().includes(query) ||
          category.metadata.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          )
      );
    }

    // Additional filters
    switch (filter) {
      case 'popular':
        filtered = filtered.filter((cat) => cat.metadata.popularity > 0.7);
        break;
      case 'trending':
        filtered = filtered.filter((cat) => cat.metadata.trending);
        break;
      case 'new':
        filtered = filtered.filter((cat) => cat.metadata.isNew);
        break;
    }

    return filtered;
  }, [categories, selectedType, searchQuery, filter]);

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
  };

  const getCategoryIcon = (category: ProductCategory) => {
    // Return appropriate icon based on category type
    const iconMap: Record<string, string> = {
      'design-graphics': '🎨',
      'software-tools': '⚙️',
      'educational-content': '📚',
      'business-templates': '📊',
      'media-content': '🎬',
      'marketing-materials': '📢',
      'productivity-tools': '⚡',
      'creative-assets': '✨',
    };

    return iconMap[category.type] || '📦';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Choose Product Category</h2>
          <p className="text-muted-foreground">
            Select the category that best describes your digital product
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filter}
              onValueChange={(value: FilterType) => setFilter(value)}
            >
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category types tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="design-graphics">Design</TabsTrigger>
          <TabsTrigger value="software-tools">Software</TabsTrigger>
          <TabsTrigger value="educational-content">Education</TabsTrigger>
          <TabsTrigger value="business-templates">Business</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {/* Categories display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedType}-${viewMode}-${searchQuery}-${filter}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">
                    No categories found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-3'
                  }
                >
                  {filteredCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          value === category.id
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <CardHeader
                          className={viewMode === 'list' ? 'pb-3' : ''}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {getCategoryIcon(category)}
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {category.name}
                                </CardTitle>
                                {viewMode === 'list' && showDescription && (
                                  <CardDescription className="mt-1">
                                    {category.description}
                                  </CardDescription>
                                )}
                              </div>
                            </div>

                            {value === category.id && (
                              <div className="text-primary">
                                <ChevronRight className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        {viewMode === 'grid' && (
                          <CardContent className="pt-0">
                            {showDescription && (
                              <CardDescription className="mb-3">
                                {category.description}
                              </CardDescription>
                            )}

                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge
                                variant="secondary"
                                className={getDifficultyColor(
                                  category.metadata.skillLevel
                                )}
                              >
                                {category.metadata.skillLevel}
                              </Badge>

                              <Badge variant="outline">
                                {category.metadata.estimatedCreationTime}
                              </Badge>

                              {category.metadata.trending && (
                                <Badge
                                  variant="default"
                                  className="bg-orange-500"
                                >
                                  Trending
                                </Badge>
                              )}

                              {category.metadata.isNew && (
                                <Badge
                                  variant="default"
                                  className="bg-green-500"
                                >
                                  New
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>
                                ${category.metadata.averagePrice.min}-$
                                {category.metadata.averagePrice.max}
                              </span>
                              <span>
                                {Math.round(category.metadata.popularity * 100)}
                                % popular
                              </span>
                            </div>
                          </CardContent>
                        )}

                        {viewMode === 'list' && (
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge
                                  variant="secondary"
                                  className={getDifficultyColor(
                                    category.metadata.skillLevel
                                  )}
                                >
                                  {category.metadata.skillLevel}
                                </Badge>
                                <Badge variant="outline">
                                  {category.metadata.estimatedCreationTime}
                                </Badge>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                ${category.metadata.averagePrice.min}-$
                                {category.metadata.averagePrice.max}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Error message */}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Selected category info */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/5 rounded-lg border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="font-medium">Selected Category</span>
          </div>

          {(() => {
            const selectedCategory = categories.find((cat) => cat.id === value);
            return selectedCategory ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(selectedCategory)}
                  </span>
                  <span className="font-medium">{selectedCategory.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.description}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedCategory.metadata.skillLevel}
                  </Badge>
                  <Badge variant="outline">
                    Est. {selectedCategory.metadata.estimatedCreationTime}
                  </Badge>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}
    </div>
  );
}
