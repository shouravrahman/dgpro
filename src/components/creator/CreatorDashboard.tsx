'use client';

import { useState } from 'react';
import { Plus, TrendingUp, DollarSign, Eye, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProductList } from './ProductList';
import { EarningsDashboard } from './EarningsDashboard';
import { CreatorAnalyticsDashboard } from './CreatorAnalyticsDashboard';
import { ProductCreationWizard } from './ProductCreationWizard';
import { useCreator } from '@/hooks/useCreator';

export function CreatorDashboard() {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { stats, isLoading } = useCreator();

  if (showCreateWizard) {
    return (
      <ProductCreationWizard
        onClose={() => setShowCreateWizard(false)}
        onComplete={() => {
          setShowCreateWizard(false);
          // Refresh data
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your products and track your success
          </p>
        </div>
        <Button
          onClick={() => setShowCreateWizard(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Create Product</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeProducts || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.salesThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (stats?.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +${(stats?.revenueThisMonth || 0).toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (stats?.averageRating || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats?.totalReviews || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CreatorAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <EarningsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
