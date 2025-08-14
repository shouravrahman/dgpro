#!/usr/bin/env tsx
// Database Migration Script
// Run pending migrations against the database

import { migrationCLI } from '../lib/database/migrations';

async function main() {
    console.log('🚀 Running database migrations...\n');

    try {
        await migrationCLI.migrate();
        console.log('\n✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

main();