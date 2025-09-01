'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCreatorAnalytics } from '@/hooks/useCreatorAnalytics';
import { CreatorAnalyticsFilters } from '@/types/creator-analytics';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Download,
  RefreshCw,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Lightbulb,
  Star,
  Heart,
} from 'lucide-react';

interface CreatorAnalyticsDashboardProps {
  creatorId?: string;
  className?: string;
}

export function CreatorAnalyticsDashboard({
  creatorId,
  className,
}: CreatorAnalyticsDashboardProps) {
  const {
    analyticsData,
    insights,
    recommendations,
    goals,
    loading,
    error,
    loadAnalyticsData,
    exportData,
    refresh,
  } = useCreatorAnalytics(creatorId);

  const [filters, setFilters] = useState<CreatorAnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    },
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>(
    'csv'
  );

  useEffect(() => {
    loadAnalyticsData(filters);
  }, [filters, loadAnalyticsData]);

  const handleDateRangeChange = (
    range: { from: Date; to: Date } | undefined
  ) => {
    if (range?.from && range?.to) {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          start: range.from,
          end: range.to,
        },
      }));
    }
  };

  const handleExport = async () => {
    try {
      await exportData(exportFormat, filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Creator Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and grow your business
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DatePickerWithRange
            value={{
              from: filters.dateRange.start,
              to: filters.dateRange.end,
            }}
            onChange={handleDateRangeChange}
          />

          <Select
            value={exportFormat}
            onValueChange={(value: 'csv' | 'json' | 'pdf') =>
              setExportFormat(value)
            }
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {analyticsData?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(
                  analyticsData.overview.topMetrics[0]?.trend || 'stable'
                )}
                <span className="ml-1">
                  {analyticsData.overview.growthRate > 0 ? '+' : ''}
                  {(analyticsData.overview.growthRate * 100).toFixed(1)}% from
                  last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analyticsData.overview.totalSales)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Sales transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analyticsData.overview.totalProducts)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Active products</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analyticsData.overview.followerCount)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Heart className="h-3 w-3 mr-1" />
                <span>Following you</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        insight.priority === 'high'
                          ? 'destructive'
                          : insight.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {rec.expectedImpact} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{goal.name}</span>
                    <Badge
                      variant={
                        goal.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {formatNumber(goal.current)} / {formatNumber(goal.target)}
                    </span>
                    <span>
                      {((goal.current / goal.target) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={(goal.current / goal.target) * 100}
                    className="h-2"
                  />
                </div>
              ))}
              {goals.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No goals set yet</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Create Goal
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-2xl font-bold text-green-600">
                      {analyticsData?.revenue
                        ? formatCurrency(analyticsData.revenue.monthlyRevenue)
                        : '$0'}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold">
                      {analyticsData?.revenue
                        ? formatCurrency(analyticsData.revenue.totalRevenue)
                        : '$0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold">
                      {analyticsData?.overview
                        ? (analyticsData.overview.conversionRate * 100).toFixed(
                            1
                          )
                        : '0'}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      analyticsData?.overview
                        ? analyticsData.overview.conversionRate * 100
                        : 0
                    }
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-lg font-bold">
                        {analyticsData?.overview
                          ? analyticsData.overview.averageRating.toFixed(1)
                          : '0.0'}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      analyticsData?.overview
                        ? (analyticsData.overview.averageRating / 5) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.products?.topProducts
                    ?.slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sales} sales •{' '}
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(product.revenue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            revenue
                          </div>
                        </div>
                      </div>
                    )) || (
                    <div className="text-center text-muted-foreground py-4">
                      No product data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.products?.categoryBreakdown?.map(
                    (category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{category.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {category.productCount} products
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(category.revenue)}
                        </span>
                      </div>
                    )
                  ) || (
                    <div className="text-center text-muted-foreground py-4">
                      No category data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analyticsData?.revenue
                        ? formatCurrency(analyticsData.revenue.totalRevenue)
                        : '$0'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Revenue
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {analyticsData?.revenue
                        ? formatCurrency(analyticsData.revenue.monthlyRevenue)
                        : '$0'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This Month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Payouts</span>
                    <span className="font-medium">
                      {analyticsData?.revenue
                        ? formatCurrency(analyticsData.revenue.pendingPayouts)
                        : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Next Payout</span>
                    <span className="font-medium">
                      {analyticsData?.revenue?.nextPayoutDate
                        ? analyticsData.revenue.nextPayoutDate.toLocaleDateString()
                        : 'TBD'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.revenue?.revenueGrowth
                    ?.slice(0, 3)
                    .map((growth, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{growth.period}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(growth.revenue)}
                          </span>
                          {growth.growth !== 0 && (
                            <Badge
                              variant={
                                growth.growth > 0 ? 'default' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {growth.growth > 0 ? '+' : ''}
                              {growth.growth.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) || (
                    <div className="text-center text-muted-foreground py-4">
                      No growth data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Overview</CardTitle>
              <CardDescription>
                Your follower and audience analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData?.audience
                      ? formatNumber(analyticsData.audience.totalFollowers)
                      : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Followers
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData?.audience?.engagementMetrics
                      ? (
                          analyticsData.audience.engagementMetrics
                            .averageEngagementRate * 100
                        ).toFixed(1)
                      : '0'}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Engagement Rate
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData?.performance
                      ? formatNumber(analyticsData.performance.profileViews)
                      : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Profile Views
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Track your content and product performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">View Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Product Views</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.performance
                          ? formatNumber(analyticsData.performance.productViews)
                          : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Profile Views</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.performance
                          ? formatNumber(analyticsData.performance.profileViews)
                          : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Click-through Rate</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.performance
                          ? (
                              analyticsData.performance.clickThroughRate * 100
                            ).toFixed(1)
                          : '0'}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bounce Rate</span>
                      <span className="text-sm font-medium">
                        {analyticsData?.performance
                          ? (
                              analyticsData.performance.bounceRate * 100
                            ).toFixed(1)
                          : '0'}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
