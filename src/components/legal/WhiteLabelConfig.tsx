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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Palette,
  Globe,
  DollarSign,
  Settings,
  Crown,
  Info,
} from 'lucide-react';
import {
  useWhiteLabelConfig,
  useCreateWhiteLabelConfig,
  useUpdateWhiteLabelConfig,
} from '@/hooks/useLegal';

export function WhiteLabelConfig() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: config, isLoading } = useWhiteLabelConfig();
  const createConfig = useCreateWhiteLabelConfig();
  const updateConfig = useUpdateWhiteLabelConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">White Label Configuration</h2>
          <p className="text-muted-foreground">
            Customize branding and revenue sharing for your white label solution
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            Enterprise Feature
          </Badge>
          {config && (
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Config'}
            </Button>
          )}
        </div>
      </div>

      {/* Enterprise Requirement Alert */}
      {!config && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertTitle>Enterprise Subscription Required</AlertTitle>
          <AlertDescription>
            White labeling is available for Enterprise subscribers only. Upgrade
            your subscription to access this feature.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Configuration */}
      {config ? (
        <div className="space-y-6">
          {/* Domain & Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Configuration
              </CardTitle>
              <CardDescription>
                Your white label domain and basic settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input value={config.domain} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.is_active ? 'default' : 'secondary'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {isEditing && <Switch checked={config.is_active} />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding Settings
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of your white label solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={config.branding?.company_name || ''}
                    disabled={!isEditing}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={config.branding?.logo_url || ''}
                    disabled={!isEditing}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.branding?.primary_color || '#000000'}
                      disabled={!isEditing}
                      className="w-16"
                    />
                    <Input
                      value={config.branding?.primary_color || '#000000'}
                      disabled={!isEditing}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.branding?.secondary_color || '#666666'}
                      disabled={!isEditing}
                      className="w-16"
                    />
                    <Input
                      value={config.branding?.secondary_color || '#666666'}
                      disabled={!isEditing}
                      placeholder="#666666"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Sharing
              </CardTitle>
              <CardDescription>
                Configure revenue sharing and commission structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Revenue Share Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.revenue_share_percentage * 100}
                      disabled={!isEditing}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentage of revenue you receive from sales
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Revenue</Label>
                  <div className="text-2xl font-bold text-green-600">$0.00</div>
                  <p className="text-xs text-muted-foreground">
                    Current month earnings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom CSS/JS */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Styling</CardTitle>
              <CardDescription>
                Add custom CSS and JavaScript for advanced customization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom CSS</Label>
                  <Textarea
                    value={config.custom_css || ''}
                    disabled={!isEditing}
                    placeholder="/* Your custom CSS here */"
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom JavaScript</Label>
                  <Textarea
                    value={config.custom_js || ''}
                    disabled={!isEditing}
                    placeholder="// Your custom JavaScript here"
                    rows={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </div>
          )}
        </div>
      ) : (
        /* Setup White Label */
        <Card>
          <CardHeader>
            <CardTitle>Set Up White Labeling</CardTitle>
            <CardDescription>
              Create your white label configuration to start offering branded
              solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>White Label Benefits</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Custom domain and branding</li>
                    <li>Revenue sharing from client sales</li>
                    <li>Complete control over user experience</li>
                    <li>White label client management tools</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="text-center py-8">
                <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Enterprise Feature</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Enterprise to unlock white labeling capabilities
                </p>
                <Button>Upgrade to Enterprise</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
