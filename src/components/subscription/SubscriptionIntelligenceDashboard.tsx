'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  Clock,
  Star,
} from 'lucide-react';
import {
  useComprehensiveIntelligence,
  useIntelligenceInsights,
} from '@/hooks/useSubscriptionIntelligence';
import { cn } from '@/lib/utils';

export function SubscriptionIntelligenceDashboard() {
  const { data, isLoading, error } = useComprehensiveIntelligence();
  const { insights } = useIntelligenceInsights();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load subscription intelligence. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Intelligence
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights to optimize your subscription and usage
          </p>
        </div>
        <Badge
          variant={
            insights.healthScore > 80
              ? 'default'
              : insights.healthScore > 60
                ? 'secondary'
                : 'destructive'
          }
        >
          Health Score: {insights.healthScore}%
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Health Score"
          value={`${insights.healthScore}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={
            insights.healthScore > 80
              ? 'up'
              : insights.healthScore > 60
                ? 'stable'
                : 'down'
          }
          description="Overall subscription health"
        />
        <MetricCard
          title="Potential Savings"
          value={`$${insights.potentialSavings}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
          description="Monthly savings opportunity"
        />
        <MetricCard
          title="Usage Efficiency"
          value={`${insights.usageEfficiency}%`}
          icon={<Zap className="h-4 w-4" />}
          trend={insights.usageEfficiency > 70 ? 'up' : 'down'}
          description="How well you use your plan"
        />
        <MetricCard
          title="Active Offers"
          value={insights.activeOffers.toString()}
          icon={<Star className="h-4 w-4" />}
          trend="stable"
          description="Personalized offers available"
        />
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="churn-risk">Churn Risk</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab data={data} insights={insights} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsTab
            recommendations={data.recommendations?.recommendations || []}
          />
        </TabsContent>

        <TabsContent value="churn-risk" className="space-y-4">
          <ChurnRiskTab churnRisk={data.churnRisk} />
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <OffersTab offers={data.offers || []} />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <OptimizationTab optimization={data.optimization} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  description,
}: MetricCardProps) {
  const trendIcon =
    trend === 'up' ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : trend === 'down' ? (
      <TrendingDown className="h-3 w-3 text-red-500" />
    ) : (
      <div className="h-3 w-3 rounded-full bg-gray-400" />
    );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {trendIcon}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ data, insights }: { data: any; insights: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Patterns
          </CardTitle>
          <CardDescription>
            Your current usage across all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.intelligence?.usagePatterns && (
            <>
              <UsageMetric
                label="AI Requests"
                current={data.intelligence.usagePatterns.aiRequests.current}
                limit={data.intelligence.usagePatterns.aiRequests.limit}
                percentage={
                  data.intelligence.usagePatterns.aiRequests.percentage
                }
              />
              <UsageMetric
                label="Products"
                current={data.intelligence.usagePatterns.products.current}
                limit={data.intelligence.usagePatterns.products.limit}
                percentage={data.intelligence.usagePatterns.products.percentage}
              />
              <UsageMetric
                label="Marketplace Listings"
                current={
                  data.intelligence.usagePatterns.marketplaceListings.current
                }
                limit={
                  data.intelligence.usagePatterns.marketplaceListings.limit
                }
                percentage={
                  data.intelligence.usagePatterns.marketplaceListings.percentage
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Recommended actions based on your usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.highPriorityRecommendations > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High Priority</AlertTitle>
              <AlertDescription>
                You have {insights.highPriorityRecommendations} high-priority
                recommendations
              </AlertDescription>
            </Alert>
          )}

          {insights.potentialSavings > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Potential Savings</p>
                <p className="text-sm text-muted-foreground">
                  Save ${insights.potentialSavings}/month
                </p>
              </div>
              <Button size="sm">View Details</Button>
            </div>
          )}

          {insights.activeOffers > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Special Offers</p>
                <p className="text-sm text-muted-foreground">
                  {insights.activeOffers} personalized offers
                </p>
              </div>
              <Button size="sm" variant="outline">
                View Offers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageMetric({
  label,
  current,
  limit,
  percentage,
}: {
  label: string;
  current: number;
  limit: number;
  percentage: number;
}) {
  const isUnlimited = limit === -1;
  const color =
    percentage > 80
      ? 'bg-red-500'
      : percentage > 60
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current} {isUnlimited ? '' : `/ ${limit}`}
        </span>
      </div>
      {!isUnlimited && <Progress value={percentage} className="h-2" />}
      {isUnlimited && (
        <div className="text-xs text-green-600 font-medium">Unlimited</div>
      )}
    </div>
  );
}

function RecommendationsTab({ recommendations }: { recommendations: any[] }) {
  return (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Good!</h3>
            <p className="text-muted-foreground">
              Your subscription is optimally configured. No recommendations at
              this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const urgencyColor =
    recommendation.urgency === 'high'
      ? 'destructive'
      : recommendation.urgency === 'medium'
        ? 'secondary'
        : 'outline';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">
            {recommendation.type} Recommendation
          </CardTitle>
          <Badge variant={urgencyColor}>
            {recommendation.urgency} priority
          </Badge>
        </div>
        <CardDescription>
          Confidence: {recommendation.confidence}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {recommendation.reasoning.map((reason: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm">{reason}</p>
            </div>
          ))}
        </div>

        {(recommendation.potentialSavings || recommendation.potentialValue) && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            {recommendation.potentialSavings && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Potential Savings
                </p>
                <p className="font-semibold text-green-600">
                  ${recommendation.potentialSavings}/month
                </p>
              </div>
            )}
            {recommendation.potentialValue && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Potential Value</p>
                <p className="font-semibold text-blue-600">
                  ${recommendation.potentialValue}/month
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm">Apply Recommendation</Button>
          <Button size="sm" variant="outline">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChurnRiskTab({ churnRisk }: { churnRisk: any }) {
  if (!churnRisk) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No churn risk data available</p>
        </CardContent>
      </Card>
    );
  }

  const riskColor =
    churnRisk.riskLevel === 'critical'
      ? 'destructive'
      : churnRisk.riskLevel === 'high'
        ? 'secondary'
        : churnRisk.riskLevel === 'medium'
          ? 'outline'
          : 'default';

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Churn Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{churnRisk.score}%</p>
              <p className="text-sm text-muted-foreground">Risk Score</p>
            </div>
            <Badge variant={riskColor} className="capitalize">
              {churnRisk.riskLevel} Risk
            </Badge>
          </div>

          <Progress value={churnRisk.score} className="h-3" />

          {churnRisk.timeToChurn && (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Urgent Action Required</AlertTitle>
              <AlertDescription>
                Estimated time to churn: {churnRisk.timeToChurn} days
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>Factors contributing to churn risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {churnRisk.factors.map((factor: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium capitalize">
                  {factor.factor.replace('_', ' ')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {factor.description}
                </p>
              </div>
              <Badge
                variant={
                  factor.impact === 'negative' ? 'destructive' : 'default'
                }
              >
                {factor.impact}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Retention Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Actions</CardTitle>
          <CardDescription>
            Recommended actions to reduce churn risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {churnRisk.retentionActions.map((action: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{action.title}</h4>
                <Badge variant="outline">{action.priority} priority</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Impact: {action.estimatedImpact}% risk reduction
                </span>
                {action.cost && (
                  <span className="text-sm">Cost: ${action.cost}</span>
                )}
              </div>
              <Button size="sm" className="w-full">
                Apply Action
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function OffersTab({ offers }: { offers: any[] }) {
  return (
    <div className="space-y-4">
      {offers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Offers Available</h3>
            <p className="text-muted-foreground">
              Check back later for personalized offers based on your usage
              patterns.
            </p>
          </CardContent>
        </Card>
      ) : (
        offers.map((offer, index) => (
          <OfferCard key={offer.id || index} offer={offer} />
        ))
      )}
    </div>
  );
}

function OfferCard({ offer }: { offer: any }) {
  const priorityColor =
    offer.priority === 'high'
      ? 'destructive'
      : offer.priority === 'medium'
        ? 'secondary'
        : 'outline';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{offer.title}</CardTitle>
          <Badge variant={priorityColor}>{offer.priority} priority</Badge>
        </div>
        <CardDescription>{offer.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Offer Value</p>
            <p className="text-2xl font-bold">${offer.value}</p>
          </div>
          {offer.discountPercentage && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Discount</p>
              <p className="text-xl font-semibold text-green-600">
                {offer.discountPercentage}% OFF
              </p>
            </div>
          )}
        </div>

        {offer.conditions && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Conditions:</p>
            {offer.conditions.map((condition: string, index: number) => (
              <p key={index} className="text-xs text-muted-foreground">
                • {condition}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Valid until: {new Date(offer.validUntil).toLocaleDateString()}
          </span>
          <span>Conversion rate: {offer.estimatedConversion}%</span>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">Accept Offer</Button>
          <Button variant="outline" className="flex-1">
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OptimizationTab({ optimization }: { optimization: any }) {
  if (!optimization) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No optimization data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Optimization Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Optimization Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">85%</div>
            <p className="text-muted-foreground">
              Your subscription is well optimized
            </p>
            <Progress value={85} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>
            Ways to improve your subscription value
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimization.optimizationSuggestions?.map(
            (suggestion: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <Badge variant="outline" className="capitalize">
                    {suggestion.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
                {suggestion.potentialSavings && (
                  <p className="text-sm text-green-600 font-medium">
                    Potential savings: ${suggestion.potentialSavings}/month
                  </p>
                )}
                {suggestion.steps && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Steps:</p>
                    {suggestion.steps.map((step: string, stepIndex: number) => (
                      <p
                        key={stepIndex}
                        className="text-xs text-muted-foreground"
                      >
                        {stepIndex + 1}. {step}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
