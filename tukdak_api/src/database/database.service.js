"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const tslib_1 = require("tslib");
const better_sqlite3_1 = tslib_1.__importDefault(require("better-sqlite3"));
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
class DatabaseService {
    constructor() {
        this.db = null;
        // Use data directory for database file
        const dataDir = path.join(process.cwd(), 'data');
        this.dbPath = path.join(dataDir, 'tukdak.db');
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async initialize() {
        console.log('🔄 Initializing database...');
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
                console.log('📁 Created data directory');
            }
            // Create database connection
            this.db = new better_sqlite3_1.default(this.dbPath);
            // Configure SQLite for better performance
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('cache_size = 1000');
            this.db.pragma('temp_store = memory');
            this.db.pragma('foreign_keys = ON');
            console.log(`📊 Database connected: ${this.dbPath}`);
            // Create tables if they don't exist
            await this.createTables();
            console.log('✅ Database initialization completed');
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
    async createTables() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const createTablesSQL = `
      -- Create guestlist table
      CREATE TABLE IF NOT EXISTS guestlist (
        guest_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        english_name TEXT,
        khmer_name TEXT,
        amount_khr REAL DEFAULT 0,
        amount_usd REAL DEFAULT 0,
        payment_method TEXT CHECK (payment_method IN ('QR_Code', 'Cash')) NULL,
        guest_of TEXT NOT NULL CHECK (guest_of IN ('Bride', 'Groom', 'Bride_Parents', 'Groom_Parents')),
        is_duplicate INTEGER DEFAULT 0 CHECK (is_duplicate IN (0, 1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create activity_logs table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'payment_received', 'duplicate_marked', 'duplicate_resolved', 'searched')),
        old_amount_khr REAL,
        new_amount_khr REAL,
        old_amount_usd REAL,
        new_amount_usd REAL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create error_logs table
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        request_path TEXT,
        request_method TEXT,
        user_agent TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved INTEGER DEFAULT 0
      );

      -- Create basic indexes
      CREATE INDEX IF NOT EXISTS idx_guestlist_guest_of ON guestlist (guest_of);
      CREATE INDEX IF NOT EXISTS idx_guestlist_payment_method ON guestlist (payment_method);
      CREATE INDEX IF NOT EXISTS idx_guestlist_is_duplicate ON guestlist (is_duplicate);
      CREATE INDEX IF NOT EXISTS idx_guestlist_created_at ON guestlist (created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_guest_id ON activity_logs (guest_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs (timestamp);
    `;
        // Execute all table creation statements
        this.db.exec(createTablesSQL);
        console.log('📋 Database tables created/verified');
    }
    getConnection() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return {
            getDatabase: () => this.db
        };
    }
    async healthCheck() {
        try {
            if (!this.db) {
                return {
                    connected: false,
                    tablesExist: false,
                    recordCount: 0,
                    databaseSize: '0 KB'
                };
            }
            // Check if database is responsive
            const testQuery = this.db.prepare('SELECT 1 as test').get();
            const connected = testQuery.test === 1;
            // Check if main tables exist
            const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('guestlist', 'activity_logs', 'error_logs')
      `).all();
            const tablesExist = tables.length === 3;
            // Get record count
            let recordCount = 0;
            if (tablesExist) {
                const countResult = this.db.prepare('SELECT COUNT(*) as count FROM guestlist').get();
                recordCount = countResult.count;
            }
            // Get database file size
            let databaseSize = '0 KB';
            try {
                const stats = fs.statSync(this.dbPath);
                const sizeInKB = Math.round(stats.size / 1024);
                databaseSize = `${sizeInKB} KB`;
            }
            catch (error) {
                console.warn('Could not get database file size:', error);
            }
            return {
                connected,
                tablesExist,
                recordCount,
                databaseSize
            };
        }
        catch (error) {
            console.error('Health check failed:', error);
            return {
                connected: false,
                tablesExist: false,
                recordCount: 0,
                databaseSize: '0 KB'
            };
        }
    }
    async close() {
        if (this.db) {
            try {
                this.db.close();
                this.db = null;
                console.log('📊 Database connection closed');
            }
            catch (error) {
                console.error('Error closing database:', error);
                throw error;
            }
        }
    }
    closeConnection() {
        if (this.db) {
            try {
                this.db.close();
                this.db = null;
                console.log('📊 Database connection closed');
            }
            catch (error) {
                console.error('Error closing database:', error);
            }
        }
    }
    // Backup functionality
    async createBackup(backupPath) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const defaultBackupPath = path.join(path.dirname(this.dbPath), `backup_${timestamp}.db`);
        const finalBackupPath = backupPath || defaultBackupPath;
        try {
            // Use SQLite backup API
            this.db.backup(finalBackupPath);
            console.log(`💾 Database backup created: ${finalBackupPath}`);
            return finalBackupPath;
        }
        catch (error) {
            console.error('Backup creation failed:', error);
            throw error;
        }
    }
    // Get database statistics - Fixed with proper typing
    async getStatistics() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            // Properly type the guest statistics query
            const guestStats = this.db.prepare(`
        SELECT 
          COUNT(*) as total_guests,
          COALESCE(SUM(amount_khr), 0) as total_khr,
          COALESCE(SUM(amount_usd), 0) as total_usd,
          COUNT(CASE WHEN amount_khr > 0 OR amount_usd > 0 THEN 1 END) as paid_guests,
          COUNT(CASE WHEN is_duplicate = 1 THEN 1 END) as duplicates
        FROM guestlist
      `).get();
            // Properly type the activity count query
            const activityCount = this.db.prepare('SELECT COUNT(*) as count FROM activity_logs').get();
            // Properly type the error count query
            const errorCount = this.db.prepare('SELECT COUNT(*) as count FROM error_logs WHERE resolved = 0').get();
            return {
                total_guests: guestStats.total_guests,
                total_khr: guestStats.total_khr,
                total_usd: guestStats.total_usd,
                paid_guests: guestStats.paid_guests,
                duplicates: guestStats.duplicates,
                activity_logs: activityCount.count,
                unresolved_errors: errorCount.count
            };
        }
        catch (error) {
            console.error('Failed to get database statistics:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map