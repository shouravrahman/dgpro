'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Download,
  Star,
  TrendingUp,
  Clock,
  Eye,
  Filter,
  Search,
  Plus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { useMarketplace } from '@/hooks/useMarketplace';
import Image from 'next/image';

interface BuyerStats {
  totalPurchases: number;
  totalSpent: number;
  wishlistItems: number;
  downloadedItems: number;
  averageRating: number;
  favoriteCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface RecentPurchase {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  purchaseDate: string;
  downloadCount: number;
  rating?: number;
  category: string;
  creator: {
    name: string;
    avatar?: string;
  };
}

interface RecommendedProduct {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  creator: {
    name: string;
    avatar?: string;
  };
  reason: string;
}

export function BuyerDashboard() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { wishlistedProducts } = useMarketplace();

  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);

      // Fetch buyer stats
      const statsResponse = await fetch('/api/buyer/stats');
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        setStats(statsResult.data);
      }

      // Fetch recent purchases
      const purchasesResponse = await fetch('/api/buyer/purchases?limit=6');
      if (purchasesResponse.ok) {
        const purchasesResult = await purchasesResponse.json();
        setRecentPurchases(purchasesResult.data || []);
      }

      // Fetch recommendations
      const recommendationsResponse = await fetch(
        '/api/buyer/recommendations?limit=8'
      );
      if (recommendationsResponse.ok) {
        const recommendationsResult = await recommendationsResponse.json();
        setRecommendations(recommendationsResult.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your purchases and discover new products
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/marketplace')} className="gap-2">
            <Search className="h-4 w-4" />
            Browse Products
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPurchases || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Digital products owned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistedProducts.size}</div>
            <p className="text-xs text-muted-foreground">Saved for later</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.downloadedItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">Files downloaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Purchases</TabsTrigger>
          <TabsTrigger value="recommendations">Recommended</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {recentPurchases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring our marketplace to find amazing digital
                  products
                </p>
                <Button onClick={() => router.push('/marketplace')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPurchases.map((purchase) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {purchase.thumbnail ? (
                        <Image
                          src={purchase.thumbnail}
                          alt={purchase.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl font-bold text-gray-400">
                            {purchase.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {purchase.category}
                      </Badge>

                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {purchase.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={purchase.creator.avatar} />
                          <AvatarFallback className="text-xs">
                            {purchase.creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {purchase.creator.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-primary">
                          {formatPrice(purchase.price)}
                        </span>
                        {purchase.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{purchase.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        Purchased{' '}
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download ({purchase.downloadCount})
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No recommendations yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Make some purchases to get personalized recommendations
                </p>
                <Button onClick={() => router.push('/marketplace')}>
                  Explore Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={300}
                          height={169}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-3xl font-bold text-gray-400">
                            {product.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}

                      <Badge className="absolute top-2 left-2 text-xs">
                        {product.reason}
                      </Badge>

                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <Badge
                            variant="destructive"
                            className="absolute top-2 right-2 text-xs"
                          >
                            -
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100
                            )}
                            %
                          </Badge>
                        )}
                    </div>

                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {product.category}
                      </Badge>

                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {product.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={product.creator.avatar} />
                          <AvatarFallback className="text-xs">
                            {product.creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {product.creator.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push(`/marketplace/product/${product.id}`)
                        }
                      >
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Categories</CardTitle>
                <CardDescription>
                  Based on your purchase history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.favoriteCategories &&
                stats.favoriteCategories.length > 0 ? (
                  <div className="space-y-4">
                    {stats.favoriteCategories.map((category, index) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-muted-foreground">
                            {category.count} purchases ({category.percentage}%)
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No purchase data yet</p>
                    <p className="text-sm">
                      Start buying to see your preferences
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Shortcuts to common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/marketplace/wishlist')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View Wishlist ({wishlistedProducts.size})
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/cart')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Cart ({itemCount})
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/orders')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Order History
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/marketplace?featured=true')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Featured Products
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
