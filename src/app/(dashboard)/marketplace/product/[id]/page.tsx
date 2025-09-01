'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Download,
  Eye,
  Shield,
  Clock,
  User,
  Tag,
  MessageCircle,
  ThumbsUp,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { useMarketplace } from '@/hooks/useMarketplace';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  thumbnail?: string;
  images: string[];
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    preview?: string;
  }>;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    rating: number;
    totalProducts: number;
    totalSales: number;
  };
  stats: {
    views: number;
    downloads: number;
    sales: number;
    rating: number;
    reviewCount: number;
  };
  reviews: Array<{
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    date: string;
    helpful: number;
  }>;
  features: string[];
  requirements: string[];
  license: string;
  lastUpdated: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, isUpdating } = useCart();
  const { wishlistedProducts, toggleWishlist } = useMarketplace();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      setIsWishlisted(wishlistedProducts.has(product.id));
    }
  }, [product, wishlistedProducts]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/products/${productId}`);

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const result = await response.json();
      setProduct(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={
                      product.images[selectedImage] || product.thumbnail || ''
                    }
                    alt={product.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl font-bold text-gray-400">
                      {product.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {product.title}
                </h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWishlistToggle}
                  >
                    <Heart
                      className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.stats.rating.toFixed(1)}</span>
                  <span>({product.stats.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>{product.stats.sales} sales</span>
                <span>•</span>
                <span>{product.stats.views} views</span>
              </div>

              <Badge variant="outline" className="mb-4">
                {product.category}
              </Badge>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
              </div>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {formatPrice(product.originalPrice - product.price)}(
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % off)
                  </div>
                )}
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isUpdating}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isUpdating ? 'Adding...' : 'Add to Cart'}
            </Button>

            {/* Features */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-green-600" />
                <span>Instant download</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Lifetime access</span>
              </div>
            </div>

            {/* Creator Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={product.creator.avatar} />
                    <AvatarFallback>
                      {product.creator.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{product.creator.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.creator.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">
                      {product.creator.totalProducts}
                    </div>
                    <div className="text-muted-foreground">Products</div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {product.creator.totalSales}
                    </div>
                    <div className="text-muted-foreground">Sales</div>
                  </div>
                </div>
                {product.creator.bio && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {product.creator.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">What's Included:</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    Files Included ({product.files.length})
                  </h3>
                  <div className="space-y-3">
                    {product.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        {file.preview && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">
                      Reviews ({product.stats.reviewCount})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {product.stats.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>
                                  {review.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {review.user.name}
                                </p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-11">
                            {review.comment}
                          </p>
                          <div className="flex items-center gap-4 ml-11">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {review.helpful}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">
                        Product Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <span>{product.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            License:
                          </span>
                          <span>{product.license}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            File Count:
                          </span>
                          <span>{product.files.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Size:
                          </span>
                          <span>
                            {formatFileSize(
                              product.files.reduce(
                                (total, file) => total + file.size,
                                0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Dates</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Last Updated:
                          </span>
                          <span>
                            {new Date(product.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.requirements && product.requirements.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-1 text-sm">
                        {product.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
