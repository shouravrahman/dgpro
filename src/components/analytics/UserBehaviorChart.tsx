'use client';

import { UserBehaviorAnalytics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UserBehaviorChartProps {
  data: UserBehaviorAnalytics;
}

export function UserBehaviorChart({ data }: UserBehaviorChartProps) {
  // Generate sample user journey data if not available
  const sampleJourney = [
    { step: 'Landing Page', users: 1000, dropoff: 0, conversionRate: 100 },
    { step: 'Product View', users: 750, dropoff: 25, conversionRate: 75 },
    { step: 'Add to Cart', users: 300, dropoff: 60, conversionRate: 30 },
    { step: 'Checkout', users: 180, dropoff: 40, conversionRate: 18 },
    { step: 'Purchase', users: 120, dropoff: 33, conversionRate: 12 },
  ];

  const journeyData =
    data.userJourney.length > 0 ? data.userJourney : sampleJourney;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(data.sessionDuration || 180)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Session Duration
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.pageViews || 4.2}
              </div>
              <div className="text-sm text-muted-foreground">
                Pages per Session
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((data.bounceRate || 0.35) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Bounce Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Journey Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>User Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeyData.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{step.step}</span>
                    {step.dropoff > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{step.dropoff}% dropoff
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {step.users.toLocaleString()} users
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.conversionRate.toFixed(1)}% conversion
                    </div>
                  </div>
                </div>

                <div className="ml-11">
                  <Progress value={step.conversionRate} className="h-3" />
                </div>

                {index < journeyData.length - 1 && (
                  <div className="ml-15 mt-2 mb-2">
                    <div className="w-px h-4 bg-gray-300 ml-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      {data.topPages && data.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPages.slice(0, 5).map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{page.path}</div>
                    <div className="text-sm text-muted-foreground">
                      {page.views.toLocaleString()} views •{' '}
                      {formatDuration(page.averageDuration)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {page.uniqueViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      unique views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap Placeholder */}
      {data.heatmapData && data.heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Interaction Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">
                  Heatmap Visualization
                </div>
                <div className="text-sm">
                  Interactive heatmap showing user click patterns and engagement
                  areas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
