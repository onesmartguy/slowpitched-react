# Database Migration Guide

**Phase 3 Storage Layer Migrations**
**Version:** 1.0.0
**Last Updated:** October 23, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Migration System Architecture](#migration-system-architecture)
3. [Creating New Migrations](#creating-new-migrations)
4. [Running Migrations](#running-migrations)
5. [Rollback Strategy](#rollback-strategy)
6. [Common Migration Patterns](#common-migration-patterns)
7. [Testing Migrations](#testing-migrations)
8. [Production Migration Checklist](#production-migration-checklist)

---

## Overview

The Pitch Height Tracker Pro uses a version-controlled migration system for database schema changes. This ensures:

- **Reproducible** schema evolution across environments
- **Rollback** capability if issues occur
- **Version tracking** to know exactly what schema is deployed
- **Safety** through atomic transactions

---

## Migration System Architecture

### Files

```
apps/mobile/src/services/database/
├── schema.ts       → Table definitions, indexes, constraints
├── migrations.ts   → Migration runner and version control
└── index.ts        → Database initialization
```

### Version Control

Migrations are tracked in a `migrations` table:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
```

### Current State

**Current Version:** 1

**Tables:**
- `sessions` - Practice session metadata
- `pitches` - Individual pitch measurements
- `calibrations` - Calibration reference data

---

## Creating New Migrations

### Step 1: Define Migration

Edit `apps/mobile/src/services/database/schema.ts`:

```typescript
export const MIGRATIONS: Migration[] = [
  // Existing migrations
  {
    version: 1,
    name: 'initial_schema',
    up: [
      CREATE_SESSIONS_TABLE,
      CREATE_PITCHES_TABLE,
      CREATE_CALIBRATIONS_TABLE,
      CREATE_INDEXES,
    ],
    down: [
      'DROP TABLE IF EXISTS pitches;',
      'DROP TABLE IF EXISTS sessions;',
      'DROP TABLE IF EXISTS calibrations;',
    ],
  },

  // NEW MIGRATION
  {
    version: 2,
    name: 'add_session_rating',
    up: [
      'ALTER TABLE sessions ADD COLUMN rating INTEGER DEFAULT 0;',
    ],
    down: [
      // SQLite doesn't support DROP COLUMN directly
      // Need to recreate table without the column
      `CREATE TABLE sessions_backup AS SELECT
         id, name, date, pitcher_name, location, notes, created_at, updated_at
       FROM sessions;`,
      'DROP TABLE sessions;',
      'ALTER TABLE sessions_backup RENAME TO sessions;',
    ],
  },
];
```

### Step 2: Update TypeScript Types

Edit `apps/mobile/src/types/index.ts`:

```typescript
export interface SessionRow {
  id: string;
  name: string;
  date: string;
  pitcher_name: string | null;
  location: string | null;
  notes: string | null;
  rating: number; // ← ADD NEW FIELD
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  pitcherName?: string;
  location?: string;
  notes?: string;
  rating?: number; // ← ADD NEW FIELD
  createdAt: number;
  updatedAt: number;
  pitchCount?: number;
}
```

### Step 3: Update Service Layer

Edit `apps/mobile/src/services/database/sessionService.ts`:

```typescript
function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    pitcherName: row.pitcher_name || undefined,
    location: row.location || undefined,
    notes: row.notes || undefined,
    rating: row.rating, // ← ADD NEW FIELD
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function sessionToRow(session: Session): Partial<SessionRow> {
  return {
    id: session.id,
    name: session.name,
    date: session.date,
    pitcher_name: session.pitcherName || null,
    location: session.location || null,
    notes: session.notes || null,
    rating: session.rating ?? 0, // ← ADD NEW FIELD WITH DEFAULT
  };
}
```

### Step 4: Test Migration

Create test file `apps/mobile/__tests__/migration_v2.test.ts`:

```typescript
import { openDatabaseAsync } from 'expo-sqlite';
import { runMigrations, getCurrentVersion } from '../src/services/database/migrations';

describe('Migration v2: Add session rating', () => {
  let db: any;

  beforeAll(async () => {
    db = await openDatabaseAsync(':memory:');
    await runMigrations(db);
  });

  it('should have version 2', async () => {
    const version = await getCurrentVersion(db);
    expect(version).toBe(2);
  });

  it('should have rating column', async () => {
    const columns = await db.getAllAsync('PRAGMA table_info(sessions)');
    const ratingColumn = columns.find((col: any) => col.name === 'rating');
    expect(ratingColumn).toBeDefined();
    expect(ratingColumn.type).toBe('INTEGER');
  });

  it('should default rating to 0', async () => {
    await db.runAsync(
      'INSERT INTO sessions (id, name, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['test_1', 'Test', '2025-10-23', new Date().toISOString(), new Date().toISOString()]
    );

    const row = await db.getFirstAsync('SELECT rating FROM sessions WHERE id = ?', ['test_1']);
    expect(row.rating).toBe(0);
  });
});
```

Run tests:
```bash
pnpm test -- migration_v2.test.ts
```

---

## Running Migrations

### Development

Migrations run automatically on `initDatabase()`:

```typescript
import { initDatabase } from './services/database';

// In App.tsx or index.js
useEffect(() => {
  const init = async () => {
    try {
      await initDatabase();
      console.log('Database ready');
    } catch (error) {
      console.error('Database init failed:', error);
    }
  };
  init();
}, []);
```

### Manual Migration

```typescript
import { getDatabase } from './services/database';
import { runMigrations } from './services/database/migrations';

const db = getDatabase();
await runMigrations(db);
console.log('Migrations complete');
```

### Check Current Version

```typescript
import { getCurrentVersion } from './services/database/migrations';

const version = await getCurrentVersion(getDatabase());
console.log(`Database version: ${version}`);
```

---

## Rollback Strategy

### Automatic Rollback

If a migration fails, the transaction is rolled back automatically:

```typescript
try {
  await db.withTransactionAsync(async () => {
    for (const sql of migration.up) {
      await db.execAsync(sql); // If this fails, entire transaction rolls back
    }
  });
} catch (error) {
  console.error('Migration failed, rolled back:', error);
  throw error;
}
```

### Manual Rollback

To rollback to a specific version:

```typescript
import { rollbackToVersion } from './services/database/migrations';

const db = getDatabase();
await rollbackToVersion(db, 1); // Rollback to version 1
```

**Implementation:**

Add to `apps/mobile/src/services/database/migrations.ts`:

```typescript
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Already at or below target version');
    return;
  }

  // Get migrations to rollback (in reverse order)
  const migrationsToRollback = MIGRATIONS.filter(
    (m) => m.version > targetVersion && m.version <= currentVersion
  ).reverse();

  for (const migration of migrationsToRollback) {
    console.log(`Rolling back migration ${migration.version}: ${migration.name}`);

    await db.withTransactionAsync(async () => {
      // Execute down scripts
      for (const sql of migration.down) {
        await db.execAsync(sql);
      }

      // Remove migration record
      await db.runAsync('DELETE FROM migrations WHERE version = ?', [migration.version]);
    });
  }

  console.log(`Rolled back to version ${targetVersion}`);
}
```

---

## Common Migration Patterns

### 1. Add Column (Simple)

**Use Case:** Add optional field to existing table

```typescript
{
  version: N,
  name: 'add_column_name',
  up: [
    'ALTER TABLE table_name ADD COLUMN column_name TYPE DEFAULT value;',
  ],
  down: [
    // SQLite doesn't support DROP COLUMN
    // Must recreate table without column (see next pattern)
  ],
}
```

**Example:**
```sql
ALTER TABLE sessions ADD COLUMN rating INTEGER DEFAULT 0;
ALTER TABLE pitches ADD COLUMN weather TEXT;
```

---

### 2. Add Column (Complex - Recreate Table)

**Use Case:** Add NOT NULL column or complex constraints

```typescript
{
  version: N,
  name: 'add_required_column',
  up: [
    // 1. Create new table with column
    `CREATE TABLE sessions_new (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 0,
      -- ... other columns
    );`,

    // 2. Copy data
    `INSERT INTO sessions_new SELECT
      id, name, 0 as rating, -- Default value for new column
      -- ... other columns
    FROM sessions;`,

    // 3. Drop old table
    'DROP TABLE sessions;',

    // 4. Rename new table
    'ALTER TABLE sessions_new RENAME TO sessions;',

    // 5. Recreate indexes
    'CREATE INDEX idx_sessions_date ON sessions(date);',
  ],
  down: [
    // Reverse the process
  ],
}
```

---

### 3. Remove Column

**SQLite Limitation:** Cannot DROP COLUMN directly

**Solution:** Recreate table without the column

```typescript
{
  version: N,
  name: 'remove_column_name',
  up: [
    // 1. Create backup with columns to keep
    `CREATE TABLE sessions_backup AS SELECT
      id, name, date, pitcher_name, location, notes, created_at, updated_at
    FROM sessions;`,

    // 2. Drop original
    'DROP TABLE sessions;',

    // 3. Rename backup
    'ALTER TABLE sessions_backup RENAME TO sessions;',

    // 4. Recreate indexes and constraints
    'CREATE INDEX idx_sessions_date ON sessions(date);',
  ],
  down: [
    // Add column back
    'ALTER TABLE sessions ADD COLUMN removed_column_name TYPE;',
  ],
}
```

---

### 4. Add Index

**Use Case:** Improve query performance

```typescript
{
  version: N,
  name: 'add_index_column_name',
  up: [
    'CREATE INDEX idx_table_column ON table_name(column_name);',
  ],
  down: [
    'DROP INDEX IF EXISTS idx_table_column;',
  ],
}
```

**Example:**
```sql
CREATE INDEX idx_pitches_quality ON pitches(quality_score);
CREATE INDEX idx_sessions_pitcher ON sessions(pitcher_name);
```

---

### 5. Add Foreign Key

**SQLite Limitation:** Cannot ADD CONSTRAINT after table creation

**Solution:** Recreate table with foreign key

```typescript
{
  version: N,
  name: 'add_foreign_key',
  up: [
    // 1. Create new table with foreign key
    `CREATE TABLE pitches_new (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      -- ... other columns
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );`,

    // 2. Copy data (only valid references)
    `INSERT INTO pitches_new
     SELECT p.* FROM pitches p
     INNER JOIN sessions s ON p.session_id = s.id;`,

    // 3. Drop old, rename new
    'DROP TABLE pitches;',
    'ALTER TABLE pitches_new RENAME TO pitches;',

    // 4. Recreate indexes
    'CREATE INDEX idx_pitches_session ON pitches(session_id);',
  ],
  down: [
    // Recreate without foreign key
  ],
}
```

---

### 6. Create New Table

**Use Case:** Add new feature requiring new table

```typescript
{
  version: N,
  name: 'create_table_name',
  up: [
    `CREATE TABLE IF NOT EXISTS table_name (
      id TEXT PRIMARY KEY NOT NULL,
      -- columns
      created_at TEXT NOT NULL
    );`,
    'CREATE INDEX idx_table_created ON table_name(created_at);',
  ],
  down: [
    'DROP TABLE IF EXISTS table_name;',
  ],
}
```

---

### 7. Rename Column

**SQLite Limitation:** No RENAME COLUMN (before SQLite 3.25)

**Solution:** Recreate table

```typescript
{
  version: N,
  name: 'rename_column',
  up: [
    `CREATE TABLE sessions_new AS SELECT
      id,
      name,
      date,
      pitcher_name AS player_name, -- Rename
      location,
      notes,
      created_at,
      updated_at
    FROM sessions;`,
    'DROP TABLE sessions;',
    'ALTER TABLE sessions_new RENAME TO sessions;',
  ],
  down: [
    // Rename back
  ],
}
```

---

### 8. Data Migration

**Use Case:** Transform existing data

```typescript
{
  version: N,
  name: 'migrate_data_format',
  up: [
    // Example: Convert timestamp format
    `UPDATE pitches
     SET timestamp = datetime(timestamp, 'unixepoch')
     WHERE timestamp NOT LIKE '%-%';`,
  ],
  down: [
    // Reverse transformation
    `UPDATE pitches
     SET timestamp = strftime('%s', timestamp);`,
  ],
}
```

---

## Testing Migrations

### Unit Test Template

```typescript
import { openDatabaseAsync } from 'expo-sqlite';
import { runMigrations, getCurrentVersion, rollbackToVersion } from '../src/services/database/migrations';

describe('Migration vN: Description', () => {
  let db: any;

  beforeEach(async () => {
    db = await openDatabaseAsync(':memory:');
    // Run migrations up to version N-1
    await runMigrations(db);
    // Rollback to test migration N specifically
    await rollbackToVersion(db, N - 1);
  });

  it('should migrate to version N', async () => {
    await runMigrations(db);
    const version = await getCurrentVersion(db);
    expect(version).toBe(N);
  });

  it('should add/modify expected schema', async () => {
    await runMigrations(db);

    // Check table structure
    const columns = await db.getAllAsync('PRAGMA table_info(table_name)');
    expect(columns.some(col => col.name === 'new_column')).toBe(true);
  });

  it('should preserve existing data', async () => {
    // Insert test data before migration
    await db.runAsync('INSERT INTO sessions (...) VALUES (...)', [...]);

    // Run migration
    await runMigrations(db);

    // Verify data still exists
    const row = await db.getFirstAsync('SELECT * FROM sessions WHERE id = ?', ['test_id']);
    expect(row).toBeDefined();
  });

  it('should rollback cleanly', async () => {
    await runMigrations(db); // Migrate to N
    await rollbackToVersion(db, N - 1); // Rollback

    const version = await getCurrentVersion(db);
    expect(version).toBe(N - 1);
  });
});
```

### Integration Test

```typescript
describe('Full Migration Sequence', () => {
  it('should migrate from v0 to latest', async () => {
    const db = await openDatabaseAsync(':memory:');

    // Run all migrations
    await runMigrations(db);

    // Verify final state
    const version = await getCurrentVersion(db);
    expect(version).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);

    // Verify all tables exist
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    expect(tables.some(t => t.name === 'sessions')).toBe(true);
    expect(tables.some(t => t.name === 'pitches')).toBe(true);
    expect(tables.some(t => t.name === 'calibrations')).toBe(true);
  });
});
```

---

## Production Migration Checklist

### Before Deployment

- [ ] **Backup Database** - Always backup before migrating
  ```typescript
  import * as FileSystem from 'expo-file-system';
  const dbPath = FileSystem.documentDirectory + 'SQLite/pitch_tracker.db';
  const backupPath = dbPath + '.backup.' + Date.now();
  await FileSystem.copyAsync({ from: dbPath, to: backupPath });
  ```

- [ ] **Test Migration** - Run on test database first
  ```bash
  pnpm test -- migration
  ```

- [ ] **Review SQL** - Ensure all SQL is valid
  ```bash
  sqlite3 test.db < migration.sql
  ```

- [ ] **Check Performance** - Large data migrations may take time
  ```typescript
  const start = Date.now();
  await runMigrations(db);
  console.log(`Migration took ${Date.now() - start}ms`);
  ```

- [ ] **Verify Rollback** - Test rollback procedure
  ```typescript
  await rollbackToVersion(db, previousVersion);
  ```

### During Deployment

- [ ] **Monitor Logs** - Watch for migration errors
- [ ] **Verify Version** - Confirm correct version after migration
  ```typescript
  const version = await getCurrentVersion(db);
  console.log(`Deployed version: ${version}`);
  ```

### After Deployment

- [ ] **Verify Data Integrity** - Check data still accessible
  ```typescript
  const sessions = await getAllSessions();
  console.log(`Found ${sessions.length} sessions`);
  ```

- [ ] **Test Core Functionality** - Run smoke tests
- [ ] **Keep Backup** - Don't delete backup for at least 7 days

---

## Migration Best Practices

### 1. Always Use Transactions

```typescript
await db.withTransactionAsync(async () => {
  // All migration SQL here
  // Rolls back automatically on error
});
```

### 2. Idempotent Migrations

Use `IF EXISTS` and `IF NOT EXISTS`:
```sql
CREATE TABLE IF NOT EXISTS sessions (...);
DROP TABLE IF EXISTS old_table;
```

### 3. Test with Real Data

```typescript
// Create realistic test data
const testSessions = Array.from({ length: 100 }, (_, i) => ({
  id: `session_${i}`,
  name: `Test Session ${i}`,
  // ...
}));

// Test migration with this data
```

### 4. Document Breaking Changes

```typescript
{
  version: N,
  name: 'remove_deprecated_column',
  // ⚠️ BREAKING: Removes 'old_field' column
  // Applications using this field will need updates
  up: [...],
  down: [...],
}
```

### 5. Version Carefully

- **Major schema changes**: Increment version
- **Minor additions**: Increment version
- **Data-only changes**: Consider separate data migration

### 6. Keep Migrations Small

Each migration should do **one thing**:
- ✅ Good: "Add rating column"
- ❌ Bad: "Add rating, refactor sessions, migrate data, add indexes"

---

## Troubleshooting

### Migration Fails Halfway

**Problem:** Migration fails after some SQL executed

**Solution:** Transaction automatically rolls back, database unchanged

**Verify:**
```typescript
const version = await getCurrentVersion(db);
// Should still be old version
```

### Migration Applied but Broken

**Problem:** Migration succeeded but broke application

**Solution:** Rollback to previous version
```typescript
await rollbackToVersion(db, previousVersion);
```

### Can't Rollback

**Problem:** Rollback script missing or incorrect

**Solution:** Manual rollback with SQL
```typescript
await db.execAsync('DROP TABLE problematic_table;');
await db.runAsync('DELETE FROM migrations WHERE version = ?', [N]);
```

### Data Loss During Migration

**Problem:** Recreating table lost data

**Solution:** Always test with production-like data first

**Recovery:** Restore from backup
```typescript
import * as FileSystem from 'expo-file-system';
await FileSystem.copyAsync({ from: backupPath, to: dbPath });
```

---

## Example: Complete Migration Workflow

Let's add a `weather` field to sessions:

### 1. Define Migration

```typescript
// schema.ts
{
  version: 2,
  name: 'add_session_weather',
  up: [
    'ALTER TABLE sessions ADD COLUMN weather TEXT;',
  ],
  down: [
    `CREATE TABLE sessions_backup AS SELECT
       id, name, date, pitcher_name, location, notes, created_at, updated_at
     FROM sessions;`,
    'DROP TABLE sessions;',
    'ALTER TABLE sessions_backup RENAME TO sessions;',
  ],
}
```

### 2. Update Types

```typescript
// types/index.ts
interface SessionRow {
  // ... existing fields
  weather: string | null;
}

interface Session {
  // ... existing fields
  weather?: string;
}
```

### 3. Update Service

```typescript
// sessionService.ts
function rowToSession(row: SessionRow): Session {
  return {
    // ... existing fields
    weather: row.weather || undefined,
  };
}

function sessionToRow(session: Session): Partial<SessionRow> {
  return {
    // ... existing fields
    weather: session.weather || null,
  };
}
```

### 4. Test

```typescript
// __tests__/migration_weather.test.ts
it('should add weather column', async () => {
  const db = await openDatabaseAsync(':memory:');
  await runMigrations(db);

  const columns = await db.getAllAsync('PRAGMA table_info(sessions)');
  const weatherCol = columns.find(c => c.name === 'weather');
  expect(weatherCol).toBeDefined();
});
```

### 5. Deploy

```bash
pnpm test
pnpm run type-check
# Migrations run automatically on app start
```

---

## Additional Resources

- **Schema Reference:** `apps/mobile/src/services/database/schema.ts`
- **Migration Runner:** `apps/mobile/src/services/database/migrations.ts`
- **SQLite Docs:** https://www.sqlite.org/lang_altertable.html
- **Expo SQLite:** https://docs.expo.dev/versions/latest/sdk/sqlite/

---

*Migration Guide v1.0.0 - Last modified by: Claude Code on October 23, 2025*
