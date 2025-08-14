# Database Migration Guide

This guide explains how to apply the database migrations to your Supabase instance.

## Migration Files

The following migration files need to be applied in order:

1. `20241214000001_initial_schema.sql` - Core database schema
2. `20241214000002_admin_and_features.sql` - Admin panel and advanced features
3. `20241214000003_rls_policies.sql` - Row Level Security policies
4. `20241214000004_seed_data.sql` - Development seed data
5. `20241214000005_rpc_functions.sql` - RPC functions for atomic operations

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Execute each migration one by one

### Option 2: Using Supabase CLI (if you have it set up)

```bash
# Link your project (replace with your project ref)
npx supabase link --project-ref yasvcnrijboilthxtknc

# Push migrations
npx supabase db push
```

### Option 3: Manual SQL Execution

You can also execute the SQL directly using any PostgreSQL client connected to your Supabase database.

## Verification

After applying all migrations, you should have:

- ✅ 30+ tables created with proper relationships
- ✅ Row Level Security policies enabled
- ✅ Sample data populated (categories, settings, etc.)
- ✅ RPC functions for atomic operations
- ✅ Proper indexes for performance

## Database Schema Overview

### Core Tables

- `users` - User accounts and profiles
- `products` - Digital products
- `product_categories` - Product categorization
- `marketplace_listings` - Marketplace entries

### E-commerce Tables

- `shopping_carts` & `cart_items` - Shopping cart functionality
- `sales_transactions` - Purchase records
- `coupons` & `coupon_usage` - Discount system

### Social Features

- `user_follows` - User following system
- `product_likes` - Product likes/favorites
- `product_reviews` - Product reviews and ratings

### Admin & Analytics

- `admin_users` - Admin user management
- `audit_logs` - System audit trail
- `market_trends` - Market analysis data
- `scraped_products` - Competitor analysis

### Communication

- `notifications` - User notifications
- `email_campaigns` - Email marketing
- `webhooks` - API webhooks

## Next Steps

After applying migrations:

1. Test the database connection in your app
2. Verify RLS policies are working
3. Check that sample data is populated
4. Run the test suite: `npm test`

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are set correctly
2. Ensure your Supabase service role key has the necessary permissions
3. Apply migrations in the correct order
4. Check the Supabase logs for detailed error messages

## Database Services

The application uses a service-based architecture:

- `UserService` - User operations and social features
- `ProductService` - Product CRUD and interactions
- `CategoryService` - Category management
- `MarketplaceService` - Marketplace listings
- `CartService` - Shopping cart operations

Example usage:

```typescript
import { createDatabaseService } from '@/lib/database';

const db = await createDatabaseService();

// Get user with profile
const user = await db.users.getUser('user-id');

// Get products with filters
const products = await db.products.getProducts({
  status: 'published',
  featured: true,
  limit: 10,
});

// Get categories
const categories = await db.categories.getCategories();
```
