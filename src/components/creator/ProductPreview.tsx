'use client';

import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  Star,
  MessageCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { SimpleProduct as Product } from '@/types/creator';

interface ProductPreviewProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export function ProductPreview({
  product,
  onClose,
  onEdit,
}: ProductPreviewProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                product.status === 'published'
                  ? 'default'
                  : product.status === 'draft'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {product.status}
            </Badge>
            <span className="text-sm text-muted-foreground">Preview Mode</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {product.creatorName || 'You'}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                    </span>
                    {product.updatedAt !== product.createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          Updated{' '}
                          {format(new Date(product.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center gap-6">
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {product.sales || 0} sales
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.views || 0} views
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Product Image */}
            {product.thumbnail && (
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Files Preview */}
            {product.files && product.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                  <CardDescription>
                    Files you'll receive with this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Reviews ({product.reviewCount || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.reviews && product.reviews.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={review.userAvatar} />
                                <AvatarFallback>
                                  {review.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {review.userName}
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
                              {format(
                                new Date(review.createdAt),
                                'MMM dd, yyyy'
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-11">
                            {review.comment}
                          </p>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-lg text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                </div>

                <Button className="w-full" size="lg" disabled>
                  Add to Cart
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>✓ Instant download</p>
                  <p>✓ {product.licenseType || 'Standard'} license</p>
                  {product.downloadLimit ? (
                    <p>✓ {product.downloadLimit} downloads</p>
                  ) : (
                    <p>✓ Unlimited downloads</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Creator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.creatorAvatar} />
                    <AvatarFallback>
                      {(product.creatorName || 'You').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {product.creatorName || 'You'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.creatorProducts || 1} products
                    </p>
                  </div>
                </div>

                {product.creatorBio && (
                  <p className="text-sm text-muted-foreground">
                    {product.creatorBio}
                  </p>
                )}

                <Button variant="outline" className="w-full" disabled>
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Product Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Category
                  </span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    File Size
                  </span>
                  <span className="text-sm">
                    {product.files?.reduce(
                      (total, file) => total + file.size,
                      0
                    )
                      ? `${(product.files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Files</span>
                  <span className="text-sm">{product.files?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {format(new Date(product.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
