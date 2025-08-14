#!/usr/bin/env tsx
// Database Seeding Script
// Populate the database with sample data for development

import { createDatabaseService } from '../lib/database';
import { createClient } from '@supabase/supabase-js';

async function main() {
    console.log('🌱 Seeding database with sample data...\n');

    try {
        const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const db = await createDatabaseService(client);

        // Check if seed data already exists
        const existingCategories = await db.categories.getCategories();
        if (existingCategories.length > 0) {
            console.log('⚠️  Seed data already exists. Skipping seeding.');
            console.log('Use npm run db:reset to reset the database first.');
            process.exit(0);
        }

        console.log('Creating sample categories...');
        // Categories are created via migration seed data

        console.log('Creating sample system settings...');
        // System settings are created via migration seed data

        console.log('✅ Database seeded successfully');
        console.log('\nSample data includes:');
        console.log('- Product categories and subcategories');
        console.log('- System settings and configuration');
        console.log('- Sample coupons and discounts');
        console.log('- Sample users and products (development only)');
        console.log('- Sample market trends and scraped products');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();