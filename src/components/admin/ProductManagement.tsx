'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useAdmin } from '@/hooks/useAdmin';
import type { ProductManagementFilters } from '@/types/admin';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  pricing: {
    type: 'free' | 'one-time' | 'subscription';
    amount?: number;
    currency?: string;
  };
  created_at: string;
  updated_at: string;
  creator?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

interface BulkActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onConfirm: (action: string, params?: any) => void;
}

function BulkActionDialog({
  isOpen,
  onClose,
  selectedProducts,
  onConfirm,
}: BulkActionDialogProps) {
  const [action, setAction] = useState<string>('');

  const handleConfirm = () => {
    if (!action) return;

    onConfirm(action);
    onClose();
    setAction('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Action</DialogTitle>
          <DialogDescription>
            Apply action to {selectedProducts.length} selected product(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publish Products</SelectItem>
                <SelectItem value="archive">Archive Products</SelectItem>
                <SelectItem value="delete">Delete Products</SelectItem>
                <SelectItem value="feature">Feature Products</SelectItem>
                <SelectItem value="review">Send for Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!action}>
            Apply Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductManagement() {
  const { getProducts, executeAdminAction, loading } = useAdmin();
  const [products, setProducts] = useState<{ data: Product[]; count: number }>({
    data: [],
    count: 0,
  });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [filters, setFilters] = useState<ProductManagementFilters>({
    page: 1,
    limit: 20,
  });

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {product.name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                {product.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return <Badge variant="outline">{category}</Badge>;
      },
    },
    {
      accessorKey: 'creator',
      header: 'Creator',
      cell: ({ row }) => {
        const creator = row.getValue('creator') as Product['creator'];
        if (!creator)
          return <span className="text-muted-foreground">Unknown</span>;

        return (
          <div className="text-sm">
            <div className="font-medium">
              {creator.user_metadata?.full_name || 'Unknown'}
            </div>
            <div className="text-muted-foreground">{creator.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'pricing',
      header: 'Price',
      cell: ({ row }) => {
        const pricing = row.getValue('pricing') as Product['pricing'];
        if (pricing.type === 'free') {
          return <Badge className="bg-green-100 text-green-800">Free</Badge>;
        }

        return (
          <div className="text-sm">
            <div className="font-medium">${pricing.amount || 0}</div>
            <div className="text-muted-foreground capitalize">
              {pricing.type}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
          published: {
            color: 'bg-green-100 text-green-800',
            icon: CheckCircle,
          },
          archived: { color: 'bg-red-100 text-red-800', icon: XCircle },
          under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;

        return (
          <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
            <Icon className="h-3 w-3 mr-1" />
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.id)}
              >
                Copy Product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Product
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {product.status === 'published' ? (
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  Feature Product
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Publish Product
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const result = await getProducts(filters);
      if (result) {
        setProducts(result);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleBulkAction = async (action: string, params?: any) => {
    try {
      const productIds = selectedProducts.map((product) => product.id);
      await executeAdminAction({
        type: 'product',
        action,
        target_ids: productIds,
        parameters: params,
      });

      // Refresh the product list
      fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleFilterChange = (
    key: keyof ProductManagementFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground">
            Manage products, reviews, and marketplace listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{products.count} total products</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.data.filter((p) => p.status === 'published').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.data.filter((p) => p.status === 'under_review').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.data.filter((p) => p.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {products.data
                .reduce((sum, p) => sum + (p.pricing.amount || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name or description"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'category',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="ebooks">E-books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'status',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price-range">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.price_min || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'price_min',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.price_max || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'price_max',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
        >
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-900">
              {selectedProducts.length} product(s) selected
            </span>
          </div>
          <Button
            onClick={() => setShowBulkDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Bulk Actions
          </Button>
          <Button variant="outline" onClick={() => setSelectedProducts([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
          </CardTitle>
          <CardDescription>
            Manage product listings and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products.data}
            searchKey="name"
            searchPlaceholder="Search products..."
            enableRowSelection={true}
            onRowSelectionChange={setSelectedProducts}
            pageSize={filters.limit}
          />
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedProducts={selectedProducts}
        onConfirm={handleBulkAction}
      />
    </div>
  );
}
