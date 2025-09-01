'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  DollarSign,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics, useSystemHealth } from '@/hooks/useAdmin';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({
  title,
  value,
  change,
  icon,
  description,
  trend = 'neutral',
}: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-4 w-4 text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className={`text-xs ${trendColor} flex items-center gap-1`}>
            <span>{trendIcon}</span>
            <span>{Math.abs(change)}%</span>
            {description && (
              <span className="text-muted-foreground">from last month</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SystemHealthCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
}

function SystemHealthCard({
  title,
  value,
  unit,
  status,
  icon,
}: SystemHealthCardProps) {
  const statusColor = {
    normal: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  }[status];

  const statusBg = {
    normal: 'bg-green-100',
    warning: 'bg-yellow-100',
    critical: 'bg-red-100',
  }[status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {value}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          </div>
          <Badge className={`${statusBg} ${statusColor} border-0`}>
            {status}
          </Badge>
        </div>
        <Progress
          value={value}
          className="mt-2"
          // @ts-ignore
          indicatorClassName={
            status === 'critical'
              ? 'bg-red-500'
              : status === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }
        />
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { health, loading: healthLoading } = useSystemHealth();

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            Unable to load dashboard metrics
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your platform's performance and operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            System Operational
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={metrics.users.total.toLocaleString()}
          change={metrics.users.growth_rate}
          trend={metrics.users.growth_rate > 0 ? 'up' : 'down'}
          icon={<Users className="h-4 w-4" />}
          description="from last month"
        />
        <MetricCard
          title="Active Products"
          value={metrics.products.published.toLocaleString()}
          change={metrics.products.growth_rate}
          trend={metrics.products.growth_rate > 0 ? 'up' : 'down'}
          icon={<Package className="h-4 w-4" />}
          description="from last month"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(metrics.sales.revenue / 1000).toFixed(1)}k`}
          change={metrics.sales.growth_rate}
          trend={metrics.sales.growth_rate > 0 ? 'up' : 'down'}
          icon={<DollarSign className="h-4 w-4" />}
          description="from last month"
        />
        <MetricCard
          title="AI Operations"
          value={metrics.ai_usage.total_operations.toLocaleString()}
          change={15.2}
          trend="up"
          icon={<Activity className="h-4 w-4" />}
          description="from last month"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Users Today
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.new_today}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.users.active} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.products.pending_review}
            </div>
            <p className="text-xs text-muted-foreground">
              Products awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sales.today}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.sales.total} total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Success Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.ai_usage.success_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.ai_usage.avg_response_time}s avg response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SystemHealthCard
            title="CPU Usage"
            value={metrics.system.cpu_usage}
            unit="%"
            status={
              metrics.system.cpu_usage > 80
                ? 'critical'
                : metrics.system.cpu_usage > 60
                  ? 'warning'
                  : 'normal'
            }
            icon={<Cpu className="h-4 w-4" />}
          />
          <SystemHealthCard
            title="Memory Usage"
            value={metrics.system.memory_usage}
            unit="%"
            status={
              metrics.system.memory_usage > 85
                ? 'critical'
                : metrics.system.memory_usage > 70
                  ? 'warning'
                  : 'normal'
            }
            icon={<Server className="h-4 w-4" />}
          />
          <SystemHealthCard
            title="Disk Usage"
            value={metrics.system.disk_usage}
            unit="%"
            status={
              metrics.system.disk_usage > 90
                ? 'critical'
                : metrics.system.disk_usage > 75
                  ? 'warning'
                  : 'normal'
            }
            icon={<HardDrive className="h-4 w-4" />}
          />
          <SystemHealthCard
            title="Uptime"
            value={metrics.system.uptime}
            unit="%"
            status={metrics.system.uptime < 99 ? 'warning' : 'normal'}
            icon={<Database className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Recent System Health Metrics */}
      {!healthLoading && health.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent System Metrics</CardTitle>
            <CardDescription>
              Latest system performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.slice(0, 5).map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        metric.status === 'normal'
                          ? 'default'
                          : metric.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {metric.status}
                    </Badge>
                    <span className="font-medium">{metric.metric_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {metric.metric_value} {metric.metric_unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(metric.recorded_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
