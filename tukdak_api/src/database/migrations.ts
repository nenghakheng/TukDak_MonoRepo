import {DatabaseConnection} from './connection';

export interface Migration {
  version: string;
  description: string;
  up: string[];
  down: string[];
}

export class MigrationRunner {
  private db: any;

  constructor(private connection: DatabaseConnection) {
    this.db = connection.getDatabase();
  }

  async initialize(): Promise<void> {
    // Create migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async runMigrations(migrations: Migration[]): Promise<void> {
    await this.initialize();

    const appliedMigrations = this.db.prepare(
      'SELECT version FROM migrations ORDER BY version'
    ).all().map((row: any) => row.version);

    for (const migration of migrations) {
      if (!appliedMigrations.includes(migration.version)) {
        console.log(`Running migration ${migration.version}: ${migration.description}`);
        
        const transaction = this.db.transaction(() => {
          migration.up.forEach(sql => this.db.exec(sql));
          this.db.prepare(
            'INSERT INTO migrations (version, description) VALUES (?, ?)'
          ).run(migration.version, migration.description);
        });

        transaction();
        console.log(`✅ Migration ${migration.version} completed`);
      }
    }
  }
}