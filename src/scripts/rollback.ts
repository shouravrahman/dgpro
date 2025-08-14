#!/usr/bin/env tsx
// Database Rollback Script
// Rollback a specific migration

import { migrationCLI } from '../lib/database/migrations';

async function main() {
    const migrationId = process.argv[2];

    if (!migrationId) {
        console.error('❌ Please provide a migration ID to rollback');
        console.log('Usage: npm run db:rollback <migration-id>');
        process.exit(1);
    }

    console.log(`🔄 Rolling back migration: ${migrationId}\n`);

    try {
        await migrationCLI.rollback(migrationId);
        console.log('\n✅ Rollback completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Rollback failed:', error);
        process.exit(1);
    }
}

main();