'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Globe,
  Percent,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Plus,
} from 'lucide-react';
import { EmailCampaignManager } from './EmailCampaignManager';
import { LandingPageBuilder } from './LandingPageBuilder';
import { CouponManager } from './CouponManager';
import { ReferralProgramManager } from './ReferralProgramManager';

interface MarketingStats {
  emailCampaigns: {
    total: number;
    active: number;
    openRate: number;
    clickRate: number;
  };
  landingPages: {
    total: number;
    published: number;
    totalViews: number;
    conversionRate: number;
  };
  coupons: {
    total: number;
    active: number;
    totalUsage: number;
    totalDiscount: number;
  };
  referrals: {
    totalPrograms: number;
    activeReferrers: number;
    totalReferrals: number;
    totalRewards: number;
  };
}

export function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  const stats: MarketingStats = {
    emailCampaigns: {
      total: 12,
      active: 3,
      openRate: 24.5,
      clickRate: 3.2,
    },
    landingPages: {
      total: 8,
      published: 5,
      totalViews: 2847,
      conversionRate: 12.3,
    },
    coupons: {
      total: 15,
      active: 8,
      totalUsage: 156,
      totalDiscount: 2340.5,
    },
    referrals: {
      totalPrograms: 2,
      activeReferrers: 23,
      totalReferrals: 89,
      totalRewards: 1250.0,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Marketing & Growth
          </h1>
          <p className="text-muted-foreground">
            Manage your email campaigns, landing pages, coupons, and referral
            programs
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="landing">Landing Pages</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Email Marketing Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Campaigns
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.emailCampaigns.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.emailCampaigns.active} active campaigns
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Badge variant="secondary">
                    {stats.emailCampaigns.openRate}% open rate
                  </Badge>
                  <Badge variant="secondary">
                    {stats.emailCampaigns.clickRate}% click rate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Landing Pages Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Landing Pages
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.landingPages.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.landingPages.published} published pages
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {stats.landingPages.totalViews.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <MousePointer className="h-3 w-3 mr-1" />
                    {stats.landingPages.conversionRate}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupons Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coupons</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coupons.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.coupons.active} active coupons
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Badge variant="secondary">
                    {stats.coupons.totalUsage} uses
                  </Badge>
                  <Badge variant="secondary">
                    ${stats.coupons.totalDiscount} saved
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Referrals Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Referral Programs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.referrals.totalPrograms}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.referrals.activeReferrers} active referrers
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Badge variant="secondary">
                    {stats.referrals.totalReferrals} referrals
                  </Badge>
                  <Badge variant="secondary">
                    ${stats.referrals.totalRewards} rewards
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setActiveTab('email')}
                >
                  <Mail className="h-6 w-6" />
                  <span>Create Email Campaign</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setActiveTab('landing')}
                >
                  <Globe className="h-6 w-6" />
                  <span>Build Landing Page</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setActiveTab('coupons')}
                >
                  <Percent className="h-6 w-6" />
                  <span>Create Coupon</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => setActiveTab('referrals')}
                >
                  <Users className="h-6 w-6" />
                  <span>Setup Referrals</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest marketing activities and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Email campaign "Summer Sale" sent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 hours ago • 1,234 recipients
                    </p>
                  </div>
                  <Badge variant="secondary">24.5% open rate</Badge>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Landing page "Product Launch" published
                    </p>
                    <p className="text-xs text-muted-foreground">
                      1 day ago • 156 views
                    </p>
                  </div>
                  <Badge variant="secondary">12.3% conversion</Badge>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <Percent className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Coupon "SAVE20" created
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 days ago • 23 uses
                    </p>
                  </div>
                  <Badge variant="secondary">$456 saved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <EmailCampaignManager />
        </TabsContent>

        <TabsContent value="landing">
          <LandingPageBuilder />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponManager />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralProgramManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
