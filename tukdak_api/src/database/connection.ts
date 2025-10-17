import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import {DATABASE_SCHEMA} from '../schema/database-schema';

export interface DatabaseConfig {
  filePath: string;
  options?: Database.Options;
  maxRetries?: number;
  retryDelay?: number;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database.Database | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor(config: DatabaseConfig) {
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

  static getInstance(config?: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<Database.Database> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        console.log(`Database connection attempt ${attempt}/${this.config.maxRetries}`);
        
        // Ensure data directory exists
        const dataDir = path.dirname(this.config.filePath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
        }

        // Create database connection
        this.db = new Database(this.config.filePath, this.config.options);
        
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
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Database connection attempt ${attempt} failed:`, error);
        
        if (this.db) {
          try {
            this.db.close();
          } catch (closeError) {
            console.error('Error closing database:', closeError);
          }
          this.db = null;
        }
        
        if (attempt < this.config.maxRetries!) {
          console.log(`Retrying in ${this.config.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`Failed to connect to database after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  private async initializeSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not established');
    }

    console.log('🔄 Initializing database schema...');

    // Create tables
    this.db.exec(DATABASE_SCHEMA.GUESTLIST_TABLE);
    this.db.exec(DATABASE_SCHEMA.ACTIVITY_LOGS_TABLE);
    this.db.exec(DATABASE_SCHEMA.ERROR_LOGS_TABLE);

    // Create indexes
    DATABASE_SCHEMA.INDEXES.forEach(indexSql => {
      this.db!.exec(indexSql);
    });

    // Create triggers
    DATABASE_SCHEMA.TRIGGERS.forEach(triggerSql => {
      this.db!.exec(triggerSql);
    });

    console.log('✅ Database schema initialized successfully');
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        this.db.close();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('❌ Error closing database:', error);
        throw error;
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
  }

  // Health check method
  async healthCheck(): Promise<{connected: boolean; tablesExist: boolean; error?: string}> {
    try {
      if (!this.db) {
        return {connected: false, tablesExist: false, error: 'No database connection'};
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
    } catch (error) {
      return {
        connected: false,
        tablesExist: false,
        error: (error as Error).message,
      };
    }
  }
}