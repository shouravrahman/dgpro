#!/usr/bin/env tsx
// Database Status Script
// Check the current status of database migrations

import { migrationCLI } from '../lib/database/migrations';

async function main() {
    console.log('📊 Checking database migration status...\n');

    try {
        await migrationCLI.status();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to get status:', error);
        process.exit(1);
    }
}

main();