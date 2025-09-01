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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Scale, Plus, Eye, Calendar, MessageSquare } from 'lucide-react';
import { useDisputes, useCreateDispute } from '@/hooks/useLegal';

export function DisputeResolution() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: disputes, isLoading } = useDisputes();
  const createDispute = useCreateDispute();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'mediation':
        return 'secondary';
      case 'arbitration':
        return 'secondary';
      case 'open':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dispute Resolution</h2>
          <p className="text-muted-foreground">
            Manage legal disputes and resolution processes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File Dispute
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File New Dispute</DialogTitle>
              <DialogDescription>
                Start a formal dispute resolution process
              </DialogDescription>
            </DialogHeader>
            {/* Create form would go here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Disputes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Your Disputes
          </CardTitle>
          <CardDescription>
            All disputes you're involved in as complainant or respondent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disputes && disputes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">
                      {dispute.case_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dispute.dispute_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(dispute.status)}>
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* This would need user context to determine role */}
                      <Badge variant="secondary">Complainant</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No disputes filed</p>
              <p className="text-sm text-muted-foreground">
                Disputes will appear here when filed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Resolution Process */}
      <Card>
        <CardHeader>
          <CardTitle>Dispute Resolution Process</CardTitle>
          <CardDescription>
            How our dispute resolution system works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h4 className="font-medium mb-2">File Dispute</h4>
              <p className="text-sm text-muted-foreground">
                Submit your dispute with evidence and description
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h4 className="font-medium mb-2">Mediation</h4>
              <p className="text-sm text-muted-foreground">
                Attempt resolution through mediation process
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <h4 className="font-medium mb-2">Resolution</h4>
              <p className="text-sm text-muted-foreground">
                Final resolution or escalation to arbitration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
