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
  Globe,
  Eye,
  MousePointer,
  Edit,
  Settings,
  BarChart3,
  Palette,
} from 'lucide-react';

export function LandingPageBuilder() {
  const [pages] = useState([
    {
      id: '1',
      name: 'Product Launch',
      slug: 'product-launch',
      status: 'published',
      views: 1234,
      conversions: 89,
      conversionRate: 7.2,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Newsletter Signup',
      slug: 'newsletter',
      status: 'draft',
      views: 0,
      conversions: 0,
      conversionRate: 0,
      createdAt: '2024-01-20',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Landing Page Builder
          </h2>
          <p className="text-muted-foreground">
            Create high-converting landing pages with our drag-and-drop builder
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Landing Page
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground">
              {pages.filter((p) => p.status === 'published').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages
                .reduce((sum, page) => sum + page.views, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages.reduce((sum, page) => sum + page.conversions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Conversion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages.length > 0
                ? (
                    pages.reduce((sum, page) => sum + page.conversionRate, 0) /
                    pages.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all pages</p>
          </CardContent>
        </Card>
      </div>

      {/* Landing Pages List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{page.name}</CardTitle>
                <Badge
                  variant={
                    page.status === 'published' ? 'default' : 'secondary'
                  }
                >
                  {page.status}
                </Badge>
              </div>
              <CardDescription>/{page.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Page Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">
                      {page.views.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">{page.conversions}</div>
                    <div className="text-xs text-muted-foreground">
                      Conversions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-medium">{page.conversionRate}%</div>
                    <div className="text-xs text-muted-foreground">Rate</div>
                  </div>
                </div>

                {/* Page Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(page.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Palette className="h-4 w-4" />
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

      {/* Empty State */}
      {pages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No landing pages yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first landing page to start converting visitors into
              customers.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Landing Page
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Templates</CardTitle>
          <CardDescription>
            Choose from our collection of high-converting templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'Product Launch',
                category: 'Product',
                preview: '/templates/product-launch.jpg',
              },
              {
                name: 'Newsletter Signup',
                category: 'Newsletter',
                preview: '/templates/newsletter.jpg',
              },
              {
                name: 'Event Registration',
                category: 'Event',
                preview: '/templates/event.jpg',
              },
            ].map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {template.category}
                  </p>
                  <Button size="sm" className="w-full mt-2">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
