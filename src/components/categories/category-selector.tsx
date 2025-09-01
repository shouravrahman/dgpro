'use client';

/**
 * Category Selector Component
 * Interactive category selection with search and filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, TrendingUp, Star, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryStats } from '@/lib/categories/category.service';
import { ProductCategory } from '@/lib/categories/types';
import { getAllCategories } from '@/lib/categories/definitions';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  showStats?: boolean;
  layout?: 'grid' | 'list';
  filter?: 'all' | 'trending' | 'popular' | 'recommended';
  className?: string;
}

export function CategorySelector({
  selectedCategory,
  onCategorySelect,
  showStats = true,
  layout = 'grid',
  filter = 'all',
  className = '',
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>(layout);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [categories] = useState<ProductCategory[]>(getAllCategories());
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);

  // Load category statistics
  useEffect(() => {
    if (showStats) {
      loadCategoryStats();
    }
  }, [showStats]);

  const loadCategoryStats = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      const mockStats: CategoryStats[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        productCount: Math.floor(Math.random() * 1000) + 50,
        averagePrice: Math.floor(Math.random() * 200) + 20,
        popularityScore: category.metadata.popularityScore,
        trendingScore: category.metadata.trendingScore,
        recentGrowth: (Math.random() - 0.5) * 0.4,
      }));
      setCategoryStats(mockStats);
    } catch (error) {
      console.error('Error loading category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Apply search filter
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

    // Apply category filter
    switch (activeFilter) {
      case 'trending':
        filtered = filtered.sort(
          (a, b) => b.metadata.trendingScore - a.metadata.trendingScore
        );
        break;
      case 'popular':
        filtered = filtered.sort(
          (a, b) => b.metadata.popularityScore - a.metadata.popularityScore
        );
        break;
      case 'recommended':
        // In a real implementation, this would use user-specific recommendations
        filtered = filtered.sort(
          (a, b) =>
            b.metadata.popularityScore +
            b.metadata.trendingScore -
            (a.metadata.popularityScore + a.metadata.trendingScore)
        );
        break;
      default:
        filtered = filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return filtered;
  }, [categories, searchQuery, activeFilter]);

  const getCategoryStats = (categoryId: string): CategoryStats | undefined => {
    return categoryStats.find((stat) => stat.id === categoryId);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatGrowth = (growth: number): string => {
    const percentage = (growth * 100).toFixed(1);
    return `${growth >= 0 ? '+' : ''}${percentage}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', icon: Filter },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'popular', label: 'Popular', icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeFilter === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(key as any)}
                className="h-8"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewLayout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-3 w-3" />
            </Button>
            <Button
              variant={viewLayout === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div
          className={
            viewLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredCategories.map((category) => {
            const stats = getCategoryStats(category.id);
            const isSelected = selectedCategory === category.id;

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'hover:shadow-lg'
                } ${viewLayout === 'list' ? 'flex items-center' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <CardHeader className={viewLayout === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {category.name}
                        </CardTitle>
                        <CardDescription
                          className={
                            viewLayout === 'list'
                              ? 'line-clamp-1'
                              : 'line-clamp-2'
                          }
                        >
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Trending/Popular Badges */}
                    <div className="flex flex-col gap-1">
                      {category.metadata.trendingScore > 0.8 && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {category.metadata.popularityScore > 0.85 && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {showStats && stats && (
                  <CardContent
                    className={
                      viewLayout === 'list' ? 'flex items-center gap-6' : ''
                    }
                  >
                    <div
                      className={`grid ${viewLayout === 'list' ? 'grid-cols-4' : 'grid-cols-2'} gap-4 text-sm`}
                    >
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Products
                        </p>
                        <p className="font-semibold">
                          {stats.productCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Avg Price
                        </p>
                        <p className="font-semibold">
                          {formatPrice(stats.averagePrice)}
                        </p>
                      </div>
                      {viewLayout === 'grid' && (
                        <>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Growth
                            </p>
                            <p
                              className={`font-semibold ${
                                stats.recentGrowth >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {formatGrowth(stats.recentGrowth)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Score
                            </p>
                            <p className="font-semibold">
                              {(stats.popularityScore * 100).toFixed(0)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
