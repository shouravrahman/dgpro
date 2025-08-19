'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { LucideIcon, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type:
    | 'product_created'
    | 'trend_analyzed'
    | 'market_research'
    | 'collaboration';
  title: string;
  description: string;
  timestamp: Date;
  icon: LucideIcon;
  color: string;
  href?: string;
  metadata?: {
    productName?: string;
    collaborator?: string;
    category?: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
  showViewAll?: boolean;
}

export function RecentActivity({
  activities,
  loading = false,
  showViewAll = true,
}: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start creating products to see your activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        {showViewAll && (
          <Link
            href="/dashboard/activity"
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            View all
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const timeAgo = formatDistanceToNow(activity.timestamp, {
            addSuffix: true,
          });

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              {activity.href ? (
                <Link
                  href={activity.href}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <ActivityContent
                    activity={activity}
                    Icon={Icon}
                    timeAgo={timeAgo}
                  />
                </Link>
              ) : (
                <div className="flex items-start gap-4 p-3">
                  <ActivityContent
                    activity={activity}
                    Icon={Icon}
                    timeAgo={timeAgo}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityContent({
  activity,
  Icon,
  timeAgo,
}: {
  activity: ActivityItem;
  Icon: LucideIcon;
  timeAgo: string;
}) {
  return (
    <>
      <div
        className={`w-10 h-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon
          className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {activity.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {activity.description}
            </p>

            {activity.metadata && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activity.metadata.productName && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    {activity.metadata.productName}
                  </span>
                )}
                {activity.metadata.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    {activity.metadata.category}
                  </span>
                )}
                {activity.metadata.collaborator && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                    with {activity.metadata.collaborator}
                  </span>
                )}
              </div>
            )}
          </div>

          <time className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </time>
        </div>
      </div>
    </>
  );
}
