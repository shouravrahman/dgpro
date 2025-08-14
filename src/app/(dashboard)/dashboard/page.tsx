'use client';

// Dashboard Page
// Protected dashboard page for authenticated users

import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">AI Product Creator</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Welcome back,{' '}
              {user?.user_metadata?.full_name?.split(' ')[0] || 'Creator'}! 👋
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to create amazing digital products? Let's get started with
              your next big idea.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Product</h3>
                  <p className="text-sm text-muted-foreground">
                    Start building your next digital product with AI assistance
                  </p>
                </div>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Market Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover trending products and market opportunities
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Explore Trends
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">My Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage and track your existing digital products
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  View Products
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-lg border bg-card text-card-foreground">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">
                Products Created
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card text-card-foreground">
              <div className="text-2xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground">
                Total Earnings
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card text-card-foreground">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">
                Active Listings
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card text-card-foreground">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
