# System Architecture - Pitch Height Tracker Pro

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface Layer                   │
│  (React Native Components, Screens, Navigation)         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│              State Management Layer                      │
│  (Zustand Store, Context API)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│              Business Logic Layer                        │
│  (Hooks, Camera Processing, Calculations)              │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│              Data Access Layer                           │
│  (SQLite, AsyncStorage, Local Cache)                    │
└─────────────────────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│          Native Platform Layer                           │
│  (Camera, Sensors, File System)                         │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Phase 1: Current Structure (Foundation)

```
App Root
├── TrackingScreen (Phase 2)
│   ├── CameraView
│   ├── ROIOverlay
│   ├── BallDetector
│   ├── CalibrationMeter
│   └── CoachOverlay
├── DashboardScreen (Phase 4)
│   ├── SessionList
│   ├── StatisticsView
│   └── ExportControls
├── SettingsScreen
└── Navigation Setup
```

### Directory Organization

#### Apps/Mobile

```
apps/mobile/src/
├── components/           # Reusable UI components
│   ├── CameraView.tsx
│   ├── ROIOverlay.tsx
│   ├── BallDetector.tsx
│   ├── CalibrationMeter.tsx
│   └── CoachOverlay.tsx
├── screens/              # Screen-level components
│   ├── TrackingScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── SessionDetailScreen.tsx
│   └── SettingsScreen.tsx
├── utils/                # App-specific utilities
│   ├── storage.ts        # Local storage helpers
│   ├── camera.ts         # Camera utilities
│   └── formatting.ts     # Format helpers
├── types/                # TypeScript type definitions
│   └── index.ts
├── hooks/                # Custom React hooks
│   ├── useCamera.ts
│   ├── useTracker.ts
│   ├── usePitchStorage.ts
│   └── useCalibration.ts
├── store/                # Zustand state management
│   ├── trackingStore.ts
│   ├── sessionStore.ts
│   └── uiStore.ts
├── App.tsx               # Root component
└── index.tsx             # Entry point
```

#### Shared/Utils

```
shared/utils/src/
├── constants.ts          # Shared constants
├── calculation.ts        # Math utilities
├── validation.ts         # Data validation
└── index.ts              # Public API
```

## Data Flow

### Pitch Tracking Flow

```
1. User starts tracking session
   ↓
2. Camera frame captured
   ↓
3. YUV color space analysis
   ↓
4. Yellow ball detection (ROI-filtered)
   ↓
5. Ball position calculation
   ↓
6. Calibration-based height conversion
   ↓
7. Uncertainty calculation
   ↓
8. Quality scoring
   ↓
9. Storage (SQLite)
   ↓
10. UI update
```

### Session Persistence Flow

```
User Records Pitch
   ↓
Pitch Object Created
   ↓
Validation Check
   ↓
Storage Layer (SQLite)
   ↓
Session Index Updated
   ↓
Cache Updated (AsyncStorage)
   ↓
UI Refresh
```

## State Management Architecture

### Zustand Store Structure

```typescript
// trackingStore.ts
store = {
  // Current tracking state
  isTracking: boolean,
  currentSession: Session,
  pitches: Pitch[],

  // Actions
  startTracking: () => void,
  stopTracking: () => void,
  recordPitch: (pitch: Pitch) => void,
  setCalibration: (data: CalibrationData) => void,
}

// sessionStore.ts
store = {
  // Session management
  sessions: Session[],
  selectedSession: Session | null,

  // Actions
  createSession: () => void,
  loadSession: (id: string) => void,
  deleteSession: (id: string) => void,
  exportSession: (id: string) => void,
}

// uiStore.ts
store = {
  // UI state
  showCalibration: boolean,
  showSettings: boolean,
  roiPosition: ROI,

  // Actions
  toggleCalibration: () => void,
  setROIPosition: (roi: ROI) => void,
}
```

## Camera Integration Architecture

### Frame Processing Pipeline

```
VisionCamera Frame
   ↓
[Frame Buffer (5 frames)]
   ↓
YUV Analysis Worker Thread
   ├─ Color space conversion
   ├─ Thresholding
   └─ Contour detection
   ↓
Ball Detection Results
   ├─ Position (x, y)
   ├─ Confidence (0-1)
   └─ Pixel count
   ↓
Calibration Transform
   └─ Pixel → Feet conversion
   ↓
Height Calculation + Uncertainty
   ↓
State Update
   ↓
UI Render
```

### YUV Color Detection

```
YUV Thresholds:
├─ Hue: 30-60 degrees (yellow range)
├─ Saturation: >0.5 (vivid colors)
└─ Value: >0.5 (sufficient brightness)

Filtering:
├─ Apply ROI mask
├─ Filter by threshold
├─ Find contours
├─ Calculate centroid
└─ Confidence scoring
```

## Data Model

### Pitch Entity

```typescript
interface Pitch {
  id: string;                    // UUID v4
  sessionId: string;             // Reference to session
  height: number;                // Feet (0-12)
  uncertainty: number;           // ±feet (0-5)
  timestamp: number;             // Unix ms
  qualityScore: number;          // 0-100
  ballPosition: {
    x: number;                   // Pixel x
    y: number;                   // Pixel y
  };
  metadata?: {
    pitchType?: string;
    ballType?: string;
    notes?: string;
  };
}
```

### Session Entity

```typescript
interface Session {
  id: string;                    // UUID v4
  createdAt: number;             // Unix ms
  updatedAt: number;             // Unix ms
  name: string;                  // User-provided
  pitchCount: number;            // Denormalized for query performance
  metadata?: {
    location?: string;
    pitcher?: string;
    conditions?: string;
  };
}
```

### Storage Schema

#### Pitches Table

```sql
CREATE TABLE pitches (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  height REAL NOT NULL,
  uncertainty REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  qualityScore REAL NOT NULL,
  ballPositionX REAL NOT NULL,
  ballPositionY REAL NOT NULL,
  pitchType TEXT,
  ballType TEXT,
  notes TEXT,
  FOREIGN KEY(sessionId) REFERENCES sessions(id)
);

CREATE INDEX idx_sessionId ON pitches(sessionId);
CREATE INDEX idx_timestamp ON pitches(timestamp);
```

#### Sessions Table

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  name TEXT NOT NULL,
  pitchCount INTEGER NOT NULL,
  location TEXT,
  pitcher TEXT,
  conditions TEXT
);

CREATE INDEX idx_createdAt ON sessions(createdAt);
```

## API Surface (Phase 5)

### MCP Endpoints

```
GET /api/sessions
  Returns: Session[]

POST /api/sessions
  Body: { name, metadata }
  Returns: Session

GET /api/sessions/:id/pitches
  Returns: Pitch[]

GET /api/sessions/:id/statistics
  Returns: SessionStatistics

POST /api/export/:sessionId
  Returns: CSV data

POST /api/calibration
  Body: CalibrationData
  Returns: { success }
```

## Performance Considerations

### Camera Processing

- Target: 30+ FPS
- Frame processor runs on worker thread
- Buffer latest 5 frames for analysis
- Skip frames if processing behind

### Storage

- Indexed queries for session lookups
- Batch inserts for pitch data
- Async operations to prevent UI blocking
- Periodic cleanup of old sessions

### Memory Management

- Limit frame buffer to 5 frames
- Release processed frames
- Cleanup store on unmount
- Use weak references where possible

## Error Handling

### Camera Layer

```
Error Types:
├─ PermissionDenied → Show permission request
├─ CameraNotAvailable → Show fallback UI
├─ ProcessingError → Log and retry
└─ FrameTimeout → Drop frame and continue
```

### Storage Layer

```
Error Types:
├─ DatabaseError → Show retry dialog
├─ ValidationError → Log and reject
├─ QuotaExceeded → Show cleanup prompt
└─ CorruptedData → Restore from backup
```

### Application Layer

```
Error Handling:
├─ Boundary errors with fallback UI
├─ Comprehensive logging
├─ User-friendly error messages
└─ Automatic recovery where possible
```

## Security Considerations

### Data Protection

- SQLite database encrypted at rest (Phase 3)
- Sensitive data not logged
- Session tokens secured (Phase 5)
- API calls over HTTPS only

### Camera Permissions

- Request permission explicitly
- Educate users on privacy
- Allow opt-out
- Minimal data collection

## Testing Strategy

### Unit Tests

```
├─ Utilities (calculation, validation)
├─ Store actions
├─ Type definitions
└─ Helper functions
```

### Integration Tests

```
├─ Camera → Detection
├─ Detection → Storage
├─ Storage → UI
└─ Full flow end-to-end
```

### Performance Tests

```
├─ Frame processing latency
├─ Storage query performance
├─ Memory usage profiles
└─ Stress testing
```

## Deployment Pipeline

### Build Process

```
1. Install dependencies
   ↓
2. Type checking
   ↓
3. Linting & formatting
   ↓
4. Run tests
   ↓
5. Build app
   ↓
6. Create release build
```

### Distribution

```
iOS → App Store (EAS Build)
Android → Google Play Store (EAS Build)
```

## Future Extensibility

### Plugin Architecture (Phase 5+)

- Agent hooks for automation
- Custom calculation modules
- External storage providers
- Analytics integrations
- Third-party APIs

### Scaling Considerations

- Move to cloud storage (Firebase, AWS)
- Implement sync protocol
- Add collaboration features
- Multi-device support

---

**Last Updated:** Phase 1 Setup
**Status:** Architecture framework in place, implementation ongoing
