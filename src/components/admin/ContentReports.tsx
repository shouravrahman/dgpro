'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import {
  Flag,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useContentReports } from '@/hooks/useAdmin';
import type { ContentReport } from '@/types/admin';

interface ReportDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: ContentReport | null;
  onResolve: (reportId: string, notes: string) => void;
  onDismiss: (reportId: string, notes: string) => void;
}

function ReportDetailDialog({
  isOpen,
  onClose,
  report,
  onResolve,
  onDismiss,
}: ReportDetailDialogProps) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'resolve' | 'dismiss' | null>(null);

  const handleAction = () => {
    if (!report || !action) return;

    if (action === 'resolve') {
      onResolve(report.id, notes);
    } else {
      onDismiss(report.id, notes);
    }

    onClose();
    setNotes('');
    setAction(null);
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Content Report Details</DialogTitle>
          <DialogDescription>
            Review and take action on this content report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Content Type</Label>
              <p className="text-sm text-muted-foreground">
                {report.content_type}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Badge
                className={
                  report.priority === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : report.priority === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : report.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                }
              >
                {report.priority}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge
                className={
                  report.status === 'resolved'
                    ? 'bg-green-100 text-green-800'
                    : report.status === 'investigating'
                      ? 'bg-blue-100 text-blue-800'
                      : report.status === 'dismissed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                }
              >
                {report.status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Reported</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Reporter</Label>
            <p className="text-sm text-muted-foreground">
              {report.reporter?.user_metadata?.full_name || 'Unknown'} (
              {report.reporter?.email})
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Reason</Label>
            <p className="text-sm text-muted-foreground">{report.reason}</p>
          </div>

          {report.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Content ID</Label>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
              {report.content_id}
            </code>
          </div>

          {report.resolution_notes && (
            <div>
              <Label className="text-sm font-medium">
                Previous Resolution Notes
              </Label>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                {report.resolution_notes}
              </p>
            </div>
          )}

          {report.status === 'pending' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="action">Action</Label>
                <Select
                  value={action || ''}
                  onValueChange={(value) => setAction(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolve">Resolve Report</SelectItem>
                    <SelectItem value="dismiss">Dismiss Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Resolution Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {report.status === 'pending' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={!action}>
              {action === 'resolve'
                ? 'Resolve'
                : action === 'dismiss'
                  ? 'Dismiss'
                  : 'Apply Action'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ContentReports() {
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
  }>({});

  const { reports, loading, updateReport, refetch } =
    useContentReports(filters);

  const columns: ColumnDef<ContentReport>[] = [
    {
      accessorKey: 'created_at',
      header: 'Reported',
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
      accessorKey: 'content_type',
      header: 'Content Type',
      cell: ({ row }) => {
        const contentType = row.getValue('content_type') as string;
        const typeIcons = {
          product: Package,
          listing: Flag,
          user: User,
          review: MessageSquare,
          forum_post: MessageSquare,
        };

        const Icon = typeIcons[contentType as keyof typeof typeIcons] || Flag;

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{contentType.replace('_', ' ')}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return <div className="max-w-[200px] truncate text-sm">{reason}</div>;
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        const priorityConfig = {
          low: { color: 'bg-gray-100 text-gray-800', icon: Clock },
          medium: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: AlertTriangle,
          },
          high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
          critical: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig];
        const Icon = config?.icon || Clock;

        return (
          <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
            <Icon className="h-3 w-3 mr-1" />
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          investigating: { color: 'bg-blue-100 text-blue-800', icon: Eye },
          resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          dismissed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;

        return (
          <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
            <Icon className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'reporter',
      header: 'Reporter',
      cell: ({ row }) => {
        const reporter = row.getValue('reporter') as ContentReport['reporter'];
        return (
          <div className="text-sm">
            <div className="font-medium">
              {reporter?.user_metadata?.full_name || 'Unknown'}
            </div>
            <div className="text-muted-foreground">
              {reporter?.email || 'Unknown'}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedReport(report);
                  setShowDetailDialog(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {report.status === 'pending' && (
                <>
                  <DropdownMenuItem className="text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-600">
                    <XCircle className="mr-2 h-4 w-4" />
                    Dismiss Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleResolveReport = async (reportId: string, notes: string) => {
    try {
      await updateReport(reportId, {
        status: 'resolved',
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
      });
      refetch();
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const handleDismissReport = async (reportId: string, notes: string) => {
    try {
      await updateReport(reportId, {
        status: 'dismissed',
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
      });
      refetch();
    } catch (error) {
      console.error('Failed to dismiss report:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const criticalReports = reports.filter((r) => r.priority === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Reports</h1>
          <p className="text-muted-foreground">
            Review and moderate reported content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingReports.length > 0 && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              <Clock className="h-3 w-3 mr-1" />
              {pendingReports.length} pending
            </Badge>
          )}
          {criticalReports.length > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {criticalReports.length} critical
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalReports.length}</div>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Content Reports
          </CardTitle>
          <CardDescription>
            Review and take action on reported content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reports}
            searchKey="reason"
            searchPlaceholder="Search reports..."
            enableRowSelection={false}
          />
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        report={selectedReport}
        onResolve={handleResolveReport}
        onDismiss={handleDismissReport}
      />
    </div>
  );
}
