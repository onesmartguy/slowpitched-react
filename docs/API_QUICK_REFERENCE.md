# API Quick Reference Guide

**Phase 3 Storage Layer API**
**Version:** 1.0.0
**Last Updated:** October 23, 2025

---

## Quick Start

```typescript
// 1. Initialize database (app startup)
import { initDatabase } from './services/database';
await initDatabase();

// 2. Import services as needed
import { createSession, createPitch } from './services/database';
import { getSessionSummary } from './services/database/statisticsService';
```

---

## Database Initialization

### `initDatabase()`
Initialize the database with migrations.

```typescript
import { initDatabase } from './services/database';

await initDatabase();
// Returns: SQLiteDatabase instance
```

**Call this once on app startup.**

---

## Session Operations

### Create Session
```typescript
import { createSession } from './services/database/sessionService';

const session = await createSession({
  id: 'session_' + Date.now(),
  name: 'Practice Session',
  date: '2025-10-23',
  pitcherName: 'John Doe',
  location: 'Field A',
  notes: 'Fastball practice',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Get Session
```typescript
import { getSessionById } from './services/database/sessionService';

const session = await getSessionById('session_123');
// Returns: Session with pitchCount computed
```

### Get All Sessions
```typescript
import { getAllSessions } from './services/database/sessionService';

const sessions = await getAllSessions();
// Returns: Session[] (newest first)
```

### Search Sessions
```typescript
import { searchSessions } from './services/database/sessionService';

const results = await searchSessions('John');
// Searches name and pitcher_name
```

### Update Session
```typescript
import { updateSession } from './services/database/sessionService';

await updateSession({
  ...session,
  notes: 'Updated notes',
  updatedAt: Date.now(),
});
```

### Delete Session
```typescript
import { deleteSession } from './services/database/sessionService';

await deleteSession('session_123');
// Cascades to delete all pitches
```

---

## Pitch Operations

### Create Pitch
```typescript
import { createPitch } from './services/database/pitchService';

const pitch = await createPitch({
  id: 'pitch_' + Date.now(),
  sessionId: 'session_123',
  height: 4.5,
  uncertainty: 0.08,
  timestamp: Date.now(),
  qualityScore: 92,
  ballPosition: { x: 150, y: 300 },
  calibrationId: 'cal_456',
  metadata: { notes: 'Good detection' },
});
```

### Get Pitches by Session
```typescript
import { getPitchesBySession } from './services/database/pitchService';

const pitches = await getPitchesBySession('session_123');
// Returns: Pitch[] ordered by timestamp
```

### Get High-Quality Pitches
```typescript
import { getHighQualityPitches } from './services/database/pitchService';

const goodPitches = await getHighQualityPitches('session_123', 85);
// Returns pitches with quality >= 85
```

### Batch Insert Pitches
```typescript
import { createPitchesBatch } from './services/database/pitchService';

await createPitchesBatch([pitch1, pitch2, pitch3]);
// Uses transaction for atomicity
```

### Delete Pitch
```typescript
import { deletePitch } from './services/database/pitchService';

await deletePitch('pitch_123');
```

---

## Calibration Operations

### Create Calibration
```typescript
import { createCalibration } from './services/database/calibrationStorageService';

const calibration = await createCalibration({
  referenceHeight: 5.0,
  pixelsPerFoot: 24.5,
  qualityScore: 95,
  uncertainty: 0.05,
  roi: { x: 100, y: 50, width: 200, height: 400 },
});
```

### Get Latest Calibration
```typescript
import { getLatestCalibration } from './services/database/calibrationStorageService';

const calibration = await getLatestCalibration();
// Returns most recent, or null if none
```

### Prune Old Calibrations
```typescript
import { pruneOldCalibrations } from './services/database/calibrationStorageService';

const deleted = await pruneOldCalibrations(10);
// Keeps only 10 most recent, returns count deleted
```

---

## Statistics Operations

### Get Session Statistics
```typescript
import { calculateSessionStatistics } from './services/database/statisticsService';

const stats = await calculateSessionStatistics('session_123');
// Returns: {
//   minHeight, maxHeight, avgHeight,
//   stdDev, variance, medianHeight,
//   percentile25, percentile75, totalPitches
// }
```

### Get Session Summary
```typescript
import { getSessionSummary } from './services/database/statisticsService';

const summary = await getSessionSummary('session_123');
// Returns: {
//   statistics: SessionStatistics,
//   avgUncertainty: number,
//   qualityDistribution: {
//     excellent, good, fair, poor
//   },
//   pitchFrequency: number
// }
```

### Get Height Distribution
```typescript
import { getPitchHeightDistribution } from './services/database/statisticsService';

const histogram = await getPitchHeightDistribution('session_123', 10);
// Returns 10 bins with { binStart, binEnd, count }
```

### Get Quality Distribution
```typescript
import { getPitchQualityDistribution } from './services/database/statisticsService';

const dist = await getPitchQualityDistribution('session_123');
// Returns: { excellent, good, fair, poor }
```

---

## Uncertainty Calculations

### Calculate Pitch Uncertainty
```typescript
import { calculatePitchUncertainty, estimateMeasurementNoise } from '@shared/uncertainty';

const noise = estimateMeasurementNoise(pixelsPerFoot, detectionConfidence);
const uncertainty = calculatePitchUncertainty(
  calibrationUncertainty,
  noise,
  qualityScore
);
```

### Calibration Uncertainty
```typescript
import { calculateCalibrationUncertainty } from '@shared/uncertainty';

const uncertainty = calculateCalibrationUncertainty(
  [120, 122, 119, 121, 120], // pixel measurements
  5.0 // reference height in feet
);
```

### Confidence Intervals
```typescript
import { calculateConfidenceInterval } from '@shared/uncertainty';

const [lower, upper] = calculateConfidenceInterval(
  mean,
  standardError,
  0.95 // 95% confidence
);
```

### Bayesian Update
```typescript
import { bayesianUncertaintyUpdate } from '@shared/uncertainty';

const { mean, uncertainty } = bayesianUncertaintyUpdate(
  priorMean,
  priorUncertainty,
  newMeasurement,
  measurementUncertainty
);
```

---

## Common Patterns

### Complete Workflow

```typescript
// 1. Initialize
await initDatabase();

// 2. Create session
const session = await createSession({
  id: 'session_' + Date.now(),
  name: 'Training',
  date: new Date().toISOString().split('T')[0],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 3. Store calibration
const calibration = await createCalibration({
  referenceHeight: 5.0,
  pixelsPerFoot: 24.5,
  qualityScore: 95,
  uncertainty: 0.05,
  roi: { x: 0, y: 0, width: 100, height: 100 },
});

// 4. Store pitches (in detection loop)
const pitch = await createPitch({
  id: 'pitch_' + Date.now(),
  sessionId: session.id,
  height: pixelY / calibration.pixelsPerFoot,
  uncertainty: calculatePitchUncertainty(...),
  timestamp: Date.now(),
  qualityScore: detection.confidence,
  ballPosition: { x: detection.x, y: detection.y },
  calibrationId: calibration.id,
});

// 5. Get statistics
const summary = await getSessionSummary(session.id);
console.log(`Average: ${summary.statistics.avgHeight.toFixed(2)} ft`);
```

### CSV Export Pattern

```typescript
import { getSessionById, getPitchesBySession } from './services/database';
import { calculateSessionStatistics } from './services/database/statisticsService';

const session = await getSessionById(sessionId);
const pitches = await getPitchesBySession(sessionId);
const stats = await calculateSessionStatistics(sessionId);

let csv = 'Pitch #,Timestamp,Height (ft),Uncertainty (±ft),Quality\n';
pitches.forEach((pitch, i) => {
  csv += `${i + 1},${new Date(pitch.timestamp).toISOString()},`;
  csv += `${pitch.height.toFixed(2)},${pitch.uncertainty.toFixed(2)},`;
  csv += `${pitch.qualityScore.toFixed(0)}\n`;
});

// Use expo-sharing to share CSV
```

### Query Pattern

```typescript
// Get recent sessions
const recent = await getRecentSessions(10);

// Get sessions from last week
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
const endDate = new Date().toISOString().split('T')[0];
const lastWeek = await getSessionsByDateRange(startDate, endDate);

// Get high-quality pitches only
const excellent = await getHighQualityPitches(sessionId, 90);
```

---

## Type Definitions

### Session
```typescript
interface Session {
  id: string;
  name: string;
  date: string; // ISO date (YYYY-MM-DD)
  pitcherName?: string;
  location?: string;
  notes?: string;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
  pitchCount?: number; // Computed
}
```

### Pitch
```typescript
interface Pitch {
  id: string;
  sessionId: string;
  height: number; // feet
  uncertainty: number; // ±feet
  timestamp: number; // Unix timestamp (ms)
  qualityScore: number; // 0-100
  ballPosition: { x: number; y: number };
  calibrationId?: string;
  metadata?: {
    pitchType?: string;
    ballType?: string;
    notes?: string;
  };
  createdAt?: number;
}
```

### CalibrationData
```typescript
interface CalibrationData {
  id?: string;
  referenceHeight: number; // feet
  pixelsPerFoot: number;
  qualityScore: number; // 0-100
  uncertainty: number; // ±feet
  roi: { x: number; y: number; width: number; height: number };
  timestamp?: number;
  createdAt?: number;
}
```

### SessionStatistics
```typescript
interface SessionStatistics {
  minHeight: number;
  maxHeight: number;
  avgHeight: number;
  stdDev: number;
  variance: number;
  medianHeight: number;
  percentile25: number;
  percentile75: number;
  totalPitches: number;
}
```

---

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const session = await getSessionById(id);
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

### Common Errors
- `"Session not found: {id}"` - Session doesn't exist
- `"Pitch not found: {id}"` - Pitch doesn't exist
- `"Calibration not found: {id}"` - Calibration doesn't exist
- `"Database not initialized"` - Call initDatabase() first

---

## Performance Tips

### 1. Use Batch Operations
```typescript
// ❌ Slow
for (const pitch of pitches) {
  await createPitch(pitch);
}

// ✅ Fast
await createPitchesBatch(pitches);
```

### 2. Query Only What You Need
```typescript
// ❌ Gets all pitches then filters
const all = await getPitchesBySession(sessionId);
const good = all.filter(p => p.qualityScore > 85);

// ✅ Filters in database
const good = await getHighQualityPitches(sessionId, 85);
```

### 3. Use Indexes
```typescript
// ✅ Fast - uses index on session_id
await getPitchesBySession(sessionId);

// ✅ Fast - uses index on timestamp
await getPitchesByDateRange(start, end);

// ✅ Fast - uses index on quality_score
await getHighQualityPitches(sessionId, minQuality);
```

---

## Best Practices

### 1. Always Initialize Database
```typescript
// In App.tsx or index.js
useEffect(() => {
  initDatabase().catch(console.error);
}, []);
```

### 2. Use Descriptive IDs
```typescript
// ✅ Good - includes timestamp and type
const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ❌ Bad - could collide
const id = Math.random().toString();
```

### 3. Handle Errors Gracefully
```typescript
try {
  await createPitch(pitch);
} catch (error) {
  console.error('Failed to save pitch:', error);
  // Show user-friendly message
  Alert.alert('Error', 'Failed to save pitch. Please try again.');
}
```

### 4. Update Session Timestamp
```typescript
const session = await getSessionById(sessionId);
await updateSession({
  ...session,
  updatedAt: Date.now(), // Update timestamp
});
```

### 5. Validate Before Storing
```typescript
import { isValidPitch } from '@shared/validation';

if (!isValidPitch(pitch)) {
  throw new Error('Invalid pitch data');
}
await createPitch(pitch);
```

---

## Testing

### Mock Database in Tests
```typescript
jest.mock('./services/database', () => ({
  initDatabase: jest.fn(),
  getDatabase: jest.fn(() => mockDb),
}));
```

### Test with In-Memory Database
```typescript
import { openDatabaseAsync } from 'expo-sqlite';

const testDb = await openDatabaseAsync(':memory:');
// Run tests with testDb
```

---

## Migration Guide

### Adding New Fields

1. Create new migration in `schema.ts`:
```typescript
{
  version: 2,
  name: 'add_pitcher_notes',
  up: [
    'ALTER TABLE sessions ADD COLUMN pitcher_notes TEXT;',
  ],
  down: [
    // SQLite doesn't support DROP COLUMN easily
    // May need to recreate table
  ],
}
```

2. Update type definitions in `types/index.ts`

3. Update service functions to handle new field

4. Add tests for new functionality

---

## Troubleshooting

### Database Not Found
**Error:** `Database not initialized`
**Solution:** Call `await initDatabase()` before any database operations

### Foreign Key Violations
**Error:** `FOREIGN KEY constraint failed`
**Solution:** Ensure session exists before creating pitches

### Type Errors
**Error:** `Property 'x' does not exist on type 'Y'`
**Solution:** Ensure you're using the correct type (Session vs SessionRow)

### Performance Issues
**Problem:** Slow queries
**Solution:**
- Check if indexes are being used
- Use batch operations
- Query only necessary fields

---

## Support

**Documentation:** See `docs/PHASE3_COMPLETE.md`
**Examples:** See `apps/mobile/src/examples/storageIntegration.ts`
**Issues:** GitHub repository issues

---

*API Version 1.0.0 - Last updated October 23, 2025 by Claude Code*
