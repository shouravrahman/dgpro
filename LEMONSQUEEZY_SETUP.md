# LemonSqueezy Payment Integration Setup

This document explains how to set up and configure the LemonSqueezy payment integration for the AI Product Creator platform.

## Overview

The LemonSqueezy integration provides:

- Subscription management (Free and Pro tiers)
- One-time payments for featured listings
- Marketplace product sales
- Webhook handling for real-time updates
- Usage tracking and limits
- Refund and dispute management

## Prerequisites

1. **LemonSqueezy Account**: Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. **Store Setup**: Create a store in your LemonSqueezy dashboard
3. **Products**: Create products and variants for subscriptions and one-time purchases

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_lemonsqueezy_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_lemonsqueezy_webhook_secret
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com

# LemonSqueezy Product Variant IDs
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=your_pro_yearly_variant_id
LEMONSQUEEZY_FEATURED_DAILY_VARIANT_ID=your_featured_daily_variant_id
LEMONSQUEEZY_FEATURED_WEEKLY_VARIANT_ID=your_featured_weekly_variant_id
LEMONSQUEEZY_FEATURED_MONTHLY_VARIANT_ID=your_featured_monthly_variant_id
```

## LemonSqueezy Dashboard Setup

### 1. Create Products

Create the following products in your LemonSqueezy store:

#### Pro Subscription

- **Product Name**: AI Product Creator Pro
- **Type**: Subscription
- **Variants**:
  - Monthly: $29/month
  - Yearly: $290/year (17% discount)

#### Featured Listings

- **Product Name**: Featured Product Listing
- **Type**: One-time purchase
- **Variants**:
  - Daily: $10
  - Weekly: $50
  - Monthly: $150

### 2. Configure Webhooks

1. Go to Settings → Webhooks in your LemonSqueezy dashboard
2. Add a new webhook endpoint: `https://yourdomain.com/api/webhooks/lemonsqueezy`
3. Select the following events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_paused`
   - `subscription_unpaused`
   - `subscription_payment_failed`
   - `subscription_payment_success`
   - `subscription_payment_recovered`
   - `order_created`
   - `order_refunded`
4. Set the webhook secret and add it to your environment variables

### 3. Get API Keys

1. Go to Settings → API in your LemonSqueezy dashboard
2. Create a new API key with the following permissions:
   - Read/Write access to subscriptions
   - Read/Write access to customers
   - Read access to orders
   - Read access to products and variants
3. Add the API key to your environment variables

## Database Migration

Run the database migration to add payment-related tables:

```bash
npm run db:migrate
```

This will create the following tables:

- `subscription_events` - Audit trail for subscription changes
- `orders` - Order tracking and history
- `payment_methods` - Customer payment methods (future use)
- `invoices` - Invoice management (future use)

It will also add payment-related columns to the `users` table for subscription tracking and usage limits.

## Usage

### Frontend Components

#### Subscription Management

```tsx
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';

export default function BillingPage() {
  return (
    <div>
      <h1>Billing & Subscription</h1>
      <SubscriptionManager />
    </div>
  );
}
```

#### Usage Tracking Hook

```tsx
import { useSubscription } from '@/hooks/useSubscription';

export default function Dashboard() {
  const { isSubscribed, billing, checkUsageLimit, upgradeToProPlan } =
    useSubscription();

  const aiUsage = checkUsageLimit('aiRequests');

  if (!aiUsage.canUse) {
    return <div>AI request limit reached. Please upgrade to Pro.</div>;
  }

  return <div>Dashboard content...</div>;
}
```

### Backend Usage Limits

#### Check Usage Before Operations

```typescript
import { withUsageCheck } from '@/lib/usage-limits';

export async function POST(request: NextRequest) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return withUsageCheck(user.id, 'ai_requests', async () => {
    // Perform AI operation
    const result = await aiAgent.process(input);
    return NextResponse.json({ result });
  });
}
```

#### Manual Usage Tracking

```typescript
import { incrementUsage, checkUsageLimit } from '@/lib/usage-limits';

// Check if user can perform action
const usageCheck = await checkUsageLimit(userId, 'products', 1);
if (!usageCheck.canUse) {
  throw new Error('Product limit reached');
}

// Perform action
await createProduct(productData);

// Increment usage
await incrementUsage(userId, 'products', 1);
```

## API Endpoints

### Subscription Management

- `GET /api/subscriptions` - Get user's subscription details
- `POST /api/subscriptions` - Create checkout session for subscription
- `PUT /api/subscriptions` - Update existing subscription
- `DELETE /api/subscriptions` - Cancel subscription
- `POST /api/subscriptions/pause` - Pause subscription
- `POST /api/subscriptions/resume` - Resume subscription

### Billing & Orders

- `GET /api/billing` - Get billing information and usage
- `GET /api/orders` - Get order history
- `GET /api/orders/[id]` - Get specific order details

### Webhooks

- `POST /api/webhooks/lemonsqueezy` - Handle LemonSqueezy webhooks

## Subscription Tiers

### Free Tier

- 10 AI requests per month
- 3 products
- 1 marketplace listing
- 5 file uploads
- 100MB storage
- Basic support

### Pro Tier ($29/month or $290/year)

- Unlimited AI requests
- Unlimited products
- Unlimited marketplace listings
- Unlimited file uploads
- 10GB storage
- Priority support
- Advanced analytics
- Custom branding
- Bulk operations

## Testing

### Unit Tests

```bash
# Test LemonSqueezy client
npm test -- src/lib/lemonsqueezy/__tests__/client.test.ts

# Test webhook handling
npm test -- src/app/api/webhooks/lemonsqueezy/__tests__/webhook.test.ts
```

### Webhook Testing

Use tools like ngrok to expose your local development server for webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in your LemonSqueezy webhook settings
# https://abc123.ngrok.io/api/webhooks/lemonsqueezy
```

## Error Handling

The integration includes comprehensive error handling:

- **Usage Limit Errors**: Thrown when users exceed their tier limits
- **Payment Failures**: Handled via webhooks with automatic retries
- **Webhook Verification**: All webhooks are verified using HMAC signatures
- **API Errors**: Proper error responses with detailed messages

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using HMAC signatures
2. **Environment Variables**: Sensitive data is stored in environment variables
3. **Rate Limiting**: API endpoints include rate limiting
4. **Input Validation**: All inputs are validated using Zod schemas
5. **RLS Policies**: Database access is protected with Row Level Security

## Monitoring

Monitor the following metrics:

- Subscription creation/cancellation rates
- Payment failure rates
- Usage limit violations
- Webhook delivery success rates
- API response times

## Support

For issues with the LemonSqueezy integration:

1. Check the webhook logs in your LemonSqueezy dashboard
2. Review the application logs for error messages
3. Verify environment variables are correctly set
4. Test webhook endpoints using the LemonSqueezy webhook tester

## Next Steps

After setting up the basic integration, consider implementing:

1. Advanced analytics and reporting
2. Custom pricing plans
3. Enterprise features
4. Multi-currency support
5. Tax handling for different regions
