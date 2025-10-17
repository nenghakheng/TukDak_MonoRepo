import {DatabaseConnection} from './connection';
import * as path from 'path';

export class DatabaseService {
  private static instance: DatabaseService;
  private connection: DatabaseConnection;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'tukdak.db');
    this.connection = DatabaseConnection.getInstance({
      filePath: dbPath,
      options: {
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      },
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    await this.connection.connect();
  }

  getConnection(): DatabaseConnection {
    return this.connection;
  }

  async healthCheck() {
    return this.connection.healthCheck();
  }

  async close(): Promise<void> {
    await this.connection.close();
  }
}