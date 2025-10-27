/**
 * Database Migration System
 * Handles database versioning and schema updates
 */
import * as SQLite from 'expo-sqlite';
/**
 * Get current database version
 */
export declare function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number>;
/**
 * Run pending migrations
 */
export declare function runMigrations(db: SQLite.SQLiteDatabase): Promise<void>;
/**
 * Rollback migrations to a specific version
 */
export declare function rollbackToVersion(db: SQLite.SQLiteDatabase, targetVersion: number): Promise<void>;
/**
 * Reset database (drop all tables and rerun migrations)
 */
export declare function resetDatabase(db: SQLite.SQLiteDatabase): Promise<void>;
//# sourceMappingURL=migrations.d.ts.map