'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  loading?: boolean;
}

export function TrendingInsights({
  insights,
  loading = false,
}: TrendingInsightsProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-6">Trending Insights</h3>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No trending insights available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for market trends and opportunities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Trending Insights
        </h3>
        <Link href="/trends">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const TrendIcon =
            insight.trend === 'up'
              ? TrendingUp
              : insight.trend === 'down'
                ? TrendingDown
                : Minus;

          const trendColor =
            insight.trend === 'up'
              ? 'text-green-600 dark:text-green-400'
              : insight.trend === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400';

          const confidenceColor =
            insight.confidence === 'high'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : insight.confidence === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border rounded-lg hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.timeframe}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      insight.trend === 'up'
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : insight.trend === 'down'
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-gray-100 dark:bg-gray-900/20'
                    }`}
                  >
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {insight.percentage > 0 ? '+' : ''}
                      {insight.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {insight.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {insight.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {insight.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{insight.tags.length - 3} more
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${confidenceColor}`}
                >
                  {insight.confidence} confidence
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
