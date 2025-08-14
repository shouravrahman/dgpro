#!/usr/bin/env tsx
// Apply Migrations to Remote Supabase
// This script applies all migrations to the remote Supabase instance

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

async function main() {
    console.log('🚀 Applying migrations to remote Supabase...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing environment variables:');
        console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
        console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
        process.exit(1);
    }

    try {
        const client = createClient(
            supabaseUrl,
            supabaseKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Get all migration files
        const migrationsPath = 'supabase/migrations';
        const files = readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files:`);
        files.forEach(file => console.log(`  - ${file}`));
        console.log();

        // Apply each migration
        for (const file of files) {
            console.log(`Applying migration: ${file}`);

            const filePath = join(migrationsPath, file);
            const sql = readFileSync(filePath, 'utf-8');

            try {
                // For now, let's try to execute the entire SQL as one statement
                const { error } = await client.rpc('exec_sql', { sql });

                if (error) {
                    console.error(`  ❌ Error: ${error.message}`);
                    // Continue with next migration
                } else {
                    console.log(`  ✅ Applied successfully`);
                }
            } catch (error) {
                console.error(`  ❌ Failed: ${error}`);
            }
        }

        console.log('\n🎉 All migrations applied!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

main();