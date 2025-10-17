import Database from 'better-sqlite3';
export interface DatabaseHealth {
    connected: boolean;
    tablesExist: boolean;
    recordCount: number;
    lastBackup?: string;
    databaseSize: string;
}
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
export declare class DatabaseService {
    private static instance;
    private db;
    private dbPath;
    private constructor();
    static getInstance(): DatabaseService;
    initialize(): Promise<void>;
    private createTables;
    getConnection(): {
        getDatabase: () => Database.Database;
    };
    healthCheck(): Promise<DatabaseHealth>;
    close(): Promise<void>;
    closeConnection(): void;
    createBackup(backupPath?: string): Promise<string>;
    getStatistics(): Promise<DatabaseStatistics>;
}
