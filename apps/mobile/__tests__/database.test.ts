/**
 * Tests for database schema and migrations
 */

import {
  MIGRATIONS,
  CREATE_SESSIONS_TABLE,
  CREATE_PITCHES_TABLE,
  CREATE_CALIBRATIONS_TABLE,
} from '../src/services/database/schema';

describe('Database Schema', () => {
  describe('Schema Definitions', () => {
    it('should define sessions table with all required columns', () => {
      expect(CREATE_SESSIONS_TABLE).toContain('CREATE TABLE IF NOT EXISTS sessions');
      expect(CREATE_SESSIONS_TABLE).toContain('id TEXT PRIMARY KEY');
      expect(CREATE_SESSIONS_TABLE).toContain('name TEXT NOT NULL');
      expect(CREATE_SESSIONS_TABLE).toContain('date TEXT NOT NULL');
      expect(CREATE_SESSIONS_TABLE).toContain('pitcher_name TEXT');
      expect(CREATE_SESSIONS_TABLE).toContain('location TEXT');
      expect(CREATE_SESSIONS_TABLE).toContain('notes TEXT');
      expect(CREATE_SESSIONS_TABLE).toContain('created_at TEXT NOT NULL');
      expect(CREATE_SESSIONS_TABLE).toContain('updated_at TEXT NOT NULL');
    });

    it('should define pitches table with all required columns', () => {
      expect(CREATE_PITCHES_TABLE).toContain('CREATE TABLE IF NOT EXISTS pitches');
      expect(CREATE_PITCHES_TABLE).toContain('id TEXT PRIMARY KEY');
      expect(CREATE_PITCHES_TABLE).toContain('session_id TEXT NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('height REAL NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('uncertainty REAL NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('timestamp TEXT NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('quality_score REAL NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('pixel_position_x REAL');
      expect(CREATE_PITCHES_TABLE).toContain('pixel_position_y REAL');
      expect(CREATE_PITCHES_TABLE).toContain('calibration_id TEXT');
      expect(CREATE_PITCHES_TABLE).toContain('metadata TEXT');
      expect(CREATE_PITCHES_TABLE).toContain('created_at TEXT NOT NULL');
    });

    it('should define foreign key constraint on pitches table', () => {
      expect(CREATE_PITCHES_TABLE).toContain('FOREIGN KEY (session_id) REFERENCES sessions(id)');
      expect(CREATE_PITCHES_TABLE).toContain('ON DELETE CASCADE');
    });

    it('should define calibrations table with all required columns', () => {
      expect(CREATE_CALIBRATIONS_TABLE).toContain('CREATE TABLE IF NOT EXISTS calibrations');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('id TEXT PRIMARY KEY');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('reference_height REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('pixels_per_foot REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('quality_score REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('uncertainty REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('roi_x REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('roi_y REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('roi_width REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('roi_height REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('created_at TEXT NOT NULL');
    });
  });

  describe('Migrations', () => {
    it('should have at least one migration defined', () => {
      expect(MIGRATIONS.length).toBeGreaterThan(0);
    });

    it('should have initial migration with version 1', () => {
      const initialMigration = MIGRATIONS.find((m) => m.version === 1);
      expect(initialMigration).toBeDefined();
      expect(initialMigration?.name).toBe('initial_schema');
    });

    it('should have migration with up SQL statements', () => {
      const initialMigration = MIGRATIONS[0];
      expect(initialMigration.up).toBeDefined();
      expect(Array.isArray(initialMigration.up)).toBe(true);
      expect(initialMigration.up.length).toBeGreaterThan(0);
    });

    it('should include all table creation statements in initial migration', () => {
      const initialMigration = MIGRATIONS[0];
      const upStatements = initialMigration.up.join(' ');

      expect(upStatements).toContain('CREATE TABLE IF NOT EXISTS sessions');
      expect(upStatements).toContain('CREATE TABLE IF NOT EXISTS pitches');
      expect(upStatements).toContain('CREATE TABLE IF NOT EXISTS calibrations');
    });

    it('should have down migration for rollback', () => {
      const initialMigration = MIGRATIONS[0];
      expect(initialMigration.down).toBeDefined();
      expect(Array.isArray(initialMigration.down)).toBe(true);
    });

    it('should have migrations in ascending version order', () => {
      for (let i = 1; i < MIGRATIONS.length; i++) {
        expect(MIGRATIONS[i].version).toBeGreaterThan(MIGRATIONS[i - 1].version);
      }
    });

    it('should have unique migration versions', () => {
      const versions = MIGRATIONS.map((m) => m.version);
      const uniqueVersions = new Set(versions);
      expect(uniqueVersions.size).toBe(versions.length);
    });

    it('should have unique migration names', () => {
      const names = MIGRATIONS.map((m) => m.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Schema Validation', () => {
    it('should use TEXT type for IDs (UUIDs)', () => {
      expect(CREATE_SESSIONS_TABLE).toContain('id TEXT PRIMARY KEY');
      expect(CREATE_PITCHES_TABLE).toContain('id TEXT PRIMARY KEY');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('id TEXT PRIMARY KEY');
    });

    it('should use REAL type for numeric measurements', () => {
      expect(CREATE_PITCHES_TABLE).toContain('height REAL');
      expect(CREATE_PITCHES_TABLE).toContain('uncertainty REAL');
      expect(CREATE_PITCHES_TABLE).toContain('quality_score REAL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('reference_height REAL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('pixels_per_foot REAL');
    });

    it('should use TEXT type for timestamps (ISO strings)', () => {
      expect(CREATE_SESSIONS_TABLE).toContain('created_at TEXT');
      expect(CREATE_SESSIONS_TABLE).toContain('updated_at TEXT');
      expect(CREATE_PITCHES_TABLE).toContain('timestamp TEXT');
      expect(CREATE_PITCHES_TABLE).toContain('created_at TEXT');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('created_at TEXT');
    });

    it('should mark required fields as NOT NULL', () => {
      // Sessions
      expect(CREATE_SESSIONS_TABLE).toContain('id TEXT PRIMARY KEY NOT NULL');
      expect(CREATE_SESSIONS_TABLE).toContain('name TEXT NOT NULL');
      expect(CREATE_SESSIONS_TABLE).toContain('date TEXT NOT NULL');

      // Pitches
      expect(CREATE_PITCHES_TABLE).toContain('session_id TEXT NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('height REAL NOT NULL');
      expect(CREATE_PITCHES_TABLE).toContain('uncertainty REAL NOT NULL');

      // Calibrations
      expect(CREATE_CALIBRATIONS_TABLE).toContain('reference_height REAL NOT NULL');
      expect(CREATE_CALIBRATIONS_TABLE).toContain('pixels_per_foot REAL NOT NULL');
    });

    it('should allow null for optional fields', () => {
      // Check that optional fields don't have NOT NULL
      const optionalFields = [
        'pitcher_name',
        'location',
        'notes',
        'pixel_position_x',
        'pixel_position_y',
        'calibration_id',
        'metadata',
      ];

      for (const field of optionalFields) {
        const pitchesHasOptional = CREATE_PITCHES_TABLE.includes(field);
        const sessionsHasOptional = CREATE_SESSIONS_TABLE.includes(field);

        if (pitchesHasOptional) {
          const fieldDef = CREATE_PITCHES_TABLE.split(field)[1].split(',')[0];
          expect(fieldDef).not.toContain('NOT NULL');
        }

        if (sessionsHasOptional) {
          const fieldDef = CREATE_SESSIONS_TABLE.split(field)[1].split(',')[0];
          expect(fieldDef).not.toContain('NOT NULL');
        }
      }
    });
  });

  describe('Index Definitions', () => {
    it('should define index on pitches.session_id', () => {
      const initialMigration = MIGRATIONS[0];
      const hasIndex = initialMigration.up.some(
        (sql) =>
          sql.includes('CREATE INDEX') && sql.includes('pitches') && sql.includes('session_id')
      );
      expect(hasIndex).toBe(true);
    });

    it('should define index on pitches.timestamp', () => {
      const initialMigration = MIGRATIONS[0];
      const hasIndex = initialMigration.up.some(
        (sql) =>
          sql.includes('CREATE INDEX') && sql.includes('pitches') && sql.includes('timestamp')
      );
      expect(hasIndex).toBe(true);
    });

    it('should define index on sessions.date', () => {
      const initialMigration = MIGRATIONS[0];
      const hasIndex = initialMigration.up.some(
        (sql) => sql.includes('CREATE INDEX') && sql.includes('sessions') && sql.includes('date')
      );
      expect(hasIndex).toBe(true);
    });

    it('should use IF NOT EXISTS for indexes', () => {
      const initialMigration = MIGRATIONS[0];
      const indexStatements = initialMigration.up.filter((sql) => sql.includes('CREATE INDEX'));

      for (const statement of indexStatements) {
        expect(statement).toContain('IF NOT EXISTS');
      }
    });
  });
});
