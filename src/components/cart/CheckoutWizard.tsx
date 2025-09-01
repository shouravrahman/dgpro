'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShoppingCart,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  MapPin,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { checkoutFormSchema } from '@/lib/validations/cart';
import { formatCurrency } from '@/lib/utils';
import type { CheckoutFormInput, CheckoutStep } from '@/types/cart';

const CHECKOUT_STEPS: CheckoutStep[] = [
  {
    id: 'cart',
    title: 'Review Cart',
    description: 'Review your items and apply coupons',
    completed: false,
    current: false,
  },
  {
    id: 'billing',
    title: 'Billing Information',
    description: 'Enter your billing details',
    completed: false,
    current: false,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete your purchase',
    completed: false,
    current: false,
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Order confirmed',
    completed: false,
    current: false,
  },
];

interface CheckoutWizardProps {
  onClose?: () => void;
}

export function CheckoutWizard({ onClose }: CheckoutWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(CHECKOUT_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);

  const { cart, totalAmount, hasItems } = useCart();
  const { toast } = useToast();

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      billing_email: '',
      billing_name: '',
      billing_address: {
        name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
      },
      payment_method: 'card',
      save_address: false,
      terms_accepted: false,
    },
  });

  // Update step states
  useEffect(() => {
    setSteps((prev) =>
      prev.map((step, index) => ({
        ...step,
        completed: index < currentStep,
        current: index === currentStep,
      }))
    );
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (data: CheckoutFormInput) => {
    if (!cart) return;

    try {
      setIsProcessing(true);

      // Create checkout session
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cart.id,
          billing_email: data.billing_email,
          billing_name: data.billing_name,
          billing_address: data.billing_address,
          payment_method: data.payment_method,
          applied_coupons: [], // TODO: Get from cart state
          metadata: {
            save_address: data.save_address,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        nextStep(); // Move to confirmation
        toast({
          title: 'Order placed successfully!',
          description: 'You will receive a confirmation email shortly.',
        });
      } else {
        toast({
          title: 'Payment failed',
          description: result.error.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (!hasItems && currentStep === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Add some products to proceed with checkout
          </p>
          <Button onClick={onClose}>Continue Shopping</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.current
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <CartReviewStep />}
              {currentStep === 1 && <BillingStep form={form} />}
              {currentStep === 2 && <PaymentStep form={form} />}
              {currentStep === 3 && <ConfirmationStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>

      {/* Navigation */}
      {currentStep < 3 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep === 2 ? (
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Step Components
function CartReviewStep() {
  const { cart } = useCart();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Review Your Order</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-4 border rounded-lg"
            >
              <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h4 className="font-medium">
                  {item.product?.name || item.bundle?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BillingStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Billing Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="billing_email">Email Address</Label>
            <Input
              id="billing_email"
              type="email"
              {...form.register('billing_email')}
              className="mt-1"
            />
            {form.formState.errors.billing_email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.billing_email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="billing_name">Full Name</Label>
            <Input
              id="billing_name"
              {...form.register('billing_name')}
              className="mt-1"
            />
            {form.formState.errors.billing_name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.billing_name.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address_line_1">Address</Label>
          <Input
            id="address_line_1"
            {...form.register('billing_address.address_line_1')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
          <Input
            id="address_line_2"
            {...form.register('billing_address.address_line_2')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...form.register('billing_address.city')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...form.register('billing_address.state')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="postal_code">ZIP Code</Label>
            <Input
              id="postal_code"
              {...form.register('billing_address.postal_code')}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="save_address" {...form.register('save_address')} />
          <Label htmlFor="save_address" className="text-sm">
            Save this address for future orders
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Method</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">
            Payment processing is handled securely by LemonSqueezy
          </p>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">SSL Encrypted</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms_accepted" {...form.register('terms_accepted')} />
          <Label htmlFor="terms_accepted" className="text-sm">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
        {form.formState.errors.terms_accepted && (
          <p className="text-sm text-destructive">
            {form.formState.errors.terms_accepted.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ConfirmationStep() {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
        <p className="text-muted-foreground mb-4">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>
        <Button>View Order Details</Button>
      </CardContent>
    </Card>
  );
}

function OrderSummary() {
  const { cart, totalAmount } = useCart();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Instant digital delivery</p>
          <p>• 30-day money-back guarantee</p>
          <p>• Lifetime access to updates</p>
        </div>
      </CardContent>
    </Card>
  );
}
