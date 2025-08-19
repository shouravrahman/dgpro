'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth, useRequireAuth } from '@/lib/auth/context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TrendingInsights } from '@/components/dashboard/trending-insights';
import {
  Plus,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Eye,
  Activity,
  Star,
  Zap,
  Brain,
} from 'lucide-react';

// Mock data - replace with real data from your database
const stats = [
  {
    title: 'Products Created',
    value: '12',
    change: '+2 this month',
    trend: 'up',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Total Earnings',
    value: '$2,847',
    change: '+12% from last month',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Active Listings',
    value: '8',
    change: '2 pending review',
    trend: 'neutral',
    icon: Activity,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Total Views',
    value: '1,429',
    change: '+5% this week',
    trend: 'up',
    icon: Eye,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
];

const quickActions = [
  {
    title: 'Create New Product',
    description: 'Start building your next digital product with AI assistance',
    icon: Plus,
    href: '/creator',
    color: 'blue',
    primary: true,
    badge: 'Popular',
  },
  {
    title: 'Explore Market Trends',
    description: 'Discover trending products and market opportunities',
    icon: TrendingUp,
    href: '/trends',
    color: 'green',
  },
  {
    title: 'AI Product Analyzer',
    description: 'Get AI insights on your product performance and optimization',
    icon: Brain,
    href: '/analyzer',
    color: 'purple',
    badge: 'New',
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'product_created' as const,
    title: 'Created "Social Media Templates Pack"',
    description: 'New product added to your portfolio',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: Plus,
    color: 'green',
    href: '/products/social-media-templates',
    metadata: {
      productName: 'Social Media Templates',
      category: 'Design',
    },
  },
  {
    id: '2',
    type: 'market_research' as const,
    title: 'Market analysis completed',
    description: 'AI found 3 trending opportunities in your niche',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    icon: TrendingUp,
    color: 'blue',
    href: '/trends',
    metadata: {
      category: 'UI/UX Design',
    },
  },
  {
    id: '3',
    type: 'collaboration' as const,
    title: 'New collaboration request',
    description: 'Designer wants to collaborate on logo pack',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    icon: Star,
    color: 'purple',
    metadata: {
      collaborator: 'Sarah Chen',
      productName: 'Logo Pack Pro',
    },
  },
  {
    id: '4',
    type: 'trend_analyzed' as const,
    title: 'Trend analysis updated',
    description: 'Website templates showing 127% growth this week',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: Eye,
    color: 'orange',
    href: '/trends/website-templates',
    metadata: {
      category: 'Web Templates',
    },
  },
];

const trendingInsights = [
  {
    id: '1',
    title: 'AI-Generated Content Tools',
    category: 'Software',
    trend: 'up' as const,
    percentage: 127,
    description:
      'Demand for AI content creation tools has surged, with particular interest in writing assistants and image generators.',
    timeframe: 'Last 30 days',
    confidence: 'high' as const,
    tags: ['AI', 'Content Creation', 'Writing', 'Design'],
  },
  {
    id: '2',
    title: 'Mobile App UI Kits',
    category: 'Design',
    trend: 'up' as const,
    percentage: 89,
    description:
      'Mobile-first design resources are in high demand as businesses prioritize mobile experiences.',
    timeframe: 'Last 14 days',
    confidence: 'high' as const,
    tags: ['Mobile', 'UI/UX', 'App Design', 'Templates'],
  },
  {
    id: '3',
    title: 'Notion Templates',
    category: 'Productivity',
    trend: 'stable' as const,
    percentage: 12,
    description:
      'Productivity templates maintain steady demand with focus on business and personal organization.',
    timeframe: 'Last 7 days',
    confidence: 'medium' as const,
    tags: ['Productivity', 'Organization', 'Business', 'Templates'],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading } = useRequireAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Creator';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's what's happening with your products."
      actions={
        <Button asChild>
          <Link href="/creator">
            <Plus className="w-4 h-4 mr-2" />
            Create Product
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {firstName}! 👋
              </h2>
              <p className="text-muted-foreground">
                Ready to create amazing digital products? Let&apos;s make today
                productive.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />

          {/* Trending Insights */}
          <TrendingInsights insights={trendingInsights} />
        </div>
      </div>
    </DashboardLayout>
  );
}
