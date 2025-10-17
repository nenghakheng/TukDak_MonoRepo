"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const database_service_1 = require("./database.service");
class MigrationRunner {
    constructor() {
        this.dbService = database_service_1.DatabaseService.getInstance();
        this.migrationsDir = path.join(process.cwd(), 'database', 'migrations');
    }
    async init() {
        await this.dbService.initialize();
        const db = this.dbService.getConnection().getDatabase();
        db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    async getAppliedMigrations() {
        const db = this.dbService.getConnection().getDatabase();
        const migrations = db.prepare('SELECT * FROM migrations ORDER BY id').all();
        return migrations;
    }
    async getMigrationFiles() {
        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
            console.log(`📁 Created migrations directory: ${this.migrationsDir}`);
            // Create safer migration that checks for column existence
            const sampleMigration = `-- Migration: Add search optimization indexes
-- Created: ${new Date().toISOString()}
-- Description: Adds search indexes and english_name/khmer_name columns for guest search functionality

-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- These will be handled by the migration runner to ignore duplicate column errors

-- Add new columns for search functionality
ALTER TABLE guestlist ADD COLUMN english_name TEXT;
ALTER TABLE guestlist ADD COLUMN khmer_name TEXT;

-- Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_guestlist_guest_id_lower ON guestlist (LOWER(guest_id));
CREATE INDEX IF NOT EXISTS idx_guestlist_name_lower ON guestlist (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_guestlist_english_name_lower ON guestlist (LOWER(english_name));
CREATE INDEX IF NOT EXISTS idx_guestlist_khmer_name_lower ON guestlist (LOWER(khmer_name));
CREATE INDEX IF NOT EXISTS idx_guestlist_is_duplicate ON guestlist (is_duplicate);
CREATE INDEX IF NOT EXISTS idx_guestlist_created_at ON guestlist (created_at);

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_guestlist_search_active ON guestlist (is_duplicate, created_at) WHERE is_duplicate = 0;
CREATE INDEX IF NOT EXISTS idx_guestlist_guest_of_active ON guestlist (guest_of, is_duplicate) WHERE is_duplicate = 0;
CREATE INDEX IF NOT EXISTS idx_guestlist_payment_method ON guestlist (payment_method);
`;
            fs.writeFileSync(path.join(this.migrationsDir, '001_add_search_optimization.sql'), sampleMigration);
            console.log('📝 Created sample migration file');
        }
        const files = fs.readdirSync(this.migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        return files;
    }
    async runMigrations() {
        await this.init();
        const appliedMigrations = await this.getAppliedMigrations();
        const migrationFiles = await this.getMigrationFiles();
        const appliedFilenames = appliedMigrations.map(m => m.filename);
        console.log('🔄 Starting database migrations...');
        console.log(`📁 Found ${migrationFiles.length} migration files`);
        console.log(`✅ Already applied: ${appliedMigrations.length} migrations`);
        let applied = 0;
        for (const filename of migrationFiles) {
            if (!appliedFilenames.includes(filename)) {
                await this.runSingleMigration(filename);
                applied++;
            }
            else {
                console.log(`⏭️  Skipping ${filename} (already applied)`);
            }
        }
        if (applied === 0) {
            console.log('✅ No new migrations to apply');
        }
        else {
            console.log(`✅ Applied ${applied} new migrations successfully!`);
        }
    }
    async runSingleMigration(filename) {
        const db = this.dbService.getConnection().getDatabase();
        const migrationPath = path.join(this.migrationsDir, filename);
        try {
            console.log(`🔄 Running migration: ${filename}`);
            const sql = fs.readFileSync(migrationPath, 'utf8');
            // Split SQL into individual statements
            const statements = sql
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            const transaction = db.transaction(() => {
                for (const statement of statements) {
                    try {
                        db.exec(statement);
                    }
                    catch (error) {
                        // Handle expected errors gracefully
                        if (error.message.includes('duplicate column name')) {
                            console.log(`⚠️  Column already exists, skipping: ${statement.substring(0, 50)}...`);
                            continue;
                        }
                        if (error.message.includes('already exists')) {
                            console.log(`⚠️  Object already exists, skipping: ${statement.substring(0, 50)}...`);
                            continue;
                        }
                        throw error;
                    }
                }
                // Record that this migration was applied
                db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(filename);
            });
            transaction();
            console.log(`✅ Successfully applied: ${filename}`);
        }
        catch (error) {
            console.error(`❌ Failed to apply migration ${filename}:`, error);
            throw error;
        }
    }
    async rollbackLastMigration() {
        await this.init();
        const appliedMigrations = await this.getAppliedMigrations();
        if (appliedMigrations.length === 0) {
            console.log('No migrations to rollback');
            return;
        }
        const lastMigration = appliedMigrations[appliedMigrations.length - 1];
        console.log(`🔄 Rolling back migration: ${lastMigration.filename}`);
        const db = this.dbService.getConnection().getDatabase();
        db.prepare('DELETE FROM migrations WHERE filename = ?').run(lastMigration.filename);
        console.log(`✅ Rolled back: ${lastMigration.filename}`);
        console.log('⚠️  Note: You may need to manually undo schema changes');
    }
    async cleanup() {
        await this.dbService.close();
    }
}
exports.MigrationRunner = MigrationRunner;
// CLI usage
async function main() {
    const runner = new MigrationRunner();
    try {
        const command = process.argv[2];
        switch (command) {
            case 'up':
                await runner.runMigrations();
                break;
            case 'rollback':
                await runner.rollbackLastMigration();
                break;
            default:
                console.log('Usage: npm run migrate [up|rollback]');
                console.log('  up       - Run pending migrations');
                console.log('  rollback - Rollback last migration');
                process.exit(1);
        }
        await runner.cleanup();
        console.log('🎉 Migration process completed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        try {
            await runner.cleanup();
        }
        catch (cleanupError) {
            console.error('❌ Cleanup failed:', cleanupError);
        }
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=migrations.js.map