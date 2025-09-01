'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentActivityItem {
  id: string;
  type:
    | 'product_created'
    | 'market_research'
    | 'collaboration'
    | 'trend_analyzed';
  title: string;
  description: string;
  timestamp: Date;
  icon: LucideIcon;
  color: string;
  href?: string;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-lg border p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                activity.href ? 'hover:bg-muted/50 cursor-pointer' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  activity.color === 'green' &&
                    'bg-green-100 text-green-600 dark:bg-green-900/20',
                  activity.color === 'blue' &&
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
                  activity.color === 'purple' &&
                    'bg-purple-100 text-purple-600 dark:bg-purple-900/20',
                  activity.color === 'orange' &&
                    'bg-orange-100 text-orange-600 dark:bg-orange-900/20'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          );

          return activity.href ? (
            <Link key={activity.id} href={activity.href}>
              {content}
            </Link>
          ) : (
            <div key={activity.id}>{content}</div>
          );
        })}
      </div>
    </motion.div>
  );
}
