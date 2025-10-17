"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const tslib_1 = require("tslib");
const better_sqlite3_1 = tslib_1.__importDefault(require("better-sqlite3"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const database_schema_1 = require("../src/schema/database-schema");
class DatabaseConnection {
    constructor(config) {
        this.db = null;
        this.isInitialized = false;
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            options: {
                verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
                fileMustExist: false,
            },
            ...config,
        };
    }
    static getInstance(config) {
        if (!DatabaseConnection.instance) {
            if (!config) {
                throw new Error('Database configuration required for first initialization');
            }
            DatabaseConnection.instance = new DatabaseConnection(config);
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (this.db && this.isInitialized) {
            return this.db;
        }
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`Database connection attempt ${attempt}/${this.config.maxRetries}`);
                // Ensure data directory exists
                const dataDir = path.dirname(this.config.filePath);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
                }
                // Create database connection
                this.db = new better_sqlite3_1.default(this.config.filePath, this.config.options);
                // Enable WAL mode for better concurrency
                this.db.pragma('journal_mode = WAL');
                // Enable foreign key constraints
                this.db.pragma('foreign_keys = ON');
                // Set busy timeout (30 seconds)
                this.db.pragma('busy_timeout = 30000');
                // Optimize for performance
                this.db.pragma('synchronous = NORMAL');
                this.db.pragma('cache_size = 10000');
                // Test connection
                this.db.prepare('SELECT 1').get();
                console.log(`✅ Database connected successfully on attempt ${attempt}`);
                if (!this.isInitialized) {
                    await this.initializeSchema();
                    this.isInitialized = true;
                }
                return this.db;
            }
            catch (error) {
                lastError = error;
                console.error(`❌ Database connection attempt ${attempt} failed:`, error);
                if (this.db) {
                    try {
                        this.db.close();
                    }
                    catch (closeError) {
                        console.error('Error closing database:', closeError);
                    }
                    this.db = null;
                }
                if (attempt < this.config.maxRetries) {
                    console.log(`Retrying in ${this.config.retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        throw new Error(`Failed to connect to database after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`);
    }
    async initializeSchema() {
        if (!this.db) {
            throw new Error('Database connection not established');
        }
        console.log('🔄 Initializing database schema...');
        // Create tables
        this.db.exec(database_schema_1.DATABASE_SCHEMA.GUESTLIST_TABLE);
        this.db.exec(database_schema_1.DATABASE_SCHEMA.ACTIVITY_LOGS_TABLE);
        this.db.exec(database_schema_1.DATABASE_SCHEMA.ERROR_LOGS_TABLE);
        // Create indexes
        database_schema_1.DATABASE_SCHEMA.INDEXES.forEach(indexSql => {
            this.db.exec(indexSql);
        });
        // Create triggers
        database_schema_1.DATABASE_SCHEMA.TRIGGERS.forEach(triggerSql => {
            this.db.exec(triggerSql);
        });
        console.log('✅ Database schema initialized successfully');
    }
    getDatabase() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }
    async close() {
        if (this.db) {
            try {
                this.db.close();
                console.log('✅ Database connection closed');
            }
            catch (error) {
                console.error('❌ Error closing database:', error);
                throw error;
            }
            finally {
                this.db = null;
                this.isInitialized = false;
            }
        }
    }
    // Health check method
    async healthCheck() {
        try {
            if (!this.db) {
                return { connected: false, tablesExist: false, error: 'No database connection' };
            }
            // Test basic query
            this.db.prepare('SELECT 1').get();
            // Check if tables exist
            const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('guestlist', 'activity_logs', 'error_logs')
      `).all();
            return {
                connected: true,
                tablesExist: tables.length === 3,
            };
        }
        catch (error) {
            return {
                connected: false,
                tablesExist: false,
                error: error.message,
            };
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
//# sourceMappingURL=connection.js.map