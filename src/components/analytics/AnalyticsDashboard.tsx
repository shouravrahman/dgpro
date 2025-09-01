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
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsFilters } from '@/types/analytics';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
} from 'lucide-react';
import { RevenueChart } from './RevenueChart';
import { UserBehaviorChart } from './UserBehaviorChart';
import { ConversionFunnel } from './ConversionFunnel';
import { TopPagesTable } from './TopPagesTable';
import { RealtimeMetrics } from './RealtimeMetrics';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const {
    dashboardData,
    userInsights,
    loading,
    error,
    loadDashboardData,
    loadUserInsights,
    exportData,
    refresh,
  } = useAnalytics();

  const [filters, setFilters] = useState<AnalyticsFilters>({
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
    loadDashboardData(filters);
    loadUserInsights(filters);
  }, [filters, loadDashboardData, loadUserInsights]);

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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your platform performance
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

      {/* Real-time Metrics */}
      <RealtimeMetrics />

      {/* Key Metrics Cards */}
      {dashboardData?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(dashboardData.overview.totalUsers)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(
                  dashboardData.overview.topMetrics[0]?.trend || 'stable'
                )}
                <span className="ml-1">
                  {dashboardData.overview.growthRate > 0 ? '+' : ''}
                  {(dashboardData.overview.growthRate * 100).toFixed(1)}% from
                  last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.overview.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon('up')}
                <span className="ml-1">Revenue growth</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(dashboardData.overview.totalProducts)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Active products</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData.overview.conversionRate * 100).toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon('stable')}
                <span className="ml-1">Conversion performance</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
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
                {dashboardData?.revenue && (
                  <RevenueChart data={dashboardData.revenue} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userInsights && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">New Users</span>
                      <span className="text-2xl font-bold">
                        {formatNumber(userInsights.newUsers)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Returning Users
                      </span>
                      <span className="text-2xl font-bold">
                        {formatNumber(userInsights.returningUsers)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-2xl font-bold">
                        {formatNumber(userInsights.activeUsers)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>
                Most visited pages in your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.userBehavior && (
                <TopPagesTable pages={dashboardData.userBehavior.topPages} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Detailed revenue breakdown and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.revenue && (
                  <RevenueChart data={dashboardData.revenue} detailed />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.revenue && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">MRR</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(
                            dashboardData.revenue.monthlyRecurringRevenue
                          )}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">AOV</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(
                            dashboardData.revenue.averageOrderValue
                          )}
                        </span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">CLV</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(
                            dashboardData.revenue.customerLifetimeValue
                          )}
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.revenue?.revenueBySource && (
                  <div className="space-y-3">
                    {dashboardData.revenue.revenueBySource.map(
                      (source, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{source.source}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {source.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(source.revenue)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.revenue?.revenueByProduct && (
                  <div className="space-y-3">
                    {dashboardData.revenue.revenueByProduct
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {product.productName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.units} units •{' '}
                              {formatCurrency(product.averagePrice)} avg
                            </div>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(product.revenue)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                {userInsights?.demographics && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Countries</h4>
                      <div className="space-y-2">
                        {userInsights.demographics.countries
                          .slice(0, 5)
                          .map((country, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">{country.country}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {country.users}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({country.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {userInsights?.deviceData && (
                  <div className="space-y-3">
                    {userInsights.deviceData.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {device.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {device.browser} • {device.os}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{device.users}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Analytics</CardTitle>
              <CardDescription>
                How users interact with your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.userBehavior && (
                <UserBehaviorChart data={dashboardData.userBehavior} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                Track user journey and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.conversion && (
                <ConversionFunnel data={dashboardData.conversion} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
