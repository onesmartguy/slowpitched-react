/**
 * Database Schema Definition
 * SQLite schema for pitch tracking data
 */
export declare const DATABASE_NAME = "pitch_tracker.db";
export declare const DATABASE_VERSION = 2;
/**
 * Sessions table - Groups pitches into tracking sessions
 */
export declare const CREATE_SESSIONS_TABLE = "\n  CREATE TABLE IF NOT EXISTS sessions (\n    id TEXT PRIMARY KEY NOT NULL,\n    name TEXT NOT NULL,\n    date TEXT NOT NULL,\n    pitcher_name TEXT,\n    location TEXT,\n    notes TEXT,\n    created_at TEXT NOT NULL,\n    updated_at TEXT NOT NULL\n  );\n";
/**
 * Pitches table - Individual pitch measurements
 */
export declare const CREATE_PITCHES_TABLE = "\n  CREATE TABLE IF NOT EXISTS pitches (\n    id TEXT PRIMARY KEY NOT NULL,\n    session_id TEXT NOT NULL,\n    height REAL NOT NULL,\n    uncertainty REAL NOT NULL,\n    timestamp TEXT NOT NULL,\n    quality_score REAL NOT NULL,\n    pixel_position_x REAL,\n    pixel_position_y REAL,\n    calibration_id TEXT,\n    metadata TEXT,\n    created_at TEXT NOT NULL,\n    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE\n  );\n";
/**
 * Calibrations table - Calibration reference data
 */
export declare const CREATE_CALIBRATIONS_TABLE = "\n  CREATE TABLE IF NOT EXISTS calibrations (\n    id TEXT PRIMARY KEY NOT NULL,\n    reference_height REAL NOT NULL,\n    pixels_per_foot REAL NOT NULL,\n    quality_score REAL NOT NULL,\n    uncertainty REAL NOT NULL,\n    roi_x REAL NOT NULL,\n    roi_y REAL NOT NULL,\n    roi_width REAL NOT NULL,\n    roi_height REAL NOT NULL,\n    created_at TEXT NOT NULL\n  );\n";
/**
 * Users table - Multi-user authentication
 * Phase 6: User accounts and authentication
 */
export declare const CREATE_USERS_TABLE = "\n  CREATE TABLE IF NOT EXISTS users (\n    id TEXT PRIMARY KEY NOT NULL,\n    username TEXT UNIQUE NOT NULL,\n    email TEXT UNIQUE NOT NULL,\n    password_hash TEXT NOT NULL,\n    display_name TEXT,\n    created_at TEXT NOT NULL,\n    updated_at TEXT NOT NULL\n  );\n";
/**
 * Indexes for query performance
 */
export declare const CREATE_INDEXES: string[];
/**
 * Migration definitions
 */
export interface Migration {
    version: number;
    name: string;
    up: string[];
    down?: string[];
}
export declare const MIGRATIONS: Migration[];
//# sourceMappingURL=schema.d.ts.map