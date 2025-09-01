'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import {
  Shield,
  AlertTriangle,
  Ban,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Server,
  Lock,
} from 'lucide-react';

interface SecurityMetrics {
  failed_logins_24h: number;
  blocked_ips: number;
  rate_limit_violations: number;
  suspicious_activities: number;
  data_access_anomalies: number;
  active_sessions: number;
  last_security_scan: string;
}

interface SecurityAlert {
  id: string;
  type:
    | 'rate_limit'
    | 'suspicious_activity'
    | 'data_breach'
    | 'unauthorized_access'
    | 'malware'
    | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  user_id?: string;
  ip_address?: string;
}

interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  success: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  details?: Record<string, any>;
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load metrics
      const metricsResponse = await fetch('/api/security?action=metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      // Load alerts
      const alertsResponse = await fetch(
        '/api/security?action=alerts&limit=20'
      );
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data);
      }

      // Load audit logs
      const auditResponse = await fetch(
        '/api/security?action=audit_logs&limit=50'
      );
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditLogs(auditData.data);
      }

      // Load blocked IPs
      const blockedResponse = await fetch('/api/security?action=blocked_ips');
      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        setBlockedIPs(blockedData.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_alert',
          data: { alertId },
        }),
      });

      if (response.ok) {
        setAlerts(
          alerts.map((alert) =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
          )
        );
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblock_ip',
          data: { ip },
        }),
      });

      if (response.ok) {
        setBlockedIPs(blockedIPs.filter((blockedIP) => blockedIP !== ip));
      }
    } catch (err) {
      console.error('Error unblocking IP:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit':
        return <Activity className="h-4 w-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'data_breach':
        return <Shield className="h-4 w-4" />;
      case 'unauthorized_access':
        return <Ban className="h-4 w-4" />;
      case 'malware':
        return <XCircle className="h-4 w-4" />;
      case 'ddos':
        return <Server className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Logins (24h)
            </CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.failed_logins_24h || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.blocked_ips || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rate Limit Violations
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics?.rate_limit_violations || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.active_sessions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>
                Monitor and respond to security threats and suspicious
                activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No security alerts at this time</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.resolved ? 'bg-muted/50' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertTypeIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {alert.resolved && (
                                <Badge variant="secondary">RESOLVED</Badge>
                              )}
                            </div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                              {alert.ip_address && ` • IP: ${alert.ip_address}`}
                            </p>
                            {alert.details &&
                              Object.keys(alert.details).length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-sm cursor-pointer text-muted-foreground">
                                    View Details
                                  </summary>
                                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                                    {JSON.stringify(alert.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Complete audit trail of user actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={auditLogs}
                columns={[
                  {
                    accessorKey: 'timestamp',
                    header: 'Time',
                    cell: ({ row }) => (
                      <span className="text-sm">
                        {new Date(row.getValue('timestamp')).toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    accessorKey: 'action',
                    header: 'Action',
                    cell: ({ row }) => (
                      <Badge variant="outline">{row.getValue('action')}</Badge>
                    ),
                  },
                  {
                    accessorKey: 'resource_type',
                    header: 'Resource',
                  },
                  {
                    accessorKey: 'ip_address',
                    header: 'IP Address',
                  },
                  {
                    accessorKey: 'success',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge
                        variant={
                          row.getValue('success') ? 'secondary' : 'destructive'
                        }
                      >
                        {row.getValue('success') ? 'Success' : 'Failed'}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: 'severity',
                    header: 'Severity',
                    cell: ({ row }) => (
                      <Badge
                        variant={getSeverityColor(row.getValue('severity'))}
                      >
                        {row.getValue('severity')}
                      </Badge>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>
                Manage IP addresses blocked due to suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blockedIPs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No blocked IP addresses</p>
                  </div>
                ) : (
                  blockedIPs.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Ban className="h-4 w-4 text-red-500" />
                        <span className="font-mono">{ip}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unblockIP(ip)}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time security system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Rate Limiting</span>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DDoS Protection</span>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logging</span>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Input Sanitization</span>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Last security scan:{' '}
                  {metrics?.last_security_scan
                    ? new Date(metrics.last_security_scan).toLocaleString()
                    : 'Never'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>
                      Suspicious activities:{' '}
                      {metrics?.suspicious_activities || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>
                      Data access anomalies:{' '}
                      {metrics?.data_access_anomalies || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="h-4 w-4 text-purple-500" />
                    <span>Encryption status: Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
