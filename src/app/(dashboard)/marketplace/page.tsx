'use client';

import { useAuth, useRequireAuth, useFeatureAccess } from '@/lib/auth/context';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Heart, Star } from 'lucide-react';

export default function MarketplacePage() {
  const { onboardingStatus } = useAuth();
  const { loading } = useRequireAuth();
  const canPurchaseProducts = useFeatureAccess('purchase-product');
  const router = useRouter();

  // Redirect non-buyers to creator studio
  useEffect(() => {
    if (
      !loading &&
      onboardingStatus?.isCompleted &&
      onboardingStatus?.role !== 'buyer'
    ) {
      router.push('/creator');
    }
  }, [loading, onboardingStatus, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Marketplace"
      description="Discover amazing digital products from creators"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for products, creators, or categories..."
            className="pl-10 h-12"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            All Categories
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Digital Art
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Templates
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            UI Kits
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Photography
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Software
          </Badge>
        </div>

        {/* Featured Products */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome to the Marketplace
          </h2>
          <p className="text-muted-foreground mb-4">
            Discover thousands of digital products created by talented creators.
            The full marketplace experience is coming soon!
          </p>

          {/* Mock Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Sample Product {i}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    High-quality digital product description goes here...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8</span>
                      <span className="text-xs text-muted-foreground">
                        (124)
                      </span>
                    </div>
                    <div className="font-bold text-primary">$29</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-primary">10,000+</div>
            <div className="text-sm text-muted-foreground">Products</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">5,000+</div>
            <div className="text-sm text-muted-foreground">Creators</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">4.9</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
