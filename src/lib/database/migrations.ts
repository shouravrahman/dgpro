// Database Migration Management
// Handles running, rolling back, and managing database migrations

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Database } from '@/types/database';

interface Migration {
    id: string;
    name: string;
    filename: string;
    sql: string;
    applied_at?: string;
    checksum: string;
}

interface MigrationResult {
    success: boolean;
    migration: Migration;
    error?: string;
    duration: number;
}

export class MigrationManager {
    private client: ReturnType<typeof createClient<Database>>;
    private migrationsPath: string;

    constructor(migrationsPath = 'supabase/migrations') {
        this.client = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
        this.migrationsPath = migrationsPath;
    }

    // Initialize migration tracking table
    async initializeMigrationTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON _migrations(applied_at);
    `;

        const { error } = await this.client.rpc('exec_sql', { sql });
        if (error) {
            throw new Error(`Failed to initialize migration table: ${error.message}`);
        }
    }

    // Get all migration files from the migrations directory
    private getMigrationFiles(): Migration[] {
        try {
            const files = readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.sql'))
                .sort();

            return files.map(filename => {
                const filepath = join(this.migrationsPath, filename);
                const sql = readFileSync(filepath, 'utf-8');
                const id = filename.replace('.sql', '');
                const name = this.extractMigrationName(filename);
                const checksum = this.calculateChecksum(sql);

                return {
                    id,
                    name,
                    filename,
                    sql,
                    checksum,
                };
            });
        } catch (error) {
            throw new Error(`Failed to read migration files: ${error}`);
        }
    }

    // Extract migration name from filename
    private extractMigrationName(filename: string): string {
        // Extract name from format: YYYYMMDDHHMMSS_migration_name.sql
        const parts = filename.replace('.sql', '').split('_');
        if (parts.length > 1) {
            return parts.slice(1).join('_').replace(/_/g, ' ');
        }
        return filename.replace('.sql', '');
    }

    // Calculate checksum for migration content
    private calculateChecksum(content: string): string {
        // Simple checksum calculation (in production, use crypto.createHash)
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Get applied migrations from database
    async getAppliedMigrations(): Promise<Migration[]> {
        const { data, error } = await this.client
            .from('_migrations' as any)
            .select('*')
            .order('applied_at');

        if (error) {
            throw new Error(`Failed to get applied migrations: ${error.message}`);
        }

        return data || [];
    }

    // Get pending migrations
    async getPendingMigrations(): Promise<Migration[]> {
        const allMigrations = this.getMigrationFiles();
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedIds = new Set(appliedMigrations.map(m => m.id));

        return allMigrations.filter(migration => !appliedIds.has(migration.id));
    }

    // Validate migration integrity
    async validateMigrations(): Promise<{ valid: boolean; issues: string[] }> {
        const issues: string[] = [];
        const allMigrations = this.getMigrationFiles();
        const appliedMigrations = await this.getAppliedMigrations();

        // Check for checksum mismatches
        for (const applied of appliedMigrations) {
            const current = allMigrations.find(m => m.id === applied.id);
            if (current && current.checksum !== applied.checksum) {
                issues.push(`Migration ${applied.id} has been modified after application`);
            }
        }

        // Check for missing migration files
        for (const applied of appliedMigrations) {
            const exists = allMigrations.some(m => m.id === applied.id);
            if (!exists) {
                issues.push(`Applied migration ${applied.id} file is missing`);
            }
        }

        return {
            valid: issues.length === 0,
            issues,
        };
    }

    // Run a single migration
    async runMigration(migration: Migration): Promise<MigrationResult> {
        const startTime = Date.now();

        try {
            // Execute migration SQL
            const { error: sqlError } = await this.client.rpc('exec_sql', {
                sql: migration.sql,
            });

            if (sqlError) {
                throw new Error(sqlError.message);
            }

            // Record migration as applied
            const { error: recordError } = await this.client
                .from('_migrations' as any)
                .insert({
                    id: migration.id,
                    name: migration.name,
                    filename: migration.filename,
                    checksum: migration.checksum,
                });

            if (recordError) {
                throw new Error(`Failed to record migration: ${recordError.message}`);
            }

            const duration = Date.now() - startTime;

            return {
                success: true,
                migration,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;

            return {
                success: false,
                migration,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
            };
        }
    }

    // Run all pending migrations
    async runPendingMigrations(): Promise<MigrationResult[]> {
        await this.initializeMigrationTable();

        const pendingMigrations = await this.getPendingMigrations();
        const results: MigrationResult[] = [];

        console.log(`Found ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            console.log(`Running migration: ${migration.name}`);
            const result = await this.runMigration(migration);
            results.push(result);

            if (!result.success) {
                console.error(`Migration failed: ${result.error}`);
                break; // Stop on first failure
            } else {
                console.log(`Migration completed in ${result.duration}ms`);
            }
        }

        return results;
    }

    // Rollback a specific migration
    async rollbackMigration(migrationId: string): Promise<MigrationResult> {
        const startTime = Date.now();

        try {
            // Check if migration exists and is applied
            const { data: applied, error: checkError } = await this.client
                .from('_migrations' as any)
                .select('*')
                .eq('id', migrationId)
                .single();

            if (checkError || !applied) {
                throw new Error(`Migration ${migrationId} is not applied`);
            }

            // Look for rollback SQL file
            const rollbackFilename = `${migrationId}_rollback.sql`;
            const rollbackPath = join(this.migrationsPath, rollbackFilename);

            let rollbackSql: string;
            try {
                rollbackSql = readFileSync(rollbackPath, 'utf-8');
            } catch {
                throw new Error(`Rollback file not found: ${rollbackFilename}`);
            }

            // Execute rollback SQL
            const { error: sqlError } = await this.client.rpc('exec_sql', {
                sql: rollbackSql,
            });

            if (sqlError) {
                throw new Error(sqlError.message);
            }

            // Remove migration record
            const { error: deleteError } = await this.client
                .from('_migrations' as any)
                .delete()
                .eq('id', migrationId);

            if (deleteError) {
                throw new Error(`Failed to remove migration record: ${deleteError.message}`);
            }

            const duration = Date.now() - startTime;

            return {
                success: true,
                migration: applied,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;

            return {
                success: false,
                migration: { id: migrationId } as Migration,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
            };
        }
    }

    // Get migration status
    async getMigrationStatus(): Promise<{
        total: number;
        applied: number;
        pending: number;
        lastApplied?: Migration;
    }> {
        const allMigrations = this.getMigrationFiles();
        const appliedMigrations = await this.getAppliedMigrations();
        const pendingMigrations = await this.getPendingMigrations();

        return {
            total: allMigrations.length,
            applied: appliedMigrations.length,
            pending: pendingMigrations.length,
            lastApplied: appliedMigrations[appliedMigrations.length - 1],
        };
    }

    // Create a new migration file
    createMigration(name: string, sql: string): string {
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
        const filepath = join(this.migrationsPath, filename);

        try {
            const fs = require('fs');
            fs.writeFileSync(filepath, sql);
            return filename;
        } catch (error) {
            throw new Error(`Failed to create migration file: ${error}`);
        }
    }

    // Generate migration from schema diff
    async generateMigration(name: string, targetSchema: any): Promise<string> {
        // This would compare current schema with target schema
        // and generate the necessary SQL to migrate between them
        // For now, this is a placeholder implementation

        const sql = `-- Migration: ${name}
-- Generated at: ${new Date().toISOString()}

-- Add your migration SQL here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
-- CREATE INDEX idx_users_new_field ON users(new_field);
`;

        return this.createMigration(name, sql);
    }
}

// CLI-like interface for migration management
export class MigrationCLI {
    private manager: MigrationManager;

    constructor(migrationsPath?: string) {
        this.manager = new MigrationManager(migrationsPath);
    }

    async status(): Promise<void> {
        try {
            const status = await this.manager.getMigrationStatus();
            const validation = await this.manager.validateMigrations();

            console.log('Migration Status:');
            console.log(`  Total migrations: ${status.total}`);
            console.log(`  Applied: ${status.applied}`);
            console.log(`  Pending: ${status.pending}`);

            if (status.lastApplied) {
                console.log(`  Last applied: ${status.lastApplied.name} (${status.lastApplied.applied_at})`);
            }

            if (!validation.valid) {
                console.log('\nValidation Issues:');
                validation.issues.forEach(issue => console.log(`  - ${issue}`));
            } else {
                console.log('\nAll migrations are valid ✓');
            }
        } catch (error) {
            console.error('Failed to get migration status:', error);
        }
    }

    async migrate(): Promise<void> {
        try {
            const results = await this.manager.runPendingMigrations();

            if (results.length === 0) {
                console.log('No pending migrations');
                return;
            }

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            console.log(`\nMigration Summary:`);
            console.log(`  Successful: ${successful}`);
            console.log(`  Failed: ${failed}`);

            if (failed > 0) {
                console.log('\nFailed migrations:');
                results
                    .filter(r => !r.success)
                    .forEach(r => console.log(`  - ${r.migration.name}: ${r.error}`));
            }
        } catch (error) {
            console.error('Migration failed:', error);
        }
    }

    async rollback(migrationId: string): Promise<void> {
        try {
            const result = await this.manager.rollbackMigration(migrationId);

            if (result.success) {
                console.log(`Successfully rolled back migration: ${migrationId}`);
            } else {
                console.error(`Rollback failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Rollback failed:', error);
        }
    }

    async create(name: string): Promise<void> {
        try {
            const filename = this.manager.createMigration(name, '-- Add your migration SQL here\n');
            console.log(`Created migration: ${filename}`);
        } catch (error) {
            console.error('Failed to create migration:', error);
        }
    }
}

// Export singleton instances
export const migrationManager = new MigrationManager();
export const migrationCLI = new MigrationCLI();