/**
 * Database Service
 * Main entry point for database operations
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from './schema';
import { runMigrations } from './migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database with migrations
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  console.log('[Database] Initializing database...');

  try {
    // Open database
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Enable foreign keys
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    // Run migrations
    await runMigrations(dbInstance);

    console.log('[Database] Database initialized successfully');

    return dbInstance;
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    throw error;
  }
}

/**
 * Get database instance (must be initialized first)
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('[Database] Database closed');
  }
}

// Export schema and migrations for testing
export * from './schema';
export * from './migrations';
