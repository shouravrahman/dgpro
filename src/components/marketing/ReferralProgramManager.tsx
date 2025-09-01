'use client';

import { useState } from 'react';
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
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Edit,
  Settings,
  Gift,
  Link,
} from 'lucide-react';

export function ReferralProgramManager() {
  const [programs] = useState([
    {
      id: '1',
      name: 'Standard Referral Program',
      rewardType: 'percentage',
      rewardValue: 20,
      refereeRewardValue: 10,
      status: 'active',
      totalReferrers: 45,
      totalReferrals: 123,
      totalRewards: 2450.0,
      conversionRate: 15.2,
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      name: 'VIP Referral Program',
      rewardType: 'fixed_amount',
      rewardValue: 50,
      refereeRewardValue: 25,
      status: 'paused',
      totalReferrers: 12,
      totalReferrals: 28,
      totalRewards: 1400.0,
      conversionRate: 22.8,
      createdAt: '2024-01-15',
    },
  ]);

  const [referralLinks] = useState([
    {
      id: '1',
      programId: '1',
      code: 'REF-ABC123',
      clicks: 89,
      conversions: 12,
      rewards: 240.0,
      createdAt: '2024-01-20',
    },
    {
      id: '2',
      programId: '1',
      code: 'REF-XYZ789',
      clicks: 156,
      conversions: 23,
      rewards: 460.0,
      createdAt: '2024-01-18',
    },
  ]);

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/ref/${code}`;
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  };

  const getRewardDisplay = (program: any) => {
    if (program.rewardType === 'percentage') {
      return `${program.rewardValue}% commission`;
    } else if (program.rewardType === 'fixed_amount') {
      return `$${program.rewardValue} per referral`;
    } else {
      return `${program.rewardValue} credits`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Referral Programs
          </h2>
          <p className="text-muted-foreground">
            Manage referral programs and track affiliate performance
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Programs
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {programs.length} total programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce(
                (sum, program) => sum + program.totalReferrers,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active affiliates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce(
                (sum, program) => sum + program.totalReferrals,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {programs
                .reduce((sum, program) => sum + program.totalRewards, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Programs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Referral Programs</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <Badge
                    variant={
                      program.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {program.status}
                  </Badge>
                </div>
                <CardDescription>
                  {getRewardDisplay(program)}
                  {program.refereeRewardValue > 0 && (
                    <span className="ml-2">
                      • ${program.refereeRewardValue} for new customers
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Program Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">
                        {program.totalReferrers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Referrers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">
                        {program.totalReferrals}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Referrals
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">
                        {program.conversionRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Conv. Rate
                      </div>
                    </div>
                  </div>

                  {/* Total Rewards */}
                  <div className="text-center py-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      ${program.totalRewards.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total rewards paid
                    </div>
                  </div>

                  {/* Program Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(program.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Referral Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Referral Links</h3>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Generate Link
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {referralLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {link.code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyReferralLink(link.code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Link Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Link className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">{link.clicks}</div>
                      <div className="text-xs text-muted-foreground">
                        Clicks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">{link.conversions}</div>
                      <div className="text-xs text-muted-foreground">
                        Conversions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-medium">${link.rewards}</div>
                      <div className="text-xs text-muted-foreground">
                        Earned
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="text-center py-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {link.clicks > 0
                        ? ((link.conversions / link.clicks) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Conversion rate
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Created {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty States */}
      {programs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No referral programs yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first referral program to start growing through
              word-of-mouth.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Program
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
