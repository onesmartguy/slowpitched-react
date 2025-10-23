# Troubleshooting Guide

**Phase 3 Storage Layer**
**Version:** 1.0.0
**Last Updated:** October 23, 2025

---

## Table of Contents

1. [Database Issues](#database-issues)
2. [Query Performance](#query-performance)
3. [Data Integrity Issues](#data-integrity-issues)
4. [Type Errors](#type-errors)
5. [Migration Issues](#migration-issues)
6. [Testing Issues](#testing-issues)
7. [Build & Compilation](#build--compilation)
8. [Runtime Errors](#runtime-errors)

---

## Database Issues

### Error: "Database not initialized. Call initDatabase() first."

**Symptom:** Crashes when trying to query database

**Cause:** Database not initialized before use

**Solution:**
```typescript
// Add to App.tsx or index.js
import { initDatabase } from './services/database';

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

**Prevention:** Always initialize database on app startup

---

### Error: "FOREIGN KEY constraint failed"

**Symptom:** Cannot create pitch, error mentions foreign key

**Cause:** Trying to create pitch for non-existent session

**Solution:**
```typescript
// Check session exists first
try {
  const session = await getSessionById(sessionId);
  // Now safe to create pitch
  await createPitch(pitch);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Session does not exist');
    // Create session first
    await createSession(newSession);
  }
}
```

**Prevention:** Always create session before creating pitches

---

### Error: "No such table: pitches"

**Symptom:** Query fails saying table doesn't exist

**Cause:** Migrations haven't run

**Solution:**
```typescript
// Force database reset (CAUTION: Deletes all data)
import { resetDatabase, getDatabase } from './services/database';

const db = await getDatabase();
await resetDatabase(db);
```

**Prevention:**
- Ensure `initDatabase()` completes successfully
- Check migration logs for errors

---

### Error: "Database is locked"

**Symptom:** Queries timeout or fail with "database locked"

**Cause:** Concurrent writes without transactions or long-running queries

**Solution:**
```typescript
// Use transactions for batch operations
await db.withTransactionAsync(async () => {
  await createPitch(pitch1);
  await createPitch(pitch2);
  await createPitch(pitch3);
});

// Or use batch operations
await createPitchesBatch([pitch1, pitch2, pitch3]);
```

**Prevention:**
- Use batch operations for multiple inserts
- Don't hold database connections open
- Use transactions for atomic operations

---

## Query Performance

### Problem: Queries Taking >1 Second

**Symptom:** Slow database queries, app feels sluggish

**Diagnosis:**
```typescript
// Add timing to queries
const start = Date.now();
const pitches = await getPitchesBySession(sessionId);
const duration = Date.now() - start;
console.log(`Query took ${duration}ms`);
```

**Common Causes:**

#### 1. Missing Indexes
```sql
-- Check if indexes exist
SELECT name FROM sqlite_master WHERE type='index';
```

**Solution:** Verify indexes are created (should be automatic)

#### 2. Large Result Sets
```typescript
// ❌ Bad - loads all pitches
const all = await getPitchesBySession(sessionId);

// ✅ Good - filter in database
const recent = await db.getAllAsync(
  'SELECT * FROM pitches WHERE session_id = ? ORDER BY timestamp DESC LIMIT 100',
  [sessionId]
);
```

#### 3. No Query Caching
```typescript
// Cache frequently accessed data
let cachedSession: Session | null = null;

async function getSession(id: string): Promise<Session> {
  if (cachedSession?.id === id) {
    return cachedSession;
  }
  cachedSession = await getSessionById(id);
  return cachedSession;
}
```

---

### Problem: Statistics Calculation Slow

**Symptom:** `getSessionSummary()` takes >500ms

**Cause:** Calculating statistics for large datasets

**Solution:**
```typescript
// 1. Limit data processed
const recentPitches = pitches.slice(0, 1000); // Process only recent

// 2. Use database aggregation
const stats = await db.getFirstAsync(`
  SELECT
    MIN(height) as min,
    MAX(height) as max,
    AVG(height) as avg,
    COUNT(*) as count
  FROM pitches
  WHERE session_id = ?
`, [sessionId]);
```

**Prevention:** Consider pre-calculating statistics on insert

---

## Data Integrity Issues

### Problem: Pitch Count Wrong

**Symptom:** Session shows incorrect pitch count

**Cause:** Count not updated after delete

**Solution:**
```typescript
// Pitch count is computed, not stored
// Just query again
const session = await getSessionById(sessionId);
console.log(session.pitchCount); // Automatically correct
```

**Note:** Pitch count is always computed from actual pitches

---

### Problem: Orphaned Pitches

**Symptom:** Pitches exist but session was deleted

**Cause:** Foreign key cascade not working

**Diagnosis:**
```typescript
// Check for orphaned pitches
const orphans = await db.getAllAsync(`
  SELECT p.* FROM pitches p
  LEFT JOIN sessions s ON p.session_id = s.id
  WHERE s.id IS NULL
`);
console.log(`Found ${orphans.length} orphaned pitches`);
```

**Solution:**
```typescript
// Enable foreign keys (should be automatic)
await db.execAsync('PRAGMA foreign_keys = ON;');

// Or manually clean up
await db.runAsync('DELETE FROM pitches WHERE session_id NOT IN (SELECT id FROM sessions)');
```

**Prevention:** Foreign keys should be enabled by default in our setup

---

### Problem: Timestamps Don't Match

**Symptom:** Created/updated timestamps incorrect

**Cause:** Using Date.now() on client (timezone issues)

**Solution:**
```typescript
// Always use ISO strings in database
const isoString = new Date().toISOString();

// Convert to Unix timestamp when needed
const timestamp = new Date(isoString).getTime();
```

**Prevention:** Store timestamps as ISO strings in DB, convert for display

---

## Type Errors

### Error: "Property 'x' does not exist on type 'PitchRow'"

**Symptom:** TypeScript compilation error

**Cause:** Using wrong type (Row vs Domain model)

**Solution:**
```typescript
// ❌ Wrong - PitchRow is for database
function displayPitch(pitch: PitchRow) {
  console.log(pitch.ballPosition); // ERROR: property doesn't exist
}

// ✅ Correct - Use Pitch for domain logic
function displayPitch(pitch: Pitch) {
  console.log(pitch.ballPosition); // OK
}
```

**Rule:**
- Use `*Row` types only in service layer
- Use domain types (`Pitch`, `Session`, `CalibrationData`) everywhere else

---

### Error: "Type 'undefined' is not assignable"

**Symptom:** TypeScript error with optional fields

**Cause:** Not handling undefined values

**Solution:**
```typescript
// ❌ Bad - might be undefined
const name = session.pitcherName.toLowerCase(); // ERROR

// ✅ Good - handle undefined
const name = session.pitcherName?.toLowerCase() ?? 'Unknown';

// Or check first
if (session.pitcherName) {
  const name = session.pitcherName.toLowerCase();
}
```

---

### Error: "Argument of type '...' is not assignable"

**Symptom:** Function parameter type mismatch

**Cause:** Passing wrong type to function

**Solution:**
```typescript
// Check function signature
import { createPitch } from './services/database/pitchService';
// Expects: Pitch type

// Ensure you're passing correct type
const pitch: Pitch = {
  id: 'pitch_123',
  sessionId: 'session_456',
  height: 4.5,
  uncertainty: 0.08,
  timestamp: Date.now(),
  qualityScore: 92,
  ballPosition: { x: 150, y: 300 },
};

await createPitch(pitch); // ✅ Correct type
```

---

## Migration Issues

### Error: "Migration failed: ..."

**Symptom:** Database initialization fails with migration error

**Diagnosis:**
```typescript
// Check migration version
import { getCurrentVersion, getDatabase } from './services/database';

const db = getDatabase();
const version = await getCurrentVersion(db);
console.log(`Current version: ${version}`);
```

**Solution:**
```typescript
// Option 1: Reset database (CAUTION: Deletes data)
import { resetDatabase } from './services/database';
await resetDatabase(db);

// Option 2: Rollback to previous version
import { rollbackToVersion } from './services/database/migrations';
await rollbackToVersion(db, 0); // Rollback to v0
await runMigrations(db); // Re-run migrations
```

**Prevention:** Test migrations thoroughly before deployment

---

### Problem: Adding New Column

**Symptom:** Need to add field to existing table

**Solution:**
1. Create new migration:
```typescript
// In schema.ts
export const MIGRATIONS: Migration[] = [
  // ... existing migrations
  {
    version: 2,
    name: 'add_session_rating',
    up: [
      'ALTER TABLE sessions ADD COLUMN rating INTEGER DEFAULT 0;',
    ],
    down: [
      // SQLite doesn't support DROP COLUMN
      // Would need to recreate table
    ],
  },
];
```

2. Update types:
```typescript
// In types/index.ts
interface SessionRow {
  // ... existing fields
  rating: number; // Add new field
}
```

3. Update service functions:
```typescript
// In sessionService.ts
function rowToSession(row: SessionRow): Session {
  return {
    // ... existing mappings
    rating: row.rating,
  };
}
```

4. Test migration:
```typescript
await resetDatabase(db);
await initDatabase();
```

---

## Testing Issues

### Error: "Database not initialized" in Tests

**Symptom:** Tests fail with database errors

**Cause:** Database not mocked or initialized in tests

**Solution:**
```typescript
// Mock database in tests
jest.mock('../src/services/database', () => ({
  initDatabase: jest.fn(),
  getDatabase: jest.fn(() => mockDatabase),
}));

// Or use in-memory database
import { openDatabaseAsync } from 'expo-sqlite';

beforeAll(async () => {
  const db = await openDatabaseAsync(':memory:');
  // Initialize with migrations
});
```

---

### Problem: Tests Slow

**Symptom:** Test suite takes >5 seconds

**Cause:** Database operations in unit tests

**Solution:**
```typescript
// Unit tests should not hit database
// Use mocks instead
const mockGetSession = jest.fn();
jest.mock('./services/database/sessionService', () => ({
  getSessionById: mockGetSession,
}));

// Integration tests can use actual database
describe('Integration Tests', () => {
  let db: SQLiteDatabase;

  beforeAll(async () => {
    db = await openDatabaseAsync(':memory:');
    await runMigrations(db);
  });
});
```

**Result:** Unit tests <100ms, integration tests <1s

---

## Build & Compilation

### Error: "Cannot find module 'expo-sqlite'"

**Symptom:** Build fails with missing module

**Cause:** Dependency not installed

**Solution:**
```bash
pnpm add expo-sqlite
# or
pnpm install
```

---

### Error: TypeScript Strict Mode Errors

**Symptom:** Many type errors after enabling strict mode

**Cause:** Incomplete type annotations

**Solution:**
```typescript
// Add explicit return types
async function getSession(id: string): Promise<Session> { // Add return type
  return await getSessionById(id);
}

// Handle null/undefined
function getName(session: Session): string {
  return session.pitcherName ?? 'Unknown'; // Handle undefined
}

// Use type guards
if (pitch.metadata) { // Check before accessing
  console.log(pitch.metadata.notes);
}
```

---

## Runtime Errors

### Error: "Cannot read property '...' of undefined"

**Symptom:** App crashes accessing undefined value

**Common Causes:**

#### 1. Session Not Found
```typescript
// ❌ Unsafe
const session = await getSessionById(id);
console.log(session.name); // Might crash if not found

// ✅ Safe
try {
  const session = await getSessionById(id);
  console.log(session.name);
} catch (error) {
  console.error('Session not found');
  // Handle gracefully
}
```

#### 2. Calibration Missing
```typescript
// ❌ Unsafe
const cal = await getLatestCalibration();
const ppf = cal.pixelsPerFoot; // Crashes if null

// ✅ Safe
const cal = await getLatestCalibration();
if (!cal) {
  Alert.alert('Error', 'Please calibrate first');
  return;
}
const ppf = cal.pixelsPerFoot;
```

---

### Error: "Invalid Date"

**Symptom:** Date operations fail or show "Invalid Date"

**Cause:** Incorrect date format

**Solution:**
```typescript
// ❌ Wrong format
const date = '10-23-2025'; // US format
new Date(date); // Might parse incorrectly

// ✅ ISO format
const date = '2025-10-23'; // ISO format
new Date(date); // Always parses correctly

// Or use timestamp
const timestamp = Date.now();
new Date(timestamp);
```

**Rule:** Always use ISO date strings or Unix timestamps

---

### Memory Leak: App Slows Over Time

**Symptom:** App gets progressively slower

**Cause:** Not closing database connections or caching too much

**Solution:**
```typescript
// ❌ Bad - creates new connection each time
async function query() {
  const db = await openDatabaseAsync(DATABASE_NAME);
  return await db.getAllAsync('SELECT * FROM pitches');
  // Connection not closed!
}

// ✅ Good - use singleton
import { getDatabase } from './services/database';

async function query() {
  const db = getDatabase(); // Reuses connection
  return await db.getAllAsync('SELECT * FROM pitches');
}
```

**Prevention:**
- Use `getDatabase()` singleton
- Don't create multiple database connections
- Clear caches periodically

---

## Diagnostic Tools

### Check Database State
```typescript
// Get database info
const db = getDatabase();

// Check tables
const tables = await db.getAllAsync(`
  SELECT name FROM sqlite_master WHERE type='table'
`);
console.log('Tables:', tables);

// Check row counts
const pitchCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM pitches`);
console.log('Pitches:', pitchCount);

// Check indexes
const indexes = await db.getAllAsync(`
  SELECT name, tbl_name FROM sqlite_master WHERE type='index'
`);
console.log('Indexes:', indexes);
```

### Performance Profiling
```typescript
// Time operations
const measureTime = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  console.log(`${name}: ${duration}ms`);
  return result;
};

// Use it
await measureTime('Get Session', () => getSessionById(id));
await measureTime('Get Statistics', () => getSessionSummary(id));
```

### Validate Data Integrity
```typescript
// Check for orphaned pitches
const orphans = await db.getAllAsync(`
  SELECT COUNT(*) as count FROM pitches p
  LEFT JOIN sessions s ON p.session_id = s.id
  WHERE s.id IS NULL
`);
console.log('Orphaned pitches:', orphans[0].count);

// Check for invalid values
const invalid = await db.getAllAsync(`
  SELECT * FROM pitches
  WHERE height <= 0 OR uncertainty < 0 OR quality_score < 0 OR quality_score > 100
`);
console.log('Invalid pitches:', invalid.length);
```

---

## Getting Help

### Before Reporting Issues

1. **Check logs:**
```typescript
// Enable detailed logging
console.log('[Database] Initializing...');
await initDatabase();
console.log('[Database] Initialized');
```

2. **Verify database state:**
```typescript
const version = await getCurrentVersion(getDatabase());
console.log('Database version:', version);
```

3. **Test with minimal example:**
```typescript
// Isolate the problem
await initDatabase();
const session = await createSession({ /* minimal data */ });
console.log('Created:', session.id);
```

### Information to Include

When reporting issues, include:
- Error message and stack trace
- Database version
- Steps to reproduce
- Expected vs actual behavior
- Relevant code snippet

### Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Database not initialized | Call `await initDatabase()` on app startup |
| Foreign key error | Ensure parent record exists first |
| Slow queries | Check indexes, use batch operations |
| Type errors | Use correct domain types (not Row types) |
| Test failures | Mock database or use in-memory DB |
| Memory issues | Use singleton getDatabase(), clear caches |

---

## Additional Resources

- **API Reference:** `docs/API_QUICK_REFERENCE.md`
- **Phase 3 Complete:** `docs/PHASE3_COMPLETE.md`
- **Integration Examples:** `apps/mobile/src/examples/storageIntegration.ts`
- **Tests:** See `__tests__` folders for examples

---

*Troubleshooting Guide v1.0.0 - Last updated October 23, 2025 by Claude Code*
