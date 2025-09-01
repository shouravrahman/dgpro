'use client';

import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Filter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { useCreatorAnalytics } from '@/hooks/useCreatorAnalytics';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export function EarningsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [period, setPeriod] = useState('30d');

  const { earnings, payouts, isLoading } = useCreatorAnalytics({
    dateRange,
    period,
  });

  const handleExportEarnings = () => {
    // Export earnings data as CSV
    const csvData = earnings?.transactions?.map((transaction) => ({
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      product: transaction.productTitle,
      amount: transaction.amount,
      fee: transaction.fee,
      net: transaction.netAmount,
      status: transaction.status,
    }));

    if (csvData) {
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map((row) => Object.values(row).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Earnings Dashboard</h2>
          <p className="text-muted-foreground">
            Track your revenue and payouts
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" onClick={handleExportEarnings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (earnings?.total || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +${(earnings?.growth || 0).toFixed(2)} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (earnings?.available || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (earnings?.pending || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid Out
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? '...' : (payouts?.total || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payouts?.count || 0} payouts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>
            Your earnings trend for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={earnings?.chartData || []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Earning Products</CardTitle>
            <CardDescription>
              Your best performing products this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : earnings?.topProducts?.length ? (
              earnings.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(
                        (product.revenue / (earnings?.total || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No sales data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest earnings and payouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between animate-pulse"
                >
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))
            ) : earnings?.transactions?.length ? (
              earnings.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium truncate">
                      {transaction.productTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      +${transaction.netAmount.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Next Payout</CardTitle>
          <CardDescription>
            Track your progress toward the minimum payout threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Available Balance</span>
            <span>${(earnings?.available || 0).toFixed(2)} / $50.00</span>
          </div>
          <Progress
            value={Math.min(((earnings?.available || 0) / 50) * 100, 100)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            {earnings?.available && earnings.available >= 50
              ? 'You can request a payout now!'
              : `$${(50 - (earnings?.available || 0)).toFixed(2)} more needed for payout`}
          </p>
          {earnings?.available && earnings.available >= 50 && (
            <Button className="w-full">Request Payout</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
