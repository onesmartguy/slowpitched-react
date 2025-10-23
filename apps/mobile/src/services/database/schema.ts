/**
 * Database Schema Definition
 * SQLite schema for pitch tracking data
 */

export const DATABASE_NAME = 'pitch_tracker.db';
export const DATABASE_VERSION = 1;

/**
 * Sessions table - Groups pitches into tracking sessions
 */
export const CREATE_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    pitcher_name TEXT,
    location TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

/**
 * Pitches table - Individual pitch measurements
 */
export const CREATE_PITCHES_TABLE = `
  CREATE TABLE IF NOT EXISTS pitches (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    height REAL NOT NULL,
    uncertainty REAL NOT NULL,
    timestamp TEXT NOT NULL,
    quality_score REAL NOT NULL,
    pixel_position_x REAL,
    pixel_position_y REAL,
    calibration_id TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`;

/**
 * Calibrations table - Calibration reference data
 */
export const CREATE_CALIBRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS calibrations (
    id TEXT PRIMARY KEY NOT NULL,
    reference_height REAL NOT NULL,
    pixels_per_foot REAL NOT NULL,
    quality_score REAL NOT NULL,
    uncertainty REAL NOT NULL,
    roi_x REAL NOT NULL,
    roi_y REAL NOT NULL,
    roi_width REAL NOT NULL,
    roi_height REAL NOT NULL,
    created_at TEXT NOT NULL
  );
`;

/**
 * Indexes for query performance
 */
export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_pitches_session ON pitches(session_id);',
  'CREATE INDEX IF NOT EXISTS idx_pitches_timestamp ON pitches(timestamp);',
  'CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);',
  'CREATE INDEX IF NOT EXISTS idx_pitches_quality ON pitches(quality_score);',
];

/**
 * Migration definitions
 */
export interface Migration {
  version: number;
  name: string;
  up: string[];
  down?: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: [
      CREATE_SESSIONS_TABLE,
      CREATE_PITCHES_TABLE,
      CREATE_CALIBRATIONS_TABLE,
      ...CREATE_INDEXES,
    ],
    down: [
      'DROP TABLE IF EXISTS pitches;',
      'DROP TABLE IF EXISTS sessions;',
      'DROP TABLE IF EXISTS calibrations;',
    ],
  },
];
