'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
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
import { useAdmin } from '@/hooks/useAdmin';
import type { UserManagementFilters } from '@/types/admin';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  subscription_tier: string;
  created_at: string;
  last_sign_in_at?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
}

interface BulkActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  onConfirm: (action: string, params?: any) => void;
}

function BulkActionDialog({
  isOpen,
  onClose,
  selectedUsers,
  onConfirm,
}: BulkActionDialogProps) {
  const [action, setAction] = useState<string>('');
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!action) return;

    const params: any = {};
    if (action === 'suspend' && reason) {
      params.reason = reason;
    }
    if (action === 'change_tier') {
      params.tier = 'pro'; // This would be selected from a dropdown
    }

    onConfirm(action, params);
    onClose();
    setAction('');
    setReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Action</DialogTitle>
          <DialogDescription>
            Apply action to {selectedUsers.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suspend">Suspend Users</SelectItem>
                <SelectItem value="activate">Activate Users</SelectItem>
                <SelectItem value="change_tier">
                  Change Subscription Tier
                </SelectItem>
                <SelectItem value="send_email">Send Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === 'suspend' && (
            <div>
              <Label htmlFor="reason">Suspension Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for suspension"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!action}>
            Apply Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserManagement() {
  const { getUsers, executeAdminAction, loading } = useAdmin();
  const [users, setUsers] = useState<{ data: User[]; count: number }>({
    data: [],
    count: 0,
  });
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [filters, setFilters] = useState<UserManagementFilters>({
    page: 1,
    limit: 20,
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {user.user_metadata?.full_name?.[0] ||
                user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium">
                {user.user_metadata?.full_name || 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subscription_tier',
      header: 'Subscription',
      cell: ({ row }) => {
        const tier = row.getValue('subscription_tier') as string;
        const tierColors = {
          free: 'bg-gray-100 text-gray-800',
          pro: 'bg-blue-100 text-blue-800',
          enterprise: 'bg-purple-100 text-purple-800',
        };
        return (
          <Badge
            className={
              tierColors[tier as keyof typeof tierColors] || tierColors.free
            }
          >
            {tier}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'last_sign_in_at',
      header: 'Last Active',
      cell: ({ row }) => {
        const date = row.getValue('last_sign_in_at') as string;
        if (!date) return <span className="text-muted-foreground">Never</span>;

        const lastActive = new Date(date);
        const now = new Date();
        const diffDays = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div className="text-sm">
            {diffDays === 0 ? 'Today' : `${diffDays}d ago`}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_suspended',
      header: 'Status',
      cell: ({ row }) => {
        const isSuspended = row.getValue('is_suspended') as boolean;
        return (
          <Badge variant={isSuspended ? 'destructive' : 'default'}>
            {isSuspended ? 'Suspended' : 'Active'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
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
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.is_suspended ? (
                <DropdownMenuItem className="text-green-600">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-red-600">
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const result = await getUsers(filters);
      if (result) {
        setUsers(result);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleBulkAction = async (action: string, params?: any) => {
    try {
      const userIds = selectedUsers.map((user) => user.id);
      await executeAdminAction({
        type: 'user',
        action,
        target_ids: userIds,
        parameters: params,
      });

      // Refresh the user list
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleFilterChange = (key: keyof UserManagementFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, subscriptions, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{users.count} total users</Badge>
        </div>
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
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by email or name"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subscription">Subscription Tier</Label>
              <Select
                value={filters.subscription_tier || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'subscription_tier',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'status',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Input
                id="date-range"
                type="date"
                value={filters.created_after || ''}
                onChange={(e) =>
                  handleFilterChange('created_after', e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedUsers.length} user(s) selected
            </span>
          </div>
          <Button
            onClick={() => setShowBulkDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Bulk Actions
          </Button>
          <Button variant="outline" onClick={() => setSelectedUsers([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription>
            Manage user accounts and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users.data}
            searchKey="email"
            searchPlaceholder="Search users..."
            enableRowSelection={true}
            onRowSelectionChange={setSelectedUsers}
            pageSize={filters.limit}
          />
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedUsers={selectedUsers}
        onConfirm={handleBulkAction}
      />
    </div>
  );
}
