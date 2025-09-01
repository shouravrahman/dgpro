'use client';

import { useMemo } from 'react';
import { RevenueAnalytics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
  data: RevenueAnalytics;
  detailed?: boolean;
}

export function RevenueChart({ data, detailed = false }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data.revenueGrowth || data.revenueGrowth.length === 0) {
      // Generate sample data for demonstration
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, index) => ({
        period: month,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        growth: (Math.random() - 0.5) * 20,
      }));
    }
    return data.revenueGrowth;
  }, [data.revenueGrowth]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      {detailed && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${data.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${data.monthlyRecurringRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">MRR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${data.averageOrderValue.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">AOV</div>
          </div>
        </div>
      )}

      <div className="h-64 w-full">
        <div className="flex items-end justify-between h-full space-x-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-gray-200 rounded-t relative"
                style={{ height: '200px' }}
              >
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                  style={{
                    height: `${(item.revenue / maxRevenue) * 100}%`,
                    width: '100%',
                  }}
                  title={`${item.period}: $${item.revenue.toLocaleString()}`}
                />
                {item.growth !== 0 && (
                  <div
                    className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                      item.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.growth > 0 ? '+' : ''}
                    {item.growth.toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-xs text-center mt-2 font-medium">
                {item.period}
              </div>
              <div className="text-xs text-center text-muted-foreground">
                ${(item.revenue / 1000).toFixed(0)}K
              </div>
            </div>
          ))}
        </div>
      </div>

      {detailed && data.revenueBySource && data.revenueBySource.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Revenue Sources</h4>
          <div className="space-y-2">
            {data.revenueBySource.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span className="font-medium capitalize">
                    {source.source}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${source.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {source.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
