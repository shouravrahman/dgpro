'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Package,
  Plus,
  Minus,
  GripVertical,
  Sparkles,
  TrendingDown,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { BundleBuilderItem, BundleBuilderState } from '@/types/cart';

interface BundleBuilderProps {
  availableProducts: BundleBuilderItem[];
  onClose?: () => void;
}

export function BundleBuilder({
  availableProducts,
  onClose,
}: BundleBuilderProps) {
  const [bundleState, setBundleState] = useState<BundleBuilderState>({
    items: availableProducts,
    selected_items: [],
    total_price: 0,
    total_savings: 0,
    bundle_discount: 10, // Default 10% bundle discount
  });

  const [bundleName, setBundleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();

  // Calculate totals when selection changes
  useEffect(() => {
    const selectedItems = bundleState.items.filter((item) => item.selected);
    const originalTotal = selectedItems.reduce(
      (sum, item) => sum + (item.original_price || item.price),
      0
    );
    const bundleTotal = selectedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const bundleDiscount = bundleTotal * (bundleState.bundle_discount / 100);
    const finalTotal = bundleTotal - bundleDiscount;
    const totalSavings = originalTotal - finalTotal;

    setBundleState((prev) => ({
      ...prev,
      selected_items: selectedItems,
      total_price: finalTotal,
      total_savings: totalSavings,
    }));
  }, [bundleState.items, bundleState.bundle_discount]);

  const toggleItemSelection = (itemId: string) => {
    setBundleState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      ),
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(bundleState.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBundleState((prev) => ({ ...prev, items }));
  };

  const updateBundleDiscount = (discount: number[]) => {
    setBundleState((prev) => ({ ...prev, bundle_discount: discount[0] }));
  };

  const createBundle = async () => {
    if (bundleState.selected_items.length < 2) {
      toast({
        title: 'Minimum items required',
        description: 'Please select at least 2 items to create a bundle.',
        variant: 'destructive',
      });
      return;
    }

    if (!bundleName.trim()) {
      toast({
        title: 'Bundle name required',
        description: 'Please enter a name for your bundle.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      // Create bundle via API
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bundleName,
          selected_items: bundleState.selected_items.map((item) => item.id),
          bundle_discount: bundleState.bundle_discount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add bundle to cart
        await addToCart({ bundle_id: result.data.bundle.id, quantity: 1 });

        toast({
          title: 'Bundle created!',
          description: `${bundleName} has been added to your cart.`,
        });

        onClose?.();
      } else {
        toast({
          title: 'Failed to create bundle',
          description: result.error.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Create bundle error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bundle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Bundle Builder</span>
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            Create custom bundles and save money. Drag to reorder, click to
            select items.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select products to include in your bundle
              </p>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="products">
                  {(provided) => (
                    <motion.div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {bundleState.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              variants={itemVariants}
                              className={`border rounded-lg p-4 transition-all ${
                                item.selected
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border hover:border-primary/50'
                              } ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Product Image */}
                                <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.description}
                                  </p>
                                  {item.category && (
                                    <Badge
                                      variant="secondary"
                                      className="mt-1 text-xs"
                                    >
                                      {item.category}
                                    </Badge>
                                  )}
                                </div>

                                {/* Pricing */}
                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    {item.original_price &&
                                      item.original_price > item.price && (
                                        <span className="text-sm text-muted-foreground line-through">
                                          {formatCurrency(item.original_price)}
                                        </span>
                                      )}
                                    <span className="font-semibold">
                                      {formatCurrency(item.price)}
                                    </span>
                                  </div>

                                  {item.discount_percentage &&
                                    item.discount_percentage > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs mt-1"
                                      >
                                        -{item.discount_percentage}%
                                      </Badge>
                                    )}
                                </div>

                                {/* Selection Toggle */}
                                <Button
                                  variant={
                                    item.selected ? 'default' : 'outline'
                                  }
                                  size="sm"
                                  onClick={() => toggleItemSelection(item.id)}
                                  className="ml-2"
                                >
                                  {item.selected ? (
                                    <Minus className="h-4 w-4" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>

        {/* Bundle Configuration */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Bundle Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Bundle Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bundle-name">Bundle Name</Label>
                  <Input
                    id="bundle-name"
                    placeholder="My Awesome Bundle"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Bundle Discount: {bundleState.bundle_discount}%</Label>
                  <Slider
                    value={[bundleState.bundle_discount]}
                    onValueChange={updateBundleDiscount}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bundle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Bundle Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Items</span>
                    <span>{bundleState.selected_items.length}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Original Price</span>
                    <span>
                      {formatCurrency(
                        bundleState.selected_items.reduce(
                          (sum, item) =>
                            sum + (item.original_price || item.price),
                          0
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center space-x-1">
                      <TrendingDown className="h-3 w-3" />
                      <span>Bundle Savings</span>
                    </span>
                    <span>-{formatCurrency(bundleState.total_savings)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Bundle Price</span>
                    <span>{formatCurrency(bundleState.total_price)}</span>
                  </div>
                </div>

                {bundleState.selected_items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Included Items:</h4>
                    <div className="space-y-1">
                      {bundleState.selected_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs"
                        >
                          <span className="truncate flex-1 mr-2">
                            {item.name}
                          </span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={createBundle}
                  disabled={
                    bundleState.selected_items.length < 2 ||
                    !bundleName.trim() ||
                    isCreating
                  }
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Bundle...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Bundle to Cart
                    </>
                  )}
                </Button>

                {bundleState.selected_items.length < 2 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Select at least 2 items to create a bundle
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
