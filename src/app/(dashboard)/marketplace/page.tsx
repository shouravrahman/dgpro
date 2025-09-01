'use client';

import { useAuth, useRequireAuth } from '@/lib/auth/context';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { MarketplaceSearch } from '@/components/marketplace/MarketplaceSearch';
import { FeaturedProducts } from '@/components/marketplace/FeaturedProducts';
import { useMarketplace } from '@/hooks/useMarketplace';
import {
  Heart,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Star,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplacePage() {
  const { onboardingStatus } = useAuth();
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [showFeatured, setShowFeatured] = useState(true);

  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    search,
    loadMore,
    refresh,
    wishlistedProducts,
    toggleWishlist,
  } = useMarketplace();

  // Redirect non-buyers to creator studio
  useEffect(() => {
    if (
      !authLoading &&
      onboardingStatus?.isCompleted &&
      onboardingStatus?.role !== 'buyer'
    ) {
      router.push('/creator');
    }
  }, [authLoading, onboardingStatus, router]);

  const handleProductClick = (product: any) => {
    // Navigate to product detail page
    router.push(`/marketplace/product/${product.id}`);
  };

  const handleAddToCart = (product: any) => {
    // Add to cart logic
    toast.success(`${product.products.name} added to cart!`);
  };

  const handleToggleWishlist = (product: unknown) => {
    toggleWishlist(product.id);
    const isWishlisted = wishlistedProducts.has(product.id);
    toast.success(
      isWishlisted
        ? `${product.products.name} removed from wishlist`
        : `${product.products.name} added to wishlist!`
    );
  };

  if (authLoading) {
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/marketplace/wishlist')}
          >
            <Heart className="w-4 h-4 mr-2" />
            Wishlist ({wishlistedProducts.size})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/cart')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
          </Button>
        </div>
      }
    >
      <div className="flex min-h-screen">
        {/* Filters Sidebar */}
        {data && (
          <MarketplaceFilters
            categories={data.filters.categories}
            tags={data.filters.popularTags}
            priceRange={data.filters.priceRange}
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            loading={loading}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <MarketplaceSearch
                value={filters.search || ''}
                onChange={(value) => updateFilters({ search: value })}
                onSearch={search}
                loading={loading}
              />
            </div>

            {/* Mobile Filters Button */}
            <div className="lg:hidden">
              {data && (
                <MarketplaceFilters
                  categories={data.filters.categories}
                  tags={data.filters.popularTags}
                  priceRange={data.filters.priceRange}
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  loading={loading}
                />
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  className="ml-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats */}
          {data?.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <Package className="w-6 h-6" />
                  {data.stats.activeListings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Products
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                  <Users className="w-6 h-6" />
                  {Math.floor(data.stats.activeListings / 2).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Creators</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  {data.filters.categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-2">
                  <Star className="w-6 h-6" />
                  4.8
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          )}

          {/* Featured Products */}
          {data?.featured &&
            data.featured.length > 0 &&
            showFeatured &&
            !filters.search && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Featured Products</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeatured(false)}
                  >
                    Hide Featured
                  </Button>
                </div>
                <FeaturedProducts
                  products={data.featured}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistedProducts={wishlistedProducts}
                  variant="carousel"
                />
              </div>
            )}

          {/* Active Filters Display */}
          {(filters.category ||
            filters.search ||
            filters.tags.length > 0 ||
            filters.featured) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.search && (
                <Badge variant="secondary">Search: "{filters.search}"</Badge>
              )}
              {filters.category && data && (
                <Badge variant="secondary">
                  Category:{' '}
                  {
                    data.filters.categories.find(
                      (c) => c.slug === filters.category
                    )?.name
                  }
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  Tag: {tag}
                </Badge>
              ))}
              {filters.featured && (
                <Badge variant="secondary">Featured Only</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Results Header */}
          {data && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {filters.search
                    ? `Search Results for "${filters.search}"`
                    : 'All Products'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.listings.length} products found
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {data && (
            <MarketplaceGrid
              products={data.listings}
              loading={loading}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistedProducts={wishlistedProducts}
            />
          )}

          {/* Load More Button */}
          {data?.pagination.hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {data && data.listings.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.category || filters.tags.length > 0
                  ? 'Try adjusting your search criteria or browse different categories.'
                  : 'Be the first to list a product in the marketplace!'}
              </p>
              {(filters.search ||
                filters.category ||
                filters.tags.length > 0) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
