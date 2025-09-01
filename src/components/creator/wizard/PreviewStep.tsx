'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  FileText,
  Image,
  Type,
  DollarSign,
  Tag,
  Calendar,
  User,
  Download,
  Share,
  Edit,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewStepProps {
  productType: 'pdf' | 'image' | 'text';
  productData: any;
  updateProductData: (updates: any) => void;
  canProceed: boolean;
}

export function PreviewStep({
  productType,
  productData,
  updateProductData,
  canProceed,
}: PreviewStepProps) {
  const [activeTab, setActiveTab] = useState('product');

  const getProductIcon = () => {
    switch (productType) {
      case 'pdf':
        return FileText;
      case 'image':
        return Image;
      case 'text':
        return Type;
      default:
        return FileText;
    }
  };

  const ProductIcon = getProductIcon();

  const formatPrice = () => {
    if (productData.pricing.type === 'free') return 'Free';
    const currency =
      productData.pricing.currency === 'USD'
        ? '$'
        : productData.pricing.currency === 'EUR'
          ? '€'
          : productData.pricing.currency === 'GBP'
            ? '£'
            : '$';
    return `${currency}${productData.pricing.amount || 0}`;
  };

  const getCompletionStatus = () => {
    const checks = [
      { label: 'Product Title', completed: !!productData.title },
      { label: 'Description', completed: !!productData.description },
      { label: 'Category', completed: !!productData.category },
      {
        label: 'Content',
        completed:
          productData.content.files.length > 0 ||
          !!productData.content.instructions,
      },
      {
        label: 'Pricing',
        completed:
          productData.pricing.type === 'free' ||
          (productData.pricing.amount && productData.pricing.amount > 0),
      },
    ];

    const completed = checks.filter((check) => check.completed).length;
    const total = checks.length;

    return { checks, completed, total, percentage: (completed / total) * 100 };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-8">
      {/* Completion Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={cn(
            'border-2',
            status.percentage === 100
              ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
              : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {status.percentage === 100 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {status.percentage === 100
                      ? 'Ready to Publish!'
                      : 'Almost Ready'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status.completed} of {status.total} sections completed
                  </p>
                </div>
              </div>
              <Badge
                variant={status.percentage === 100 ? 'default' : 'secondary'}
              >
                {Math.round(status.percentage)}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {status.checks.map((check, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg text-sm',
                    check.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {check.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current rounded-full" />
                  )}
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="product">Product Preview</TabsTrigger>
          <TabsTrigger value="listing">Marketplace Listing</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
        </TabsList>

        {/* Product Preview */}
        <TabsContent value="product" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  How Your Product Will Look
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-muted/30">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ProductIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold">
                          {productData.title || 'Product Title'}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice()}
                          </div>
                          {productData.pricing.originalPrice &&
                            productData.pricing.originalPrice >
                              (productData.pricing.amount || 0) && (
                              <div className="text-sm text-muted-foreground line-through">
                                ${productData.pricing.originalPrice}
                              </div>
                            )}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {productData.description ||
                          'Product description will appear here...'}
                      </p>

                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="outline">
                          {productData.category || 'Category'}
                        </Badge>
                        {productData.subcategory && (
                          <Badge variant="secondary">
                            {productData.subcategory}
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {productType}
                        </Badge>
                      </div>

                      {productData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {productData.tags
                            .slice(0, 5)
                            .map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          {productData.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{productData.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Your Name</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        {productData.content.files.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>
                              {productData.content.files.length} file
                              {productData.content.files.length !== 1
                                ? 's'
                                : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  {productData.content.preview && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3">Content Preview</h4>
                      <div
                        className="prose prose-sm max-w-none bg-background rounded-lg p-4 border"
                        dangerouslySetInnerHTML={{
                          __html: productData.content.preview,
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Marketplace Listing */}
        <TabsContent value="listing" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Listing Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <ProductIcon className="w-12 h-12 text-primary" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {productData.title || 'Product Title'}
                        </h4>
                        <div className="text-sm font-semibold text-primary ml-2">
                          {formatPrice()}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {productData.description || 'Product description...'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {productData.category || 'Category'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>You</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Product Details */}
        <TabsContent value="details" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Complete Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title:</span>
                          <span>{productData.title || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">{productType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <span>{productData.category || 'Not set'}</span>
                        </div>
                        {productData.subcategory && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Subcategory:
                            </span>
                            <span>{productData.subcategory}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Pricing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">
                            {productData.pricing.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatPrice()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Currency:
                          </span>
                          <span>{productData.pricing.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Files:</span>
                          <span>
                            {productData.content.files.length} file
                            {productData.content.files.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {productData.content.aiGenerated && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              AI Generated:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Yes
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Publishing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Visibility:
                          </span>
                          <span className="capitalize">
                            {productData.visibility}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Publish:
                          </span>
                          <span>
                            {productData.publishImmediately
                              ? 'Immediately'
                              : 'Save as draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {productData.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {productData.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share Preview
          </Button>
          <Button disabled={status.percentage < 100}>
            Continue to Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
