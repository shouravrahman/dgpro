'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, ShoppingCart, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MarketplaceProduct {
  id: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  is_featured: boolean;
  sales_count: number;
  products: {
    id: string;
    name: string;
    short_description?: string;
    assets: unknown;
    tags: string[];
    quality_score: number;
    view_count: number;
    download_count: number;
    product_categories?: {
      name: string;
      slug: string;
    };
  };
  users: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface MarketplaceGridProps {
  products: MarketplaceProduct[];
  loading?: boolean;
  onProductClick?: (product: MarketplaceProduct) => void;
  onAddToCart?: (product: MarketplaceProduct) => void;
  onToggleWishlist?: (product: MarketplaceProduct) => void;
  wishlistedProducts?: Set<string>;
}

export function MarketplaceGrid({
  products,
  loading = false,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlistedProducts = new Set(),
}: MarketplaceGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const getProductImage = (product: MarketplaceProduct) => {
    if (imageErrors.has(product.id)) {
      return null;
    }

    const assets = product.products.assets;
    if (
      assets?.images &&
      Array.isArray(assets.images) &&
      assets.images.length > 0
    ) {
      return assets.images[0];
    }

    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <ShoppingCart className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search criteria or browse different categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => {
        const productImage = getProductImage(product);
        const isWishlisted = wishlistedProducts.has(product.id);

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
              {/* Product Image */}
              <div
                className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
                onClick={() => onProductClick?.(product)}
              >
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={product.products.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-4xl font-bold text-gray-400">
                      {product.products.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_featured && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500 text-white"
                    >
                      Featured
                    </Badge>
                  )}
                  {product.discount_percentage > 0 && (
                    <Badge variant="destructive">
                      -{product.discount_percentage}%
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist?.(product);
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>

                {/* Quick Stats Overlay */}
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.products.view_count}
                  </div>
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {product.products.download_count}
                  </div>
                </div>
              </div>

              <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
                {/* Category */}
                {product.products.product_categories && (
                  <Badge variant="outline" className="mb-2 text-xs w-fit">
                    {product.products.product_categories.name}
                  </Badge>
                )}

                {/* Product Title */}
                <h3
                  className="font-semibold text-sm md:text-base mb-2 line-clamp-2 cursor-pointer hover:text-primary flex-1"
                  onClick={() => onProductClick?.(product)}
                >
                  {product.products.name}
                </h3>

                {/* Description - Hidden on mobile to save space */}
                {product.products.short_description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 hidden sm:block">
                    {product.products.short_description}
                  </p>
                )}

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-5 h-5 md:w-6 md:h-6">
                    <AvatarImage src={product.users.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(product.users.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {product.users.full_name || 'Anonymous'}
                  </span>
                </div>

                {/* Tags - Show fewer on mobile */}
                {product.products.tags && product.products.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.products.tags
                      .slice(0, window.innerWidth < 768 ? 2 : 3)
                      .map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    {product.products.tags.length >
                      (window.innerWidth < 768 ? 2 : 3) && (
                      <Badge variant="secondary" className="text-xs">
                        +
                        {product.products.tags.length -
                          (window.innerWidth < 768 ? 2 : 3)}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Rating and Sales */}
                <div className="flex items-center justify-between mb-3 mt-auto">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">
                      {product.products.quality_score.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.sales_count} sales
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-3 md:p-4 pt-0">
                <div className="flex items-center justify-between w-full">
                  {/* Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-bold text-primary text-sm md:text-base">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price &&
                      product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                  </div>

                  {/* Add to Cart Button - Always visible on mobile */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart?.(product);
                    }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
