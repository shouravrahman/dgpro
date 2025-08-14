#!/usr/bin/env tsx
// Database Reset Script
// Reset the database and run all migrations

import { execSync } from 'child_process';

async function main() {
    console.log('🔄 Resetting database...\n');

    try {
        console.log('Stopping Supabase...');
        execSync('supabase stop', { stdio: 'inherit' });

        console.log('Starting Supabase with reset...');
        execSync('supabase start', { stdio: 'inherit' });

        console.log('Running migrations...');
        execSync('npm run db:migrate', { stdio: 'inherit' });

        console.log('\n✅ Database reset completed successfully');
        console.log('You can now run "npm run db:seed" to add sample data');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database reset failed:', error);
        process.exit(1);
    }
}

main();