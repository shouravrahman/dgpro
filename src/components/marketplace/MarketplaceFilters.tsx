'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  DollarSign,
  Grid3X3,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  stats?: {
    productCount: number;
    listingCount: number;
  };
}

interface TagData {
  tag: string;
  count: number;
  categories: string[];
}

interface MarketplaceFiltersProps {
  categories: Category[];
  tags: TagData[];
  priceRange: { min: number; max: number };
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags: string[];
    featured?: boolean;
    sortBy?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function MarketplaceFilters({
  categories,
  tags,
  priceRange,
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}: MarketplaceFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceValues, setPriceValues] = useState([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max,
  ]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    tags: false,
    features: false,
  });

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceValues([
      filters.minPrice || priceRange.min,
      filters.maxPrice || priceRange.max,
    ]);
  }, [filters, priceRange]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    handleFilterChange('tags', newTags);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceValues(values);
    handleFilterChange('minPrice', values[0]);
    handleFilterChange('maxPrice', values[1]);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (
      localFilters.minPrice !== priceRange.min ||
      localFilters.maxPrice !== priceRange.max
    )
      count++;
    if (localFilters.tags && localFilters.tags.length > 0)
      count += localFilters.tags.length;
    if (localFilters.featured) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active Filters</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localFilters.category && (
              <Badge variant="secondary" className="text-xs">
                Category:{' '}
                {categories.find((c) => c.slug === localFilters.category)?.name}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => handleFilterChange('category', undefined)}
                />
              </Badge>
            )}
            {(localFilters.minPrice !== priceRange.min ||
              localFilters.maxPrice !== priceRange.max) && (
              <Badge variant="secondary" className="text-xs">
                Price: ${localFilters.minPrice}-${localFilters.maxPrice}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => {
                    handleFilterChange('minPrice', priceRange.min);
                    handleFilterChange('maxPrice', priceRange.max);
                  }}
                />
              </Badge>
            )}
            {localFilters.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
            {localFilters.featured && (
              <Badge variant="secondary" className="text-xs">
                Featured Only
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => handleFilterChange('featured', false)}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select
          value={localFilters.sortBy || 'newest'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <Collapsible
        open={expandedSections.categories}
        onOpenChange={() => toggleSection('categories')}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Categories
          </Label>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                !localFilters.category ? 'bg-primary/10' : ''
              }`}
              onClick={() => handleFilterChange('category', undefined)}
            >
              <span className="text-sm">All Categories</span>
              <span className="text-xs text-muted-foreground">
                {categories.reduce(
                  (sum, cat) => sum + (cat.stats?.listingCount || 0),
                  0
                )}
              </span>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  localFilters.category === category.slug ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleFilterChange('category', category.slug)}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.stats?.listingCount || 0}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible
        open={expandedSections.price}
        onOpenChange={() => toggleSection('price')}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range
          </Label>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-2">
          <div className="px-2">
            <Slider
              value={priceValues}
              onValueChange={handlePriceChange}
              max={priceRange.max}
              min={priceRange.min}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${priceValues[0]}</span>
              <span>${priceValues[1]}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min Price</Label>
              <Input
                type="number"
                value={priceValues[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || priceRange.min;
                  handlePriceChange([value, priceValues[1]]);
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Max Price</Label>
              <Input
                type="number"
                value={priceValues[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || priceRange.max;
                  handlePriceChange([priceValues[0], value]);
                }}
                className="h-8"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Tags */}
      <Collapsible
        open={expandedSections.tags}
        onOpenChange={() => toggleSection('tags')}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Popular Tags
          </Label>
          {expandedSections.tags ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {tags.slice(0, 20).map((tagData) => (
              <div key={tagData.tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tagData.tag}`}
                  checked={localFilters.tags?.includes(tagData.tag) || false}
                  onCheckedChange={() => handleTagToggle(tagData.tag)}
                />
                <Label
                  htmlFor={`tag-${tagData.tag}`}
                  className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{tagData.tag}</span>
                  <span className="text-xs text-muted-foreground">
                    {tagData.count}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Features */}
      <Collapsible
        open={expandedSections.features}
        onOpenChange={() => toggleSection('features')}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4" />
            Features
          </Label>
          {expandedSections.features ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={localFilters.featured || false}
              onCheckedChange={(checked) =>
                handleFilterChange('featured', checked)
              }
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products Only
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-80 bg-white dark:bg-gray-900 border-r p-6 h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect products.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
