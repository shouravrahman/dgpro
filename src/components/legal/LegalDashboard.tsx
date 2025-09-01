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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Download,
  Plus,
  Eye,
  Settings,
} from 'lucide-react';
import { useLegalDashboard } from '@/hooks/useLegal';
import { LicenseManager } from './LicenseManager';
import { DocumentGenerator } from './DocumentGenerator';
import { GDPRCompliance } from './GDPRCompliance';
import { CopyrightProtection } from './CopyrightProtection';
import { DisputeResolution } from './DisputeResolution';
import { WhiteLabelConfig } from './WhiteLabelConfig';
import { ComplianceAudit } from './ComplianceAudit';

export function LegalDashboard() {
  const { activeTab, setActiveTab, data, isLoading, refetch } =
    useLegalDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getComplianceScore = () => {
    const audits = data.complianceAudits;
    if (audits.length === 0) return 0;
    const latestAudit = audits[0];
    return latestAudit.compliance_score || 0;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const complianceScore = getComplianceScore();
  const urgentNotifications = data.notifications.filter(
    (n) => n.severity === 'critical' || n.severity === 'high'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal & Compliance</h1>
          <p className="text-muted-foreground">
            Manage licenses, legal documents, and compliance requirements
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Urgent Legal Matters</AlertTitle>
          <AlertDescription className="text-red-700">
            You have {urgentNotifications.length} urgent legal matter(s)
            requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getComplianceColor(complianceScore)}>
                {complianceScore}%
              </span>
            </div>
            <Progress value={complianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceScore >= 90
                ? 'Excellent'
                : complianceScore >= 70
                  ? 'Good'
                  : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Protected Products
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.copyrightProtections.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Products with copyright protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Disputes
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                data.disputes.filter(
                  (d) => d.status === 'open' || d.status === 'mediation'
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Disputes requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.gdprCompliance?.consent_given ? (
                <span className="text-green-600">Compliant</span>
              ) : (
                <span className="text-red-600">Pending</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Data protection compliance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="copyright">Copyright</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="white-label">White Label</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Legal Notifications
                </CardTitle>
                <CardDescription>
                  Recent legal matters requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.severity === 'critical'
                            ? 'bg-red-500'
                            : notification.severity === 'high'
                              ? 'bg-orange-500'
                              : notification.severity === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              notification.action_required
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {notification.action_required
                              ? 'Action Required'
                              : 'Info'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.notifications.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No legal notifications at this time
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Audit Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Latest compliance audit results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.complianceAudits.length > 0 ? (
                  <div className="space-y-4">
                    {data.complianceAudits.slice(0, 3).map((audit) => (
                      <div key={audit.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {audit.audit_type} Audit
                          </h4>
                          <Badge
                            variant={
                              audit.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {audit.status}
                          </Badge>
                        </div>
                        {audit.compliance_score && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score</span>
                              <span
                                className={`font-medium ${getComplianceColor(audit.compliance_score)}`}
                              >
                                {audit.compliance_score}%
                              </span>
                            </div>
                            <Progress value={audit.compliance_score} />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(audit.audit_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      No compliance audits yet
                    </p>
                    <ComplianceAudit />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses">
          <LicenseManager />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentGenerator />
        </TabsContent>

        <TabsContent value="gdpr">
          <GDPRCompliance />
        </TabsContent>

        <TabsContent value="copyright">
          <CopyrightProtection />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeResolution />
        </TabsContent>

        <TabsContent value="white-label">
          <WhiteLabelConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
