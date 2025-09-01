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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Copy,
  Share2,
  Trophy,
  Gift,
  CreditCard,
} from 'lucide-react';
import {
  useAffiliate,
  useAffiliateStats,
  useAffiliateLinks,
} from '@/hooks/useAffiliate';
import { AffiliateRegistration } from './AffiliateRegistration';
import { AffiliateStats } from './AffiliateStats';
import { ReferralsList } from './ReferralsList';
import { CompetitionsList } from './CompetitionsList';
import { PayoutHistory } from './PayoutHistory';
import { LinkGenerator } from './LinkGenerator';
import { toast } from 'sonner';

export function AffiliateDashboard() {
  const { affiliate, isLoadingAffiliate, affiliateError } = useAffiliate();
  const { data: statsData, isLoading: isLoadingStats } = useAffiliateStats();
  const { generateLink, affiliateCode } = useAffiliateLinks();
  const [activeTab, setActiveTab] = useState('overview');

  // Show registration form if user doesn't have affiliate account
  if (!isLoadingAffiliate && !affiliate && !affiliateError) {
    return <AffiliateRegistration />;
  }

  if (isLoadingAffiliate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (affiliateError || !affiliate) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to load affiliate dashboard
        </h3>
        <p className="text-gray-600 mb-4">
          {affiliateError?.message || 'Please try again later'}
        </p>
        <AffiliateRegistration />
      </div>
    );
  }

  const stats = statsData?.stats;

  const copyAffiliateCode = () => {
    if (affiliateCode) {
      navigator.clipboard.writeText(affiliateCode);
      toast.success('Affiliate code copied to clipboard!');
    }
  };

  const copyAffiliateLink = () => {
    const link = generateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Affiliate link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Affiliate Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your referrals, earnings, and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={affiliate.status === 'active' ? 'default' : 'secondary'}
          >
            {affiliate.status}
          </Badge>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium">Code:</span>
            <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
              {affiliateCode}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAffiliateCode}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +${stats.thisMonthEarnings.toFixed(2)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Referrals
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonthReferrals} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.conversionRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.clickCount} total clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Earnings
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.pendingEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate links and share your affiliate code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={copyAffiliateLink}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Copy Affiliate Link
            </Button>
            <Button variant="outline" onClick={copyAffiliateCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('links')}>
              <Share2 className="h-4 w-4 mr-2" />
              Generate Links
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="links">Link Generator</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            {stats?.topProducts && stats.topProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>
                    Your best converting products this period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-gray-600">
                              {product.referrals} referrals
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${product.earnings.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest referrals and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReferralsList limit={5} showPagination={false} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralsList />
        </TabsContent>

        <TabsContent value="competitions">
          <CompetitionsList />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutHistory />
        </TabsContent>

        <TabsContent value="links">
          <LinkGenerator />
        </TabsContent>

        <TabsContent value="stats">
          <AffiliateStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
