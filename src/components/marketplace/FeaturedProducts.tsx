'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Heart,
  ShoppingCart,
  Crown,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FeaturedProduct {
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
    assets: any;
    tags: string[];
    quality_score: number;
    view_count: number;
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

interface FeaturedProductsProps {
  products: FeaturedProduct[];
  loading?: boolean;
  onProductClick?: (product: FeaturedProduct) => void;
  onAddToCart?: (product: FeaturedProduct) => void;
  onToggleWishlist?: (product: FeaturedProduct) => void;
  wishlistedProducts?: Set<string>;
  title?: string;
  subtitle?: string;
  variant?: 'carousel' | 'grid' | 'hero';
}

export function FeaturedProducts({
  products,
  loading = false,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlistedProducts = new Set(),
  title = 'Featured Products',
  subtitle = 'Hand-picked premium products from top creators',
  variant = 'carousel',
}: FeaturedProductsProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const getProductImage = (product: FeaturedProduct) => {
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
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No featured products available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back soon for our latest featured products.
        </p>
      </div>
    );
  }

  // Hero variant for the first featured product
  if (variant === 'hero' && products.length > 0) {
    const heroProduct = products[0];
    const heroImage = getProductImage(heroProduct);
    const isWishlisted = wishlistedProducts.has(heroProduct.id);

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <Badge className="bg-yellow-500 text-black w-fit">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {heroProduct.products.name}
              </h1>
              {heroProduct.products.short_description && (
                <p className="text-lg text-white/90 leading-relaxed">
                  {heroProduct.products.short_description}
                </p>
              )}
            </div>

            {/* Creator */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarImage src={heroProduct.users.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {getInitials(heroProduct.users.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {heroProduct.users.full_name || 'Anonymous Creator'}
                </p>
                <p className="text-sm text-white/70">Creator</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {heroProduct.products.quality_score.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{heroProduct.sales_count} sales</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {formatPrice(heroProduct.price)}
                </span>
                {heroProduct.original_price &&
                  heroProduct.original_price > heroProduct.price && (
                    <span className="text-lg text-white/70 line-through">
                      {formatPrice(heroProduct.original_price)}
                    </span>
                  )}
              </div>
              {heroProduct.discount_percentage > 0 && (
                <Badge variant="destructive" className="text-sm">
                  -{heroProduct.discount_percentage}% OFF
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => onAddToCart?.(heroProduct)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => onToggleWishlist?.(heroProduct)}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current' : ''}`}
                />
                Wishlist
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
                onClick={() => onProductClick?.(heroProduct)}
              >
                View Details
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={heroProduct.products.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(heroProduct.id)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl font-bold text-white/50">
                    {heroProduct.products.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-3 rounded-full">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          {title}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {/* Products Grid */}
      <div
        className={`grid gap-6 ${
          variant === 'carousel'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
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
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-yellow-200 dark:border-yellow-800">
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>

                {/* Product Image */}
                <div
                  className="relative h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900"
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
                      <div className="text-4xl font-bold text-yellow-600">
                        {product.products.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive">
                        -{product.discount_percentage}%
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(product);
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>

                <CardContent className="p-4">
                  {/* Category */}
                  {product.products.product_categories && (
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.products.product_categories.name}
                    </Badge>
                  )}

                  {/* Product Title */}
                  <h3
                    className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => onProductClick?.(product)}
                  >
                    {product.products.name}
                  </h3>

                  {/* Creator */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={product.users.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {getInitials(product.users.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {product.users.full_name || 'Anonymous'}
                    </span>
                  </div>

                  {/* Rating and Sales */}
                  <div className="flex items-center justify-between mb-3">
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

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price &&
                        product.original_price > product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product);
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
