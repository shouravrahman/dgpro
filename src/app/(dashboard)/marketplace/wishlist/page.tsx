'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Share2, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/useCart';
import { useMarketplace } from '@/hooks/useMarketplace';
import { toast } from 'sonner';
import Image from 'next/image';

interface WishlistProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  thumbnail?: string;
  creator: {
    name: string;
    avatar?: string;
  };
  stats: {
    rating: number;
    reviewCount: number;
    sales: number;
  };
  addedAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart, isUpdating } = useCart();
  const { wishlistedProducts, toggleWishlist } = useMarketplace();

  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWishlistItems();
  }, [wishlistedProducts]);

  const fetchWishlistItems = async () => {
    if (wishlistedProducts.size === 0) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productIds = Array.from(wishlistedProducts);
      const response = await fetch('/api/marketplace/products/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_ids: productIds }),
      });

      if (response.ok) {
        const result = await response.json();
        setWishlistItems(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist items:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist(productId);
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      });
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    const itemsToAdd =
      selectedItems.size > 0
        ? wishlistItems.filter((item) => selectedItems.has(item.id))
        : wishlistItems;

    try {
      for (const item of itemsToAdd) {
        await addToCart({
          product_id: item.id,
          quantity: 1,
        });
      }
      toast.success(`Added ${itemsToAdd.length} items to cart!`);
      setSelectedItems(new Set());
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map((item) => item.id)));
    }
  };

  const handleShare = async (product: WishlistProduct) => {
    const url = `${window.location.origin}/marketplace/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length}{' '}
            {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="w-full sm:w-auto"
            >
              {selectedItems.size === wishlistItems.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
            <Button
              onClick={handleAddAllToCart}
              disabled={
                isUpdating ||
                (selectedItems.size === 0 && wishlistItems.length === 0)
              }
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add {selectedItems.size > 0 ? `${selectedItems.size}` : 'All'} to
              Cart
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-6">
              Save products you love to buy them later
            </p>
            <Button onClick={() => router.push('/marketplace')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl font-bold text-gray-400">
                            {product.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(product.id)}
                        onChange={() => handleSelectItem(product.id)}
                        className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                      />
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleShare(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          router.push(`/marketplace/product/${product.id}`)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Discount Badge */}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <Badge
                          variant="destructive"
                          className="absolute bottom-2 left-2"
                        >
                          -
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </Badge>
                      )}
                  </div>

                  <CardContent className="p-4">
                    {/* Category */}
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.category}
                    </Badge>

                    {/* Title */}
                    <h3
                      className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                      onClick={() =>
                        router.push(`/marketplace/product/${product.id}`)
                      }
                    >
                      {product.title}
                    </h3>

                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={product.creator.avatar} />
                        <AvatarFallback className="text-xs">
                          {product.creator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {product.creator.name}
                      </span>
                    </div>

                    {/* Rating and Sales */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {product.stats.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({product.stats.reviewCount})
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.stats.sales} sales
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={isUpdating}
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        size="sm"
                        className="px-3"
                      >
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      </Button>
                    </div>

                    {/* Added Date */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(product.addedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
