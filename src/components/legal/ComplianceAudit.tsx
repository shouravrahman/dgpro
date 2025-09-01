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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock, Play } from 'lucide-react';
import {
  useCreateComplianceAudit,
  useComplianceAudits,
} from '@/hooks/useLegal';

export function ComplianceAudit() {
  const [selectedAuditType, setSelectedAuditType] = useState<string>('');

  const { data: audits, isLoading } = useComplianceAudits();
  const createAudit = useCreateComplianceAudit();

  const handleStartAudit = async () => {
    if (!selectedAuditType) return;

    try {
      await createAudit.mutateAsync(selectedAuditType);
      setSelectedAuditType('');
    } catch (error) {
      console.error('Failed to start audit:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Start New Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Start Compliance Audit</CardTitle>
          <CardDescription>
            Run automated compliance checks for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select
              value={selectedAuditType}
              onValueChange={setSelectedAuditType}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select audit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                <SelectItem value="copyright">Copyright Protection</SelectItem>
                <SelectItem value="licensing">Licensing Compliance</SelectItem>
                <SelectItem value="terms">Terms & Conditions</SelectItem>
                <SelectItem value="security">Security Audit</SelectItem>
                <SelectItem value="compliance">General Compliance</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleStartAudit}
              disabled={!selectedAuditType || createAudit.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {createAudit.isPending ? 'Starting...' : 'Start Audit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audits */}
      {audits && audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Audits</CardTitle>
            <CardDescription>Your compliance audit history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audits.slice(0, 5).map((audit) => (
                <div key={audit.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium capitalize">
                        {audit.audit_type.replace('_', ' ')} Audit
                      </h4>
                      <Badge variant={getStatusColor(audit.status)}>
                        {audit.status === 'in_progress' && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {audit.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {audit.status === 'failed' && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {audit.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(audit.audit_date).toLocaleDateString()}
                    </span>
                  </div>

                  {audit.compliance_score !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compliance Score</span>
                        <span
                          className={`font-medium ${getScoreColor(audit.compliance_score)}`}
                        >
                          {audit.compliance_score}%
                        </span>
                      </div>
                      <Progress
                        value={audit.compliance_score}
                        className="h-2"
                      />
                    </div>
                  )}

                  {audit.findings && Object.keys(audit.findings).length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Key Findings</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {audit.recommendations
                          ?.slice(0, 3)
                          .map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Compliance Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">What We Check</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• GDPR compliance status</li>
                <li>• Copyright protection coverage</li>
                <li>• License clarity and completeness</li>
                <li>• Legal document currency</li>
                <li>• Security and privacy measures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Audit Frequency</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Recommended: Monthly</li>
                <li>• Automatic: Quarterly</li>
                <li>• After major changes</li>
                <li>• Before product launches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
