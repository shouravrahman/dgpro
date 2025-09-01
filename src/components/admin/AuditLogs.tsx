'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Eye,
  Download,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useAuditLogs } from '@/hooks/useAdmin';
import type { AuditLog, AuditLogFilters } from '@/types/admin';

interface LogDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

function LogDetailDialog({ isOpen, onClose, log }: LogDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Detailed information about this audit log entry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <p className="text-sm text-muted-foreground">{log.action}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Target Type</Label>
              <p className="text-sm text-muted-foreground">
                {log.target_type || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Target ID</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {log.target_id || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Timestamp</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Admin User</Label>
              <p className="text-sm text-muted-foreground">
                {log.admin?.user?.user_metadata?.full_name ||
                  log.admin?.user?.email ||
                  'Unknown'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">IP Address</Label>
              <p className="text-sm text-muted-foreground font-mono">
                {log.ip_address || 'N/A'}
              </p>
            </div>
          </div>

          {log.user_agent && (
            <div>
              <Label className="text-sm font-medium">User Agent</Label>
              <p className="text-sm text-muted-foreground break-all">
                {log.user_agent}
              </p>
            </div>
          )}

          {Object.keys(log.details).length > 0 && (
            <div>
              <Label className="text-sm font-medium">Details</Label>
              <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-40">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AuditLogs() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });

  const { logs, count, loading, refetch } = useAuditLogs(filters);

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'admin',
      header: 'Admin User',
      cell: ({ row }) => {
        const admin = row.getValue('admin') as AuditLog['admin'];
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
              {admin?.user?.user_metadata?.full_name?.[0] ||
                admin?.user?.email?.[0]?.toUpperCase() ||
                '?'}
            </div>
            <div className="text-sm">
              <div className="font-medium">
                {admin?.user?.user_metadata?.full_name || 'Unknown'}
              </div>
              <div className="text-muted-foreground">
                {admin?.user?.email || 'Unknown'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const action = row.getValue('action') as string;
        const actionColors = {
          create: 'bg-green-100 text-green-800',
          update: 'bg-blue-100 text-blue-800',
          delete: 'bg-red-100 text-red-800',
          suspend: 'bg-orange-100 text-orange-800',
          login: 'bg-gray-100 text-gray-800',
        };

        const getActionColor = (action: string) => {
          for (const [key, color] of Object.entries(actionColors)) {
            if (action.toLowerCase().includes(key)) {
              return color;
            }
          }
          return actionColors.update;
        };

        return (
          <Badge className={getActionColor(action)}>
            {action.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'target_type',
      header: 'Target Type',
      cell: ({ row }) => {
        const targetType = row.getValue('target_type') as string;
        if (!targetType)
          return <span className="text-muted-foreground">N/A</span>;

        return <Badge variant="outline">{targetType.replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'target_id',
      header: 'Target ID',
      cell: ({ row }) => {
        const targetId = row.getValue('target_id') as string;
        if (!targetId)
          return <span className="text-muted-foreground">N/A</span>;

        return (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {targetId.length > 8 ? `${targetId.substring(0, 8)}...` : targetId}
          </code>
        );
      },
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => {
        const ipAddress = row.getValue('ip_address') as string;
        if (!ipAddress)
          return <span className="text-muted-foreground">N/A</span>;

        return (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {ipAddress}
          </code>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLog(log);
              setShowDetailDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleExport = () => {
    // This would implement CSV/JSON export functionality
    console.log('Exporting audit logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all administrative actions and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Actions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter((log) => {
                  const logDate = new Date(log.created_at);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.admin_id)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Types</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.action)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="action-search">Search Actions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="action-search"
                  placeholder="Search by action"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target-type">Target Type</Label>
              <Select
                value={filters.target_type || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'target_type',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="content_report">Content Report</SelectItem>
                  <SelectItem value="system_setting">System Setting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from || ''}
                onChange={(e) =>
                  handleFilterChange('date_from', e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Chronological record of all administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logs}
            searchKey="action"
            searchPlaceholder="Search logs..."
            enableRowSelection={false}
            pageSize={filters.limit}
          />
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <LogDetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        log={selectedLog}
      />
    </div>
  );
}
