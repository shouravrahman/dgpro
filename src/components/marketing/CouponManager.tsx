'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Percent,
  DollarSign,
  Copy,
  Edit,
  Trash2,
  Users,
  Calendar,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react';
import { marketingValidations } from '@/lib/validations/marketing';
import type { Coupon } from '@/types/marketing';

const createCouponSchema = marketingValidations.createCoupon;

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof createCouponSchema>>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimum_amount: 0,
      usage_limit: undefined,
      user_usage_limit: 1,
      applicable_products: [],
      starts_at: undefined,
      expires_at: undefined,
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/marketing/coupons');
      const result = await response.json();
      if (result.success) {
        setCoupons(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof createCouponSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/marketing/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (result.success) {
        setCoupons([result.data, ...coupons]);
        setIsCreateDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCouponCode = () => {
    const code = `SAVE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    form.setValue('code', code);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
    const startsAt = new Date(coupon.starts_at);

    if (coupon.status === 'inactive') {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (expiresAt && expiresAt < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (startsAt > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const getCouponValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`;
    } else if (coupon.type === 'fixed_amount') {
      return `$${coupon.value} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Coupon Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage discount coupons for your products
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Discount Coupon</DialogTitle>
              <DialogDescription>
                Create a new coupon to offer discounts to your customers.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input placeholder="SAVE20" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateCouponCode}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Sale" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Special discount for summer sale..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="fixed_amount">
                              Fixed Amount
                            </SelectItem>
                            <SelectItem value="free_shipping">
                              Free Shipping
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimum_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Unlimited"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for unlimited uses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {coupon.code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCouponCode(coupon.code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {getStatusBadge(coupon)}
              </div>
              <CardTitle className="text-lg">{coupon.name}</CardTitle>
              {coupon.description && (
                <CardDescription className="line-clamp-2">
                  {coupon.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Coupon Value */}
                <div className="text-center py-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {getCouponValue(coupon)}
                  </div>
                  {coupon.minimum_amount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Min. order: ${coupon.minimum_amount}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">
                      {coupon.usage_count}
                      {coupon.usage_limit && `/${coupon.usage_limit}`}
                    </div>
                    <div className="text-xs text-muted-foreground">Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">
                      {coupon.usage_limit
                        ? Math.round(
                            (coupon.usage_count / coupon.usage_limit) * 100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Usage Rate
                    </div>
                  </div>
                </div>

                {/* Coupon Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {coupon.expires_at
                      ? `Expires ${new Date(coupon.expires_at).toLocaleDateString()}`
                      : 'No expiry'}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Percent className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No coupons created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first coupon to start offering discounts to your
              customers.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Coupon
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
