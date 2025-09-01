'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingInsight {
  id: string;
  title: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
  timeframe: string;
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
}

interface TrendingInsightsProps {
  insights: TrendingInsight[];
}

export function TrendingInsights({ insights }: TrendingInsightsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'stable':
        return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-white dark:bg-gray-800 rounded-lg border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Trending Insights</h3>
        <Link href="/trends" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const TrendIcon = getTrendIcon(insight.trend);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendIcon
                    className={cn('w-4 h-4', getTrendColor(insight.trend))}
                  />
                  <span
                    className={cn('font-medium', getTrendColor(insight.trend))}
                  >
                    {insight.percentage > 0 ? '+' : ''}
                    {insight.percentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{insight.timeframe}</span>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full',
                      insight.confidence === 'high' &&
                        'bg-green-100 text-green-700 dark:bg-green-900/20',
                      insight.confidence === 'medium' &&
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20',
                      insight.confidence === 'low' &&
                        'bg-red-100 text-red-700 dark:bg-red-900/20'
                    )}
                  >
                    {insight.confidence} confidence
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {insight.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-background border rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {insight.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-background border rounded-full">
                    +{insight.tags.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
