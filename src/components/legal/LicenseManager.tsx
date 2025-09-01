'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Eye, DollarSign, Shield, Check, X } from 'lucide-react';
import { useLicenseTypes, useCreateProductLicense } from '@/hooks/useLegal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLicenseSchema } from '@/lib/validations/legal';
import type { CreateLicenseRequest } from '@/types/legal';

export function LicenseManager() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: licenseTypes, isLoading } = useLicenseTypes();
  const createLicense = useCreateProductLicense();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateLicenseRequest>({
    resolver: zodResolver(createLicenseSchema),
  });

  const selectedLicenseType = watch('license_type_id');
  const currentLicenseType = licenseTypes?.find(
    (lt) => lt.id === selectedLicenseType
  );

  const onSubmit = async (data: CreateLicenseRequest) => {
    try {
      await createLicense.mutateAsync(data);
      setShowCreateDialog(false);
      reset();
    } catch (error) {
      console.error('Failed to create license:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">License Management</h2>
          <p className="text-muted-foreground">
            Create and manage flexible licensing options for your products
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add License
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Product License</DialogTitle>
              <DialogDescription>
                Add a new licensing option to your product
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_id">Product</Label>
                  <Input
                    id="product_id"
                    placeholder="Product ID"
                    {...register('product_id')}
                  />
                  {errors.product_id && (
                    <p className="text-sm text-red-600">
                      {errors.product_id.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_type_id">License Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue('license_type_id', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} (${type.price_modifier}x)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.license_type_id && (
                    <p className="text-sm text-red-600">
                      {errors.license_type_id.message}
                    </p>
                  )}
                </div>
              </div>

              {currentLicenseType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {currentLicenseType.name}
                    </CardTitle>
                    <CardDescription>
                      {currentLicenseType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        {currentLicenseType.commercial_use ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Commercial Use</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentLicenseType.modification_allowed ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Modifications Allowed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentLicenseType.redistribution_allowed ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Redistribution Allowed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentLicenseType.attribution_required ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Attribution Required</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">Custom Price (optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Leave empty for automatic calculation"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_terms">Custom Terms (optional)</Label>
                <Textarea
                  id="custom_terms"
                  placeholder="Additional terms specific to this license"
                  {...register('custom_terms')}
                />
                {errors.custom_terms && (
                  <p className="text-sm text-red-600">
                    {errors.custom_terms.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register('is_default')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_default">
                  Set as default license for this product
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLicense.isPending}>
                  {createLicense.isPending ? 'Creating...' : 'Create License'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available License Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available License Types</CardTitle>
          <CardDescription>
            Standard license types you can apply to your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {licenseTypes?.map((type) => (
              <Card key={type.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <Badge variant="secondary">{type.price_modifier}x</Badge>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {type.commercial_use ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Commercial Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {type.modification_allowed ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Modifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {type.redistribution_allowed ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Redistribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {type.attribution_required ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Attribution Required</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* License Terms Preview */}
      <Card>
        <CardHeader>
          <CardTitle>License Terms & Conditions</CardTitle>
          <CardDescription>
            Standard terms that apply to each license type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {licenseTypes?.map((type) => (
              <details key={type.id} className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer hover:text-primary">
                  {type.name} - Terms & Conditions
                </summary>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {type.terms}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
