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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Calendar,
  Target,
} from 'lucide-react';
import { useAffiliateStats } from '@/hooks/useAffiliate';

export function AffiliateStats() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
    'month'
  );

  const { data, isLoading, error } = useAffiliateStats({ period });

  // Mock data for charts (in real implementation, this would come from the API)
  const performanceData = [
    { name: 'Jan', earnings: 120, referrals: 8, clicks: 45 },
    { name: 'Feb', earnings: 190, referrals: 12, clicks: 67 },
    { name: 'Mar', earnings: 280, referrals: 18, clicks: 89 },
    { name: 'Apr', earnings: 220, referrals: 14, clicks: 72 },
    { name: 'May', earnings: 350, referrals: 22, clicks: 98 },
    { name: 'Jun', earnings: 420, referrals: 28, clicks: 112 },
  ];

  const conversionData = [
    { name: 'Converted', value: 28, color: '#10b981' },
    { name: 'Not Converted', value: 72, color: '#e5e7eb' },
  ];

  const topProductsData = [
    { name: 'Digital Course A', earnings: 450, referrals: 15 },
    { name: 'E-book Bundle', earnings: 320, referrals: 12 },
    { name: 'Software Tool', earnings: 280, referrals: 8 },
    { name: 'Template Pack', earnings: 190, referrals: 6 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load analytics</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics & Performance
          </h2>
          <p className="text-gray-600">
            Detailed insights into your affiliate performance
          </p>
        </div>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
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
                Avg. Commission
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {stats.totalReferrals > 0
                  ? (stats.totalEarnings / stats.totalReferrals).toFixed(2)
                  : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Per referral</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>
              Track your earnings performance over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`$${value}`, 'Earnings']}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referrals and Clicks */}
        <Card>
          <CardHeader>
            <CardTitle>Referrals & Clicks</CardTitle>
            <CardDescription>
              Compare your referrals and click performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="referrals" fill="#3b82f6" name="Referrals" />
                <Bar dataKey="clicks" fill="#e5e7eb" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Breakdown</CardTitle>
            <CardDescription>
              Visual representation of your click-to-conversion ratio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Converted (28%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm">Not Converted (72%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>
              Your best converting products by earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsData.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.referrals} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.earnings}</p>
                    <p className="text-sm text-gray-600">
                      ${(product.earnings / product.referrals).toFixed(0)}/ref
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            AI-powered insights to help improve your affiliate performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">
                What's Working Well
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Your conversion rate is 15% above average</li>
                <li>• Digital courses are your top performing category</li>
                <li>• Social media referrals have highest conversion</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">Opportunities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Try promoting software tools for higher commissions</li>
                <li>• Email campaigns could increase your reach</li>
                <li>• Consider creating product review content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
