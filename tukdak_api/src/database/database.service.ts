import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { DATABASE_SCHEMA } from '../schema/database-schema';

export interface DatabaseHealth {
  connected: boolean;
  tablesExist: boolean;
  recordCount: number;
  lastBackup?: string;
  databaseSize: string;
}

// Add interface for database statistics
export interface GuestStatistics {
  total_guests: number;
  total_khr: number | null;
  total_usd: number | null;
  paid_guests: number;
  duplicates: number;
}

export interface DatabaseStatistics extends GuestStatistics {
  activity_logs: number;
  unresolved_errors: number;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor() {
    // Use data directory for database file
    const dataDir = path.join(process.cwd(), 'data');
    this.dbPath = path.join(dataDir, 'tukdak.db');
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    console.log('🔄 Initializing database...');
    
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
        console.log('📁 Created data directory');
      }

      // Create database connection
      this.db = new Database(this.dbPath);
      
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
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create tables using the updated schema
      this.db.exec(DATABASE_SCHEMA.GUESTLIST_TABLE);
      this.db.exec(DATABASE_SCHEMA.ACTIVITY_LOGS_TABLE);
      this.db.exec(DATABASE_SCHEMA.ERROR_LOGS_TABLE);

      // Create indexes
      DATABASE_SCHEMA.INDEXES.forEach(indexSql => {
        try {
          this.db!.exec(indexSql);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.warn('⚠️  Index creation warning:', error.message);
          }
        }
      });

      // Create triggers
      DATABASE_SCHEMA.TRIGGERS.forEach(triggerSql => {
        try {
          this.db!.exec(triggerSql);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.warn('⚠️  Trigger creation warning:', error.message);
          }
        }
      });

      console.log('📋 Database schema created/updated successfully');
    } catch (error) {
      console.error('❌ Failed to create database schema:', error);
      throw error;
    }
  }

  getConnection(): { getDatabase: () => Database.Database } {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    return {
      getDatabase: () => this.db!
    };
  }

  async healthCheck(): Promise<DatabaseHealth> {
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
      const testQuery = this.db.prepare('SELECT 1 as test').get() as { test: number };
      const connected = testQuery.test === 1;

      // Check if main tables exist
      const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('guestlist', 'activity_logs', 'error_logs')
      `).all() as { name: string }[];
      const tablesExist = tables.length === 3;

      // Get record count
      let recordCount = 0;
      if (tablesExist) {
        const countResult = this.db.prepare('SELECT COUNT(*) as count FROM guestlist').get() as { count: number };
        recordCount = countResult.count;
      }

      // Get database file size
      let databaseSize = '0 KB';
      try {
        const stats = fs.statSync(this.dbPath);
        const sizeInKB = Math.round(stats.size / 1024);
        databaseSize = `${sizeInKB} KB`;
      } catch (error) {
        console.warn('Could not get database file size:', error);
      }

      return {
        connected,
        tablesExist,
        recordCount,
        databaseSize
      };

    } catch (error) {
      console.error('Health check failed:', error);
      return {
        connected: false,
        tablesExist: false,
        recordCount: 0,
        databaseSize: '0 KB'
      };
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        this.db.close();
        this.db = null;
        console.log('📊 Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
        throw error;
      }
    }
  }

  closeConnection(): void {
    if (this.db) {
      try {
        this.db.close();
        this.db = null;
        console.log('📊 Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }

  // Backup functionality
  async createBackup(backupPath?: string): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultBackupPath = path.join(
      path.dirname(this.dbPath), 
      `backup_${timestamp}.db`
    );
    
    const finalBackupPath = backupPath || defaultBackupPath;

    try {
      // Use SQLite backup API
      this.db.backup(finalBackupPath);
      console.log(`💾 Database backup created: ${finalBackupPath}`);
      return finalBackupPath;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  // Get database statistics - Fixed with proper typing
  async getStatistics(): Promise<DatabaseStatistics> {
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
      `).get() as GuestStatistics;

      // Properly type the activity count query
      const activityCount = this.db.prepare('SELECT COUNT(*) as count FROM activity_logs').get() as { count: number };
      
      // Properly type the error count query
      const errorCount = this.db.prepare('SELECT COUNT(*) as count FROM error_logs WHERE resolved = 0').get() as { count: number };

      return {
        total_guests: guestStats.total_guests,
        total_khr: guestStats.total_khr,
        total_usd: guestStats.total_usd,
        paid_guests: guestStats.paid_guests,
        duplicates: guestStats.duplicates,
        activity_logs: activityCount.count,
        unresolved_errors: errorCount.count
      };
    } catch (error) {
      console.error('Failed to get database statistics:', error);
      throw error;
    }
  }
}