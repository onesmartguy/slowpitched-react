/**
 * Database Migration System
 * Handles database versioning and schema updates
 */

import * as SQLite from 'expo-sqlite';
import { MIGRATIONS, DATABASE_VERSION } from './schema';

const MIGRATION_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

/**
 * Get current database version
 */
export async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getAllAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    return result[0]?.version || 0;
  } catch {
    return 0;
  }
}

/**
 * Run pending migrations
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Ensure migrations table exists
  await db.execAsync(MIGRATION_TABLE);

  const currentVersion = await getCurrentVersion(db);
  const pendingMigrations = MIGRATIONS.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('[Database] No pending migrations');
    return;
  }

  console.log(
    `[Database] Running ${pendingMigrations.length} migration(s) from version ${currentVersion} to ${DATABASE_VERSION}`
  );

  for (const migration of pendingMigrations) {
    console.log(`[Database] Applying migration: ${migration.name} (v${migration.version})`);

    try {
      // Execute migration in transaction
      await db.withTransactionAsync(async () => {
        // Run migration SQL
        for (const sql of migration.up) {
          await db.execAsync(sql);
        }

        // Record migration
        await db.runAsync(
          'INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)',
          [migration.version, migration.name, new Date().toISOString()]
        );
      });

      console.log(`[Database] Migration ${migration.name} completed`);
    } catch (error) {
      console.error(`[Database] Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log('[Database] All migrations completed successfully');
}

/**
 * Rollback migrations to a specific version
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('[Database] No rollback needed');
    return;
  }

  const migrationsToRollback = MIGRATIONS.filter(
    (m) => m.version > targetVersion && m.version <= currentVersion
  ).reverse();

  console.log(
    `[Database] Rolling back ${migrationsToRollback.length} migration(s) from version ${currentVersion} to ${targetVersion}`
  );

  for (const migration of migrationsToRollback) {
    if (!migration.down) {
      throw new Error(`Migration ${migration.name} does not have a rollback defined`);
    }

    console.log(`[Database] Rolling back migration: ${migration.name} (v${migration.version})`);

    try {
      await db.withTransactionAsync(async () => {
        // Run rollback SQL
        for (const sql of migration.down!) {
          await db.execAsync(sql);
        }

        // Remove migration record
        await db.runAsync('DELETE FROM migrations WHERE version = ?', [migration.version]);
      });

      console.log(`[Database] Rollback of ${migration.name} completed`);
    } catch (error) {
      console.error(`[Database] Rollback of ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log('[Database] All rollbacks completed successfully');
}

/**
 * Reset database (drop all tables and rerun migrations)
 */
export async function resetDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[Database] Resetting database...');

  try {
    await db.withTransactionAsync(async () => {
      // Drop all tables in reverse order
      await db.execAsync('DROP TABLE IF EXISTS pitches;');
      await db.execAsync('DROP TABLE IF EXISTS sessions;');
      await db.execAsync('DROP TABLE IF EXISTS calibrations;');
      await db.execAsync('DROP TABLE IF EXISTS migrations;');
    });

    console.log('[Database] All tables dropped');

    // Rerun migrations
    await runMigrations(db);

    console.log('[Database] Database reset complete');
  } catch (error) {
    console.error('[Database] Reset failed:', error);
    throw error;
  }
}
