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
import { Shield, Plus, AlertTriangle, Eye, Calendar } from 'lucide-react';
import {
  useCopyrightProtections,
  useCreateCopyrightProtection,
  useCopyrightViolations,
  useReportCopyrightViolation,
} from '@/hooks/useLegal';

export function CopyrightProtection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { data: protections, isLoading } = useCopyrightProtections();
  const { data: violations } = useCopyrightViolations();
  const createProtection = useCreateCopyrightProtection();
  const reportViolation = useReportCopyrightViolation();

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
          <h2 className="text-2xl font-bold">Copyright Protection</h2>
          <p className="text-muted-foreground">
            Protect your intellectual property and monitor for violations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Violation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Copyright Violation</DialogTitle>
                <DialogDescription>
                  Report unauthorized use of your copyrighted content
                </DialogDescription>
              </DialogHeader>
              {/* Report form would go here */}
            </DialogContent>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Protection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Copyright Protection</DialogTitle>
                <DialogDescription>
                  Add copyright protection to your product
                </DialogDescription>
              </DialogHeader>
              {/* Create form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Protected Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protected Products
          </CardTitle>
          <CardDescription>
            Products with active copyright protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {protections && protections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Protection Level</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Monitoring</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protections.map((protection) => (
                  <TableRow key={protection.id}>
                    <TableCell className="font-medium">
                      {protection.product_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {protection.protection_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {protection.registration_number ? (
                        <Badge variant="default">Registered</Badge>
                      ) : (
                        <Badge variant="outline">Unregistered</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          protection.monitoring_enabled
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {protection.monitoring_enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(protection.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No copyright protections yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add protection to secure your intellectual property
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Violations
          </CardTitle>
          <CardDescription>
            Reported copyright violations requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations && violations.length > 0 ? (
            <div className="space-y-4">
              {violations.slice(0, 5).map((violation) => (
                <div key={violation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">
                        {violation.violation_type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {violation.description}
                      </p>
                      {violation.violation_url && (
                        <p className="text-sm text-blue-600 mt-1">
                          {violation.violation_url}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        violation.status === 'resolved'
                          ? 'default'
                          : violation.status === 'investigating'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {violation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Reported{' '}
                      {new Date(violation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No violations reported</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
