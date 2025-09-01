'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useAffiliatePayouts, useAffiliateStats } from '@/hooks/useAffiliate';
import { payoutRequestSchema } from '@/lib/validations/affiliate';
import type { PayoutRequestInput } from '@/lib/validations/affiliate';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function PayoutHistory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { payouts, isLoading, error, requestPayout, isRequesting } =
    useAffiliatePayouts();
  const { data: statsData } = useAffiliateStats();

  const form = useForm<PayoutRequestInput>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      payoutMethod: 'paypal',
      payoutDetails: {},
    },
  });

  const onSubmit = (data: PayoutRequestInput) => {
    requestPayout(data, {
      onSuccess: () => {
        toast.success('Payout request submitted successfully!');
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to request payout');
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const payoutMethod = form.watch('payoutMethod');
  const availableBalance = statsData?.stats?.totalEarnings || 0;
  const minimumPayout = 50;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load payout history</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance and Request Payout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Available Balance
            </CardTitle>
            <CardDescription>
              Your current earnings available for payout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${availableBalance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Minimum payout: ${minimumPayout}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>Request a payout of your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={availableBalance < minimumPayout}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Submit a payout request for your affiliate earnings
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={minimumPayout}
                      max={availableBalance}
                      placeholder={`Min: $${minimumPayout}`}
                      {...form.register('amount', { valueAsNumber: true })}
                    />
                    {form.formState.errors.amount && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payoutMethod">Payout Method</Label>
                    <Select
                      value={payoutMethod}
                      onValueChange={(value) =>
                        form.setValue('payoutMethod', value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payout Details */}
                  {payoutMethod === 'paypal' && (
                    <div className="space-y-2">
                      <Label htmlFor="paypalEmail">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        placeholder="your-email@example.com"
                        onChange={(e) =>
                          form.setValue('payoutDetails', {
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {payoutMethod === 'bank_transfer' && (
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Account number"
                        onChange={(e) =>
                          form.setValue('payoutDetails', {
                            ...form.getValues('payoutDetails'),
                            accountNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Payouts are processed within 3-5 business days. You'll
                      receive an email confirmation once processed.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isRequesting}
                      className="flex-1"
                    >
                      {isRequesting ? 'Requesting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {availableBalance < minimumPayout && (
              <p className="text-sm text-gray-600 mt-2">
                You need ${(minimumPayout - availableBalance).toFixed(2)} more
                to request a payout
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payout History
          </CardTitle>
          <CardDescription>
            View all your payout requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payouts yet
              </h3>
              <p className="text-gray-600">
                Your payout requests will appear here once you submit them.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            ${payout.amount.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {payout.payoutMethod.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payout.status)}
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDistanceToNow(new Date(payout.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {payout.processedAt
                          ? formatDistanceToNow(new Date(payout.processedAt), {
                              addSuffix: true,
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
