'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Globe,
  Zap,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAdmin } from '@/hooks/useAdmin';
import type { SystemSetting } from '@/types/admin';

interface SettingGroup {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: SystemSetting[];
}

interface SettingInputProps {
  setting: SystemSetting;
  value: any;
  onChange: (value: any) => void;
}

function SettingInput({ setting, value, onChange }: SettingInputProps) {
  const renderInput = () => {
    // Determine input type based on setting key and value
    if (
      typeof value === 'boolean' ||
      setting.key.includes('enabled') ||
      setting.key.includes('mode')
    ) {
      return (
        <div className="flex items-center space-x-2">
          <Switch checked={value} onCheckedChange={onChange} />
          <Label className="text-sm text-muted-foreground">
            {value ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      );
    }

    if (
      setting.key.includes('rate') ||
      setting.key.includes('commission') ||
      setting.key.includes('percentage')
    ) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max={
              setting.key.includes('rate') || setting.key.includes('commission')
                ? '1'
                : '100'
            }
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground">
            {setting.key.includes('commission') || setting.key.includes('rate')
              ? '(0-1)'
              : '%'}
          </span>
        </div>
      );
    }

    if (setting.key.includes('size') || setting.key.includes('limit')) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground">
            {setting.key.includes('size') ? 'bytes' : 'per hour'}
          </span>
        </div>
      );
    }

    if (setting.description && setting.description.length > 100) {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      );
    }

    return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">
            {setting.key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Label>
          {setting.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {setting.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {setting.category}
        </Badge>
      </div>
      {renderInput()}
    </div>
  );
}

export function SystemSettings() {
  const { getSystemSettings, updateSystemSetting, loading } = useAdmin();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, any>>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setHasChanges(Object.keys(modifiedSettings).length > 0);
  }, [modifiedSettings]);

  const fetchSettings = async () => {
    try {
      const result = await getSystemSettings();
      if (result) {
        setSettings(result);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSettingChange = (settingId: string, value: any) => {
    setModifiedSettings((prev) => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatePromises = Object.entries(modifiedSettings).map(
        ([settingId, value]) => {
          const setting = settings.find((s) => s.id === settingId);
          if (setting) {
            return updateSystemSetting(settingId, {
              value,
              updated_by: 'current_admin_id', // This would be the current admin's ID
            });
          }
        }
      );

      await Promise.all(updatePromises.filter(Boolean));

      // Refresh settings
      await fetchSettings();
      setModifiedSettings({});
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setModifiedSettings({});
  };

  const getSettingValue = (setting: SystemSetting) => {
    if (modifiedSettings[setting.id] !== undefined) {
      return modifiedSettings[setting.id];
    }
    return setting.value;
  };

  const groupedSettings: SettingGroup[] = [
    {
      category: 'general',
      title: 'General Settings',
      description: 'Basic platform configuration',
      icon: <Globe className="h-5 w-5" />,
      settings: settings.filter((s) => s.category === 'general'),
    },
    {
      category: 'system',
      title: 'System Settings',
      description: 'Core system configuration and maintenance',
      icon: <Settings className="h-5 w-5" />,
      settings: settings.filter((s) => s.category === 'system'),
    },
    {
      category: 'limits',
      title: 'Usage Limits',
      description: 'Rate limits and usage restrictions',
      icon: <Zap className="h-5 w-5" />,
      settings: settings.filter((s) => s.category === 'limits'),
    },
    {
      category: 'marketplace',
      title: 'Marketplace Settings',
      description: 'Commission rates and marketplace configuration',
      icon: <DollarSign className="h-5 w-5" />,
      settings: settings.filter(
        (s) => s.category === 'marketplace' || s.category === 'affiliate'
      ),
    },
    {
      category: 'notifications',
      title: 'Notification Settings',
      description: 'Email and notification preferences',
      icon: <Info className="h-5 w-5" />,
      settings: settings.filter((s) => s.category === 'notifications'),
    },
    {
      category: 'moderation',
      title: 'Moderation Settings',
      description: 'Content moderation and safety features',
      icon: <Shield className="h-5 w-5" />,
      settings: settings.filter((s) => s.category === 'moderation'),
    },
  ].filter((group) => group.settings.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and system parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-900">
              You have unsaved changes
            </span>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Settings Groups */}
      <div className="space-y-6">
        {groupedSettings.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {group.icon}
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {group.settings.map((setting, index) => (
                  <div key={setting.id}>
                    <SettingInput
                      setting={setting}
                      value={getSettingValue(setting)}
                      onChange={(value) =>
                        handleSettingChange(setting.id, value)
                      }
                    />
                    {index < group.settings.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Important Notice</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Changes to system settings may affect platform functionality.
                Please review all changes carefully before saving. Some settings
                may require a system restart to take effect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
