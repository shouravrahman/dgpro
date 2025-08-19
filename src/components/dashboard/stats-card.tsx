'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  loading?: boolean;
  index?: number;
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color,
  bgColor,
  loading = false,
  index = 0,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <Skeleton className="w-4 h-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-xl p-6 border hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center group-hover:shadow-lg transition-shadow`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </motion.div>
        {getTrendIcon()}
      </div>

      <div className="space-y-1">
        <motion.p
          className="text-2xl font-bold"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {change && (
          <p className={`text-xs font-medium ${getTrendColor()}`}>{change}</p>
        )}
      </div>
    </motion.div>
  );
}
