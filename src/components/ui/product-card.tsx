'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Star,
  Download,
  Eye,
  ShoppingCart,
  ExternalLink,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    currency?: string;
    image: string;
    category: string;
    author: {
      name: string;
      avatar?: string;
      verified?: boolean;
    };
    stats: {
      rating: number;
      reviews: number;
      downloads: number;
      views: number;
      likes: number;
    };
    tags: string[];
    createdAt: string;
    featured?: boolean;
    trending?: boolean;
  };
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onLike?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = 'default',
  showActions = true,
  onLike,
  onAddToCart,
  className = '',
}: ProductCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const cardVariants = {
    default: 'p-6 rounded-2xl',
    compact: 'p-4 rounded-xl',
    featured: 'p-8 rounded-3xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 ${cardVariants[variant]} ${className}`}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {product.featured && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
        {product.trending && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Trending</span>
          </div>
        )}
      </div>

      {/* Like Button */}
      {showActions && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isLiked
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </motion.button>
      )}

      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
          <div className="aspect-video flex items-center justify-center">
            {/* Placeholder for product image */}
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary/40">
                {product.name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center"
          >
            <div className="flex items-center space-x-2 text-white">
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">View Details</span>
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Category */}
          <div className="text-xs text-primary font-medium uppercase tracking-wide">
            {product.category}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Author */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              {product.author.name}
            </span>
            {product.author.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {renderStars(product.stats.rating)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({formatNumber(product.stats.reviews)})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{formatNumber(product.stats.downloads)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(product.stats.views)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-xs rounded-md text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-xs rounded-md text-muted-foreground">
                +{product.tags.length - 3}
              </span>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              <span className="text-lg font-bold text-primary">
                {product.price === 0 ? 'Free' : `$${product.price}`}
              </span>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="h-8 px-3"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    {product.price === 0 ? 'Get' : 'Buy'}
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
