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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { affiliateRegistrationSchema } from '@/lib/validations/affiliate';
import type { AffiliateRegistrationInput } from '@/lib/validations/affiliate';
import { toast } from 'sonner';

export function AffiliateRegistration() {
  const { createAffiliate, isCreating } = useAffiliate();
  const [agreed, setAgreed] = useState(false);

  const form = useForm<AffiliateRegistrationInput>({
    resolver: zodResolver(affiliateRegistrationSchema),
    defaultValues: {
      payoutMethod: 'paypal',
      payoutDetails: {},
    },
  });

  const onSubmit = (data: AffiliateRegistrationInput) => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    createAffiliate(data, {
      onSuccess: () => {
        toast.success('Affiliate account created successfully!');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create affiliate account');
      },
    });
  };

  const payoutMethod = form.watch('payoutMethod');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Join Our Affiliate Program
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Earn money by referring customers to our platform. Get up to 10%
          commission on every sale you generate.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>High Commissions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Earn up to 10% commission on every sale. The more you sell, the
              more you earn.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle>Easy Referrals</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Share your unique link and start earning. No complex setup
              required.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle>Real-time Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Monitor your performance with detailed analytics and real-time
              reporting.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Affiliate Account</CardTitle>
          <CardDescription>
            Fill out the form below to get started with our affiliate program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payout Method */}
            <div className="space-y-2">
              <Label htmlFor="payoutMethod">Preferred Payout Method</Label>
              <Select
                value={payoutMethod}
                onValueChange={(value) =>
                  form.setValue('payoutMethod', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payout Details */}
            <div className="space-y-4">
              <Label>Payout Details</Label>

              {payoutMethod === 'paypal' && (
                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    onChange={(e) =>
                      form.setValue('payoutDetails', { email: e.target.value })
                    }
                  />
                </div>
              )}

              {payoutMethod === 'bank_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      placeholder="Routing number"
                      onChange={(e) =>
                        form.setValue('payoutDetails', {
                          ...form.getValues('payoutDetails'),
                          routingNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="Bank name"
                      onChange={(e) =>
                        form.setValue('payoutDetails', {
                          ...form.getValues('payoutDetails'),
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">
                      Account Holder Name
                    </Label>
                    <Input
                      id="accountHolderName"
                      placeholder="Full name"
                      onChange={(e) =>
                        form.setValue('payoutDetails', {
                          ...form.getValues('payoutDetails'),
                          accountHolderName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {payoutMethod === 'stripe' && (
                <div className="space-y-2">
                  <Label htmlFor="stripeEmail">Stripe Email</Label>
                  <Input
                    id="stripeEmail"
                    type="email"
                    placeholder="your-stripe-email@example.com"
                    onChange={(e) =>
                      form.setValue('payoutDetails', { email: e.target.value })
                    }
                  />
                </div>
              )}

              {payoutMethod === 'crypto' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cryptoType">Cryptocurrency</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue('payoutDetails', {
                          ...form.getValues('payoutDetails'),
                          cryptoType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      placeholder="Your wallet address"
                      onChange={(e) =>
                        form.setValue('payoutDetails', {
                          ...form.getValues('payoutDetails'),
                          walletAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Minimum payout is $50. Payouts are
                  processed monthly on the 15th. Commission rates may vary by
                  product category.
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the affiliate terms and conditions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By joining our affiliate program, you agree to our{' '}
                    <a
                      href="/affiliate-terms"
                      className="underline hover:text-primary"
                    >
                      terms and conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline hover:text-primary">
                      privacy policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating || !agreed}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Join Affiliate Program
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">How much can I earn?</h4>
            <p className="text-gray-600 text-sm">
              You can earn up to 10% commission on every sale. Top affiliates
              earn thousands of dollars per month.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">When do I get paid?</h4>
            <p className="text-gray-600 text-sm">
              Payouts are processed monthly on the 15th for all earnings above
              $50.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">How do I track my performance?</h4>
            <p className="text-gray-600 text-sm">
              Once approved, you'll have access to a comprehensive dashboard
              with real-time analytics, conversion tracking, and earnings
              reports.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
