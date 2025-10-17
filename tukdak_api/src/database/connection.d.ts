import Database from 'better-sqlite3';
export interface DatabaseConfig {
    filePath: string;
    options?: Database.Options;
    maxRetries?: number;
    retryDelay?: number;
}
export declare class DatabaseConnection {
    private static instance;
    private db;
    private config;
    private isInitialized;
    constructor(config: DatabaseConfig);
    static getInstance(config?: DatabaseConfig): DatabaseConnection;
    connect(): Promise<Database.Database>;
    private initializeSchema;
    getDatabase(): Database.Database;
    close(): Promise<void>;
    healthCheck(): Promise<{
        connected: boolean;
        tablesExist: boolean;
        error?: string;
    }>;
}
