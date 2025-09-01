'use client';

import { ConversionAnalytics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

interface ConversionFunnelProps {
  data: ConversionAnalytics;
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  // Sample funnel data if not available
  const sampleFunnelData = [
    { name: 'Visitors', users: 10000, conversionRate: 100, dropoffRate: 0 },
    { name: 'Product Views', users: 7500, conversionRate: 75, dropoffRate: 25 },
    { name: 'Add to Cart', users: 3000, conversionRate: 30, dropoffRate: 60 },
    {
      name: 'Checkout Started',
      users: 1800,
      conversionRate: 18,
      dropoffRate: 40,
    },
    { name: 'Payment Info', users: 1200, conversionRate: 12, dropoffRate: 33 },
    {
      name: 'Purchase Complete',
      users: 900,
      conversionRate: 9,
      dropoffRate: 25,
    },
  ];

  const funnelData =
    data.funnelData.length > 0 ? data.funnelData : sampleFunnelData;

  // Sample conversion sources if not available
  const sampleConversionSources = [
    { source: 'Organic Search', conversions: 450, rate: 12.5, value: 45000 },
    { source: 'Direct Traffic', conversions: 280, rate: 8.2, value: 32000 },
    { source: 'Social Media', conversions: 120, rate: 6.8, value: 15000 },
    { source: 'Email Campaign', conversions: 80, rate: 15.2, value: 12000 },
    { source: 'Paid Ads', conversions: 70, rate: 4.5, value: 8500 },
  ];

  const conversionSources =
    data.conversionsBySource.length > 0
      ? data.conversionsBySource
      : sampleConversionSources;

  // Sample goals if not available
  const sampleGoals = [
    {
      goalName: 'Newsletter Signup',
      completions: 1200,
      value: 12000,
      conversionRate: 12,
    },
    {
      goalName: 'Product Purchase',
      completions: 900,
      value: 90000,
      conversionRate: 9,
    },
    {
      goalName: 'Account Creation',
      completions: 1500,
      value: 15000,
      conversionRate: 15,
    },
    {
      goalName: 'Download Resource',
      completions: 800,
      value: 8000,
      conversionRate: 8,
    },
  ];

  const goals =
    data.goalCompletions.length > 0 ? data.goalCompletions : sampleGoals;

  const maxUsers = Math.max(...funnelData.map((step) => step.users));

  return (
    <div className="space-y-6">
      {/* Conversion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {funnelData[0]?.users.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Visitors
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {funnelData[funnelData.length - 1]?.users.toLocaleString() ||
                    '0'}
                </div>
                <div className="text-sm text-muted-foreground">Conversions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {funnelData[funnelData.length - 1]?.conversionRate.toFixed(
                    1
                  ) || '0'}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {(
                    100 -
                    (funnelData[funnelData.length - 1]?.conversionRate || 0)
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  Drop-off Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{step.name}</span>
                    {index > 0 && step.dropoffRate > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{step.dropoffRate.toFixed(1)}% drop-off
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {step.users.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.conversionRate.toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="relative">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transition-all duration-300"
                    style={{
                      width: `${(step.users / maxUsers) * 100}%`,
                      height: '40px',
                      marginLeft: '44px',
                    }}
                  />
                  <div className="absolute inset-y-0 left-11 flex items-center px-4 text-white font-medium">
                    {step.users.toLocaleString()} users
                  </div>
                </div>

                {/* Connection Line */}
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center mt-2 mb-2">
                    <div className="w-px h-4 bg-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversions by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{source.source}</div>
                    <div className="text-sm text-muted-foreground">
                      {source.rate.toFixed(1)}% conversion rate
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {source.conversions.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${source.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.goalName}</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {goal.completions.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {goal.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={goal.conversionRate} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Value: ${goal.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Test Results */}
      {data.abTestResults && data.abTestResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>A/B Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.abTestResults.map((test, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{test.testName}</div>
                    {test.winner && (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Winner
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Variant</div>
                      <div className="font-medium">{test.variant}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Users</div>
                      <div className="font-medium">
                        {test.users.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversion</div>
                      <div className="font-medium">
                        {test.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={test.significance} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {test.significance.toFixed(1)}% statistical significance
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
