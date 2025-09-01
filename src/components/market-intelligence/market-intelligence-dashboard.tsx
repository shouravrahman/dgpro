'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Search,
  Filter,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Eye,
  DollarSign,
} from 'lucide-react';

interface MarketInsight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  recommendations: string[];
  data: any;
}

interface TrendingProduct {
  id: string;
  title: string;
  price: number;
  trend_score: number;
  opportunity_score: number;
  competition_level: string;
  market_platforms: { name: string; type: string };
  market_categories: { name: string; slug: string };
}

interface MarketTrend {
  id: string;
  trend_name: string;
  trend_type: string;
  confidence_score: number;
  demand_score: number;
  market_categories: { name: string; slug: string };
}

export function MarketIntelligenceDashboard() {
  const { user, onboardingStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'trends' | 'opportunities' | 'insights'
  >('overview');

  // Data states
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [personalizedInsights, setPersonalizedInsights] = useState<
    MarketInsight[]
  >([]);
  const [marketOverview, setMarketOverview] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load market overview
      const overviewResponse = await fetch(
        '/api/market-intelligence?action=overview'
      );
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setMarketOverview(overviewData.data);
      }

      // Load trending products
      const trendingResponse = await fetch(
        '/api/market-intelligence?action=trending-products&limit=10'
      );
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingProducts(trendingData.data || []);
      }

      // Load market trends
      const trendsResponse = await fetch(
        '/api/market-intelligence?action=market-trends&limit=10'
      );
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setMarketTrends(trendsData.data || []);
      }

      // Load personalized insights if user has completed onboarding
      if (onboardingStatus?.isCompleted) {
        await generatePersonalizedInsights();
      }
    } catch (error) {
      console.error('Error loading market intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedInsights = async () => {
    try {
      setAnalysisLoading(true);

      const response = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'personalized_insights',
          data: {},
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPersonalizedInsights(result.data?.insights || []);
      }
    } catch (error) {
      console.error('Error generating personalized insights:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const runTrendAnalysis = async () => {
    try {
      setAnalysisLoading(true);

      const response = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'trend_analysis',
          data: {
            timeframe: '30d',
            categories: onboardingStatus?.step1_data?.productTypes || [],
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update trends with new analysis
        setMarketTrends((prev) => [...prev, ...(result.data?.trends || [])]);
      }
    } catch (error) {
      console.error('Error running trend analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Intelligence</h2>
          <p className="text-muted-foreground">
            AI-powered insights personalized for your interests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePersonalizedInsights}
            disabled={analysisLoading}
          >
            <Brain className="w-4 h-4 mr-2" />
            {analysisLoading ? 'Analyzing...' : 'AI Insights'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runTrendAnalysis}
            disabled={analysisLoading}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trend Analysis
          </Button>
          <Button variant="outline" size="sm" onClick={loadInitialData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'opportunities', label: 'Opportunities', icon: Target },
          { id: 'insights', label: 'AI Insights', icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Market Overview Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketOverview?.totalProducts?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketOverview?.platforms || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Data sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketOverview?.categories || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Product categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketOverview?.recentTrends || '0'}
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rising Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Rising Trends
              </CardTitle>
              <CardDescription>
                Market trends with increasing demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketTrends
                .filter((trend) => trend.trend_type === 'rising')
                .slice(0, 5)
                .map((trend) => (
                  <div
                    key={trend.id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{trend.trend_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trend.market_categories?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {Math.round(trend.confidence_score * 100)}% confidence
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Demand: {Math.round(trend.demand_score * 10)}/10
                      </p>
                    </div>
                  </div>
                ))}
              {marketTrends.filter((trend) => trend.trend_type === 'rising')
                .length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No rising trends data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Declining Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Declining Trends
              </CardTitle>
              <CardDescription>
                Market trends with decreasing demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketTrends
                .filter((trend) => trend.trend_type === 'declining')
                .slice(0, 5)
                .map((trend) => (
                  <div
                    key={trend.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{trend.trend_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trend.market_categories?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        {Math.round(trend.confidence_score * 100)}% confidence
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Demand: {Math.round(trend.demand_score * 10)}/10
                      </p>
                    </div>
                  </div>
                ))}
              {marketTrends.filter((trend) => trend.trend_type === 'declining')
                .length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No declining trends data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trendingProducts.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {product.market_categories?.name}
                      </Badge>
                      <Badge variant="outline">
                        {product.market_platforms?.name}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${product.price}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trend Score
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(product.trend_score / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {product.trend_score}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Opportunity
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(product.opportunity_score / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {product.opportunity_score}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Competition
                    </span>
                    <Badge
                      variant={
                        product.competition_level === 'low'
                          ? 'default'
                          : product.competition_level === 'medium'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {product.competition_level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {trendingProducts.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Opportunities Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're analyzing market data to find opportunities for you.
                </p>
                <Button onClick={loadInitialData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {analysisLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-4">
                  AI is analyzing market data to generate personalized
                  insights...
                </p>
              </CardContent>
            </Card>
          )}

          {personalizedInsights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {personalizedInsights.map((insight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          {insight.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {insight.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            insight.impact === 'high'
                              ? 'default'
                              : insight.impact === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {insight.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Timeframe: {insight.timeframe}
                        </span>
                        {insight.actionable && (
                          <Badge variant="outline" className="text-green-600">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!analysisLoading && personalizedInsights.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Insights Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate personalized market insights based on your interests
                  and goals.
                </p>
                <Button onClick={generatePersonalizedInsights}>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
