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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Calendar,
} from 'lucide-react';
import {
  useGDPRCompliance,
  useRecordGDPRConsent,
  useExportUserData,
} from '@/hooks/useLegal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gdprConsentSchema } from '@/lib/validations/legal';
import type { GDPRConsentRequest } from '@/types/legal';

export function GDPRCompliance() {
  const [showConsentForm, setShowConsentForm] = useState(false);

  const { data: compliance, isLoading } = useGDPRCompliance();
  const recordConsent = useRecordGDPRConsent();
  const exportData = useExportUserData();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GDPRConsentRequest>({
    resolver: zodResolver(gdprConsentSchema),
    defaultValues: {
      consent_given: compliance?.consent_given || false,
      marketing_consent: compliance?.marketing_consent || false,
      analytics_consent: compliance?.analytics_consent || false,
      third_party_sharing_consent:
        compliance?.third_party_sharing_consent || false,
      data_processing_purposes: compliance?.data_processing_purposes || {},
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: GDPRConsentRequest) => {
    try {
      await recordConsent.mutateAsync(data);
      setShowConsentForm(false);
    } catch (error) {
      console.error('Failed to record GDPR consent:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportData.mutateAsync();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getComplianceScore = () => {
    if (!compliance) return 0;
    let score = 0;
    if (compliance.consent_given) score += 40;
    if (compliance.marketing_consent !== null) score += 20;
    if (compliance.analytics_consent !== null) score += 20;
    if (compliance.third_party_sharing_consent !== null) score += 20;
    return score;
  };

  const complianceScore = getComplianceScore();

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
          <h2 className="text-2xl font-bold">GDPR Compliance</h2>
          <p className="text-muted-foreground">
            Manage data protection and privacy compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportData}
            variant="outline"
            disabled={exportData.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportData.isPending ? 'Exporting...' : 'Export My Data'}
          </Button>
          <Button
            onClick={() => setShowConsentForm(!showConsentForm)}
            variant={compliance?.consent_given ? 'outline' : 'default'}
          >
            {compliance?.consent_given ? 'Update Consent' : 'Give Consent'}
          </Button>
        </div>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Status
          </CardTitle>
          <CardDescription>Your current GDPR compliance level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance</span>
              <span
                className={`text-lg font-bold ${
                  complianceScore >= 80
                    ? 'text-green-600'
                    : complianceScore >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {complianceScore}%
              </span>
            </div>
            <Progress value={complianceScore} className="h-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {compliance?.consent_given ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Data Processing Consent</span>
                </div>
                <Badge
                  variant={
                    compliance?.consent_given ? 'default' : 'destructive'
                  }
                >
                  {compliance?.consent_given ? 'Given' : 'Required'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {compliance?.marketing_consent !== null ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm">Marketing Consent</span>
                </div>
                <Badge
                  variant={
                    compliance?.marketing_consent ? 'default' : 'secondary'
                  }
                >
                  {compliance?.marketing_consent === null
                    ? 'Not Set'
                    : compliance?.marketing_consent
                      ? 'Allowed'
                      : 'Denied'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {compliance?.analytics_consent !== null ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm">Analytics Consent</span>
                </div>
                <Badge
                  variant={
                    compliance?.analytics_consent ? 'default' : 'secondary'
                  }
                >
                  {compliance?.analytics_consent === null
                    ? 'Not Set'
                    : compliance?.analytics_consent
                      ? 'Allowed'
                      : 'Denied'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {compliance?.third_party_sharing_consent !== null ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm">Third-party Sharing</span>
                </div>
                <Badge
                  variant={
                    compliance?.third_party_sharing_consent
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {compliance?.third_party_sharing_consent === null
                    ? 'Not Set'
                    : compliance?.third_party_sharing_consent
                      ? 'Allowed'
                      : 'Denied'}
                </Badge>
              </div>
            </div>

            {compliance?.consent_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <Calendar className="h-4 w-4" />
                <span>
                  Consent given on{' '}
                  {new Date(compliance.consent_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      {showConsentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Data Processing Consent</CardTitle>
            <CardDescription>
              Manage your data processing preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Your Rights Under GDPR</AlertTitle>
                <AlertDescription>
                  You have the right to access, rectify, erase, restrict
                  processing, data portability, and object to processing of your
                  personal data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label
                      htmlFor="consent_given"
                      className="text-base font-medium"
                    >
                      Data Processing Consent
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to process your personal data to provide our
                      services
                    </p>
                  </div>
                  <Switch
                    id="consent_given"
                    checked={watchedValues.consent_given}
                    onCheckedChange={(checked) =>
                      setValue('consent_given', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label
                      htmlFor="marketing_consent"
                      className="text-base font-medium"
                    >
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing emails and promotional content
                    </p>
                  </div>
                  <Switch
                    id="marketing_consent"
                    checked={watchedValues.marketing_consent}
                    onCheckedChange={(checked) =>
                      setValue('marketing_consent', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label
                      htmlFor="analytics_consent"
                      className="text-base font-medium"
                    >
                      Analytics & Performance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve our services through usage analytics
                    </p>
                  </div>
                  <Switch
                    id="analytics_consent"
                    checked={watchedValues.analytics_consent}
                    onCheckedChange={(checked) =>
                      setValue('analytics_consent', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label
                      htmlFor="third_party_sharing_consent"
                      className="text-base font-medium"
                    >
                      Third-party Data Sharing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share data with trusted partners for enhanced services
                    </p>
                  </div>
                  <Switch
                    id="third_party_sharing_consent"
                    checked={watchedValues.third_party_sharing_consent}
                    onCheckedChange={(checked) =>
                      setValue('third_party_sharing_consent', checked)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConsentForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={recordConsent.isPending}>
                  {recordConsent.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>Exercise your rights under GDPR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Right to Access</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get a copy of all your personal data we have stored
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exportData.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Right to Rectification</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Update or correct your personal information
              </p>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Right to Erasure</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Request deletion of your personal data
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Right to Object</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Object to processing of your personal data
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConsentForm(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Consent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Processing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Processing Information</CardTitle>
          <CardDescription>How we process your personal data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Personal Data We Collect</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Account information (name, email, profile data)</li>
                <li>• Product and transaction data</li>
                <li>• Usage and analytics data</li>
                <li>• Communication preferences</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Legal Basis for Processing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Consent: Marketing communications, analytics</li>
                <li>• Contract: Service delivery, payment processing</li>
                <li>• Legitimate Interest: Security, fraud prevention</li>
                <li>• Legal Obligation: Tax records, compliance</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Data Retention</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Account data: Until account deletion</li>
                <li>• Transaction records: 7 years (legal requirement)</li>
                <li>• Analytics data: 26 months</li>
                <li>• Marketing data: Until consent withdrawal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
