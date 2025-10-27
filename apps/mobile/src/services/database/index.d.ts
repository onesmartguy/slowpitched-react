/**
 * Database Service
 * Main entry point for database operations
 */
import * as SQLite from 'expo-sqlite';
/**
 * Initialize database with migrations
 */
export declare function initDatabase(): Promise<SQLite.SQLiteDatabase>;
/**
 * Get database instance (must be initialized first)
 */
export declare function getDatabase(): SQLite.SQLiteDatabase;
/**
 * Close database connection
 */
export declare function closeDatabase(): Promise<void>;
export * from './schema';
export * from './migrations';
//# sourceMappingURL=index.d.ts.map