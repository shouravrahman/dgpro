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
import { AnalyticsFilters, AnalyticsDashboardData } from '@/types/analytics';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
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
} from 'lucide-react';
import error from 'next/error';

interface AdminAnalyticsDashboardProps {
  className?: string;
}

export function AdminAnalyticsDashboard({
  className,
}: AdminAnalyticsDashboardProps) {
  const {
    dashboardData,
    loading,
    error,
    loadDashboardData,
    exportData,
    refresh,
  } = useAdminAnalytics();

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

  // Load admin analytics data
  const loadDashboardData = async (filters?: AnalyticsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.dateRange?.start) {
        params.append('start_date', filters.dateRange.start.toISOString());
      }
      if (filters?.dateRange?.end) {
        params.append('end_date', filters.dateRange.end.toISOString());
      }
      if (filters?.userSegment) {
        params.append('user_segment', filters.userSegment);
      }
      if (filters?.source) {
        params.append('source', filters.source);
      }

      const response = await fetch(`/api/admin/analytics/dashboard?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load analytics data');
      }

      setDashboardData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(filters);
  }, [filters]);

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
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportFormat,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
          <Button onClick={() => loadDashboardData(filters)} variant="outline">
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
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive platform-wide analytics and insights
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

          <Button
            onClick={() => loadDashboardData(filters)}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Platform Overview Cards */}
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
                Platform Revenue
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
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
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
                Platform Conversion
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData.overview.conversionRate * 100).toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon('stable')}
                <span className="ml-1">Overall conversion</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Growth</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {dashboardData?.overview
                        ? formatNumber(dashboardData.overview.totalUsers)
                        : '0'}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="text-2xl font-bold text-green-600">
                      {dashboardData?.overview
                        ? formatCurrency(dashboardData.overview.totalRevenue)
                        : '$0'}
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.overview?.topMetrics?.map((metric, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatNumber(metric.value)}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {dashboardData?.overview
                        ? formatNumber(dashboardData.overview.totalUsers)
                        : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Users
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <Badge variant="default">High</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Signups</span>
                    <Badge variant="secondary">Growing</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Rate</span>
                    <Badge variant="default">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Creators</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Buyers</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Affiliates</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-2xl font-bold">
                      {dashboardData?.revenue
                        ? formatCurrency(dashboardData.revenue.totalRevenue)
                        : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">MRR</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.revenue
                        ? formatCurrency(
                            dashboardData.revenue.monthlyRecurringRevenue
                          )
                        : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AOV</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.revenue
                        ? formatCurrency(
                            dashboardData.revenue.averageOrderValue
                          )
                        : '$0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.revenue?.revenueBySource
                    ?.slice(0, 5)
                    .map((source, index) => (
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
                    )) || (
                    <div className="text-center text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Platform-wide product analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.overview
                      ? formatNumber(dashboardData.overview.totalProducts)
                      : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Products
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.revenue?.revenueByProduct?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Revenue Generating
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(
                      (dashboardData?.overview?.conversionRate || 0) * 100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Conversion
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                System performance and reliability metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Response Times</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">API Response</span>
                      <span className="text-sm font-medium">120ms</span>
                    </div>
                    <Progress value={85} className="h-2" />

                    <div className="flex justify-between">
                      <span className="text-sm">Page Load</span>
                      <span className="text-sm font-medium">1.2s</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <Badge variant="default">99.9%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="secondary">0.1%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <Badge variant="default">1,234</Badge>
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
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    },
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  useEffect(() => {
    loadDashboardData(filters);
  }, [filters, loadDashboardData]);

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      setFilters(prev => ({
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
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive platform-wide analytics and insights
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
          
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
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

      {/* Platform Overview Cards */}
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
                {getTrendIcon(dashboardData.overview.topMetrics[0]?.trend || 'stable')}
                <span className="ml-1">
                  {dashboardData.overview.growthRate > 0 ? '+' : ''}
                  {(dashboardData.overview.growthRate * 100).toFixed(1)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
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
              <CardTitle className="text-sm font-medium">Platform Conversion</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData.overview.conversionRate * 100).toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon('stable')}
                <span className="ml-1">Overall conversion</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Growth</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {dashboardData?.overview ? formatNumber(dashboardData.overview.totalUsers) : '0'}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="text-2xl font-bold text-green-600">
                      {dashboardData?.overview ? formatCurrency(dashboardData.overview.totalRevenue) : '$0'}
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.overview?.topMetrics?.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{formatNumber(metric.value)}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {dashboardData?.overview ? formatNumber(dashboardData.overview.totalUsers) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <Badge variant="default">High</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Signups</span>
                    <Badge variant="secondary">Growing</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Rate</span>
                    <Badge variant="default">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Creators</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Buyers</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Affiliates</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-2xl font-bold">
                      {dashboardData?.revenue ? formatCurrency(dashboardData.revenue.totalRevenue) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">MRR</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.revenue ? formatCurrency(dashboardData.revenue.monthlyRecurringRevenue) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AOV</span>
                    <span className="text-lg font-bold">
                      {dashboardData?.revenue ? formatCurrency(dashboardData.revenue.averageOrderValue) : '$0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.revenue?.revenueBySource?.slice(0, 5).map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{source.source}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {source.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(source.revenue)}</span>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Platform-wide product analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.overview ? formatNumber(dashboardData.overview.totalProducts) : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.revenue?.revenueByProduct?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue Generating</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {((dashboardData?.overview?.conversionRate || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>System performance and reliability metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Response Times</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">API Response</span>
                      <span className="text-sm font-medium">120ms</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Page Load</span>
                      <span className="text-sm font-medium">1.2s</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <Badge variant="default">99.9%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="secondary">0.1%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <Badge variant="default">1,234</Badge>
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