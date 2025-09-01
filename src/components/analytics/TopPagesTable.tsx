'use client';

import { PageInsight } from '@/types/analytics';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

interface TopPagesTableProps {
  pages: PageInsight[];
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  // Sample data if no pages provided
  const samplePages: PageInsight[] = [
    {
      path: '/',
      views: 15420,
      uniqueViews: 12340,
      averageDuration: 180,
      bounceRate: 0.35,
      exitRate: 0.42,
    },
    {
      path: '/marketplace',
      views: 8750,
      uniqueViews: 7200,
      averageDuration: 240,
      bounceRate: 0.28,
      exitRate: 0.38,
    },
    {
      path: '/creator',
      views: 6890,
      uniqueViews: 5640,
      averageDuration: 320,
      bounceRate: 0.22,
      exitRate: 0.31,
    },
    {
      path: '/products/ai-templates',
      views: 5420,
      uniqueViews: 4680,
      averageDuration: 280,
      bounceRate: 0.31,
      exitRate: 0.45,
    },
    {
      path: '/pricing',
      views: 4320,
      uniqueViews: 3890,
      averageDuration: 150,
      bounceRate: 0.48,
      exitRate: 0.52,
    },
  ];

  const displayPages = pages.length > 0 ? pages : samplePages;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBounceRateColor = (rate: number) => {
    if (rate < 0.3) return 'text-green-600';
    if (rate < 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBounceRateBadge = (rate: number) => {
    if (rate < 0.3) return 'default';
    if (rate < 0.5) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Unique Views</TableHead>
              <TableHead className="text-right">Avg Duration</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead className="text-right">Exit Rate</TableHead>
              <TableHead className="w-[100px]">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPages.map((page, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="truncate max-w-[250px]" title={page.path}>
                      {page.path}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="font-medium">
                    {page.views.toLocaleString()}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="font-medium">
                    {page.uniqueViews.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((page.uniqueViews / page.views) * 100).toFixed(1)}% unique
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="font-medium">
                    {formatDuration(page.averageDuration)}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Badge
                    variant={getBounceRateBadge(page.bounceRate)}
                    className="text-xs"
                  >
                    {(page.bounceRate * 100).toFixed(1)}%
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div
                    className={`font-medium ${getBounceRateColor(page.exitRate)}`}
                  >
                    {(page.exitRate * 100).toFixed(1)}%
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    {page.bounceRate < 0.3 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : page.bounceRate > 0.5 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <Progress
                      value={Math.max(0, 100 - page.bounceRate * 100)}
                      className="w-12 h-2"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {displayPages
              .reduce((sum, page) => sum + page.views, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Page Views</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {displayPages
              .reduce((sum, page) => sum + page.uniqueViews, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Unique Page Views</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(
              displayPages.reduce(
                (sum, page) => sum + page.averageDuration,
                0
              ) / displayPages.length
            )}
          </div>
          <div className="text-sm text-muted-foreground">Avg Time on Page</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {(
              (displayPages.reduce((sum, page) => sum + page.bounceRate, 0) /
                displayPages.length) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-muted-foreground">Avg Bounce Rate</div>
        </div>
      </div>
    </div>
  );
}
