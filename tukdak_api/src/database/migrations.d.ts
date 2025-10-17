interface Migration {
    id: number;
    filename: string;
    applied_at: string;
}
declare class MigrationRunner {
    private dbService;
    private migrationsDir;
    constructor();
    init(): Promise<void>;
    getAppliedMigrations(): Promise<Migration[]>;
    getMigrationFiles(): Promise<string[]>;
    runMigrations(): Promise<void>;
    runSingleMigration(filename: string): Promise<void>;
    rollbackLastMigration(): Promise<void>;
    cleanup(): Promise<void>;
}
export { MigrationRunner };
