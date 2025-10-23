# Pitch Height Tracker Pro - MVP Implementation Plan

## Project Overview

**Pitch Height Tracker Pro** is a mobile React Native application for tracking pitch heights in baseball/softball using computer vision. The app leverages VisionCamera with YUV color detection to track yellow ball positions and calculate pitch heights with calibration and uncertainty measurements.

### Core Value Proposition
- Real-time pitch height tracking using phone camera
- Automatic ball detection via computer vision
- Pitch data logging with uncertainty quantification
- Statistical analysis and CSV export for performance tracking
- Agentic AI integration for automated workflows

---

## 5-Phase Implementation Roadmap

### Phase 1: Repository Structure & Setup (Foundation)
**Duration:** 2-3 days | **Status:** In Progress | **Owner:** Core Team

**Objectives:**
- Establish monorepo structure for scalability
- Configure development environment
- Set up CI/CD infrastructure
- Create project documentation templates

**Tasks:**

1. **Directory Structure Setup** ✓
   - `/apps/mobile` - React Native Expo mobile app
   - `/shared/utils` - Shared utilities and components
   - `/.github/workflows` - CI/CD pipeline definitions
   - `/docs` - Project documentation

2. **Package Management** - In Progress
   - Create root `package.json` with workspace configuration
   - Set up Expo CLI and dependencies
   - Configure pnpm workspaces for monorepo management
   - Add build scripts and development commands

3. **TypeScript Configuration** - Pending
   - Create `tsconfig.json` for root and app directories
   - Set up strict type checking
   - Configure path aliases for cleaner imports
   - Add TypeScript linting rules

4. **Expo Configuration** - Pending
   - Create `app.json` with app metadata
   - Configure app icon and splash screen
   - Set up development client settings
   - Configure EAS (Expo Application Services) if needed

5. **GitHub Actions Workflows** - Pending
   - `build.yml` - Automated build pipeline
   - `test.yml` - Automated testing pipeline
   - `release.yml` - Release automation workflow
   - Add lint checks and type verification

6. **Documentation** - In Progress
   - Create MVP_PLAN.md (this file)
   - Add developer setup guide
   - Document architecture decisions
   - Create contribution guidelines

**Deliverables:**
- Complete directory structure
- Working package.json with all dependencies
- TypeScript configuration files
- app.json for Expo
- Three GitHub Actions workflows
- Development setup documentation

**Success Criteria:**
- `pnpm install` completes without errors
- `pnpm run dev` or `expo start` launches development server
- TypeScript compilation succeeds with no errors
- GitHub Actions workflows trigger on push

**Blockers/Decisions Needed:**
- Decision: EAS build services vs local build setup
- Decision: TypeScript strictness level preference

---

### Phase 2: Core Tracking Features (MVP Core)
**Duration:** 4-5 days | **Status:** Not Started | **Owner:** Computer Vision Team

**Objectives:**
- Implement real-time camera tracking
- Build ball detection using color space analysis
- Create calibration system with quality feedback
- Ensure performant frame processing

**Dependencies:** Phase 1 (completed repository setup)

**Tasks:**

1. **Draggable ROI Component**
   - Create reusable ROI (Region of Interest) overlay
   - Implement pan gesture responder for positioning
   - Add resizing handles for dynamic sizing
   - Persist ROI state across sessions
   - Add visual feedback (grid, crosshairs)

2. **VisionCamera Integration**
   - Install and configure VisionCamera
   - Set up camera frame processor
   - Implement YUV color space handling
   - Configure camera permissions
   - Handle platform-specific camera behaviors

3. **Yellow Ball Detection (YUV Gating)**
   - Implement YUV color space conversion
   - Define yellow ball color thresholds
   - Create efficient filtering algorithm
   - Optimize for real-time performance
   - Add configurable sensitivity controls

4. **Calibration Quality Meter**
   - Measure tracking quality metrics
   - Calculate uncertainty values
   - Display real-time quality feedback
   - Implement progress indicator
   - Add guidance text for user calibration

5. **Animated Calibration Coach Overlay**
   - Create overlay component for guidance
   - Implement animated callouts
   - Add success/failure animations
   - Provide contextual help messages
   - Design intuitive coach interface

**Deliverables:**
- Working camera feed with ROI overlay
- Real-time ball detection visualization
- Calibration interface with quality metrics
- Performance benchmarks (FPS, detection latency)
- Feature documentation

**Success Criteria:**
- App successfully detects yellow balls in real-time
- Calibration process completes in <30 seconds
- Frame processing runs at 30+ FPS
- ROI can be adjusted without stuttering
- Uncertainty values are within expected ranges

**Technical Considerations:**
- YUV conversion must be optimized for real-time processing
- Frame processor should run on worker thread
- ROI updates should be debounced for performance
- Calibration should account for lighting variations

---

### Phase 3: Data Layer & Logging (Persistence)
**Duration:** 3-4 days | **Status:** Not Started | **Owner:** Backend/Storage Team

**Objectives:**
- Implement persistent storage solution
- Create data models for pitch tracking
- Implement uncertainty calculations
- Enable session management

**Dependencies:** Phase 2 (tracking data available), Phase 1 (project setup)

**Tasks:**

1. **SQLite/AsyncStorage Setup**
   - Choose between SQLite (expo-sqlite) or AsyncStorage
   - Initialize database with migration system
   - Configure encryption for sensitive data
   - Implement backup/restore functionality
   - Add database versioning support

2. **Pitch Data Model**
   - Define pitch schema with fields:
     - ID (unique identifier)
     - Height (in feet/meters)
     - Uncertainty (±value)
     - Timestamp
     - Session ID (reference)
     - Tracking quality metrics
     - Metadata (pitcher, batter, ball type)
   - Create TypeScript interfaces for type safety
   - Implement data validation schemas

3. **Session Management**
   - Define session model (collection of pitches)
   - Implement session creation and closure
   - Add session metadata (date, pitcher, location)
   - Create session filtering/querying
   - Implement session-level statistics

4. **Uncertainty Calculations**
   - Implement confidence interval calculations
   - Account for calibration accuracy
   - Factor in measurement noise
   - Create uncertainty propagation formulas
   - Add statistical distribution modeling

5. **Storage & Queries**
   - Implement CRUD operations for pitches
   - Create efficient query builders
   - Add indexing for performance
   - Implement batch operations
   - Add transaction support for data integrity

**Deliverables:**
- Database schema documentation
- TypeScript data models and types
- Storage utility functions
- Query performance benchmarks
- Migration system documentation

**Success Criteria:**
- Can store/retrieve 1000+ pitches efficiently
- Queries execute in <100ms
- Uncertainty values calculated and stored
- Data integrity maintained across app restarts
- TypeScript types catch storage errors at compile time

**Technical Decisions:**
- Storage choice: SQLite for offline support and performance
- Package manager: pnpm for efficient workspace management
- Uncertainty calculation: Bayesian approach for confidence intervals
- Query optimization: Indexed lookups for date ranges and sessions

---

### Phase 4: Dashboard & Export (Analytics)
**Duration:** 3-4 days | **Status:** Not Started | **Owner:** UI/Analytics Team

**Objectives:**
- Create intuitive analytics interface
- Implement data export functionality
- Provide statistical insights
- Integrate native sharing

**Dependencies:** Phase 3 (data available), Phase 2 (tracking complete)

**Tasks:**

1. **Session List Screen**
   - Display all recorded sessions
   - Show session summaries (date, pitch count, avg height)
   - Implement filtering by date range
   - Add search by session name
   - Create swipe-to-delete or archive
   - Show session quality metrics

2. **Statistics Calculation & Display**
   - Calculate min/max/avg pitch heights
   - Compute variance and standard deviation
   - Generate distribution histograms
   - Create trend analysis
   - Implement percentile calculations
   - Add comparative statistics

3. **CSV Export Functionality**
   - Format pitch data as CSV
   - Include headers and metadata
   - Export with uncertainty values
   - Add session summary sections
   - Support filtered exports
   - Implement proper field escaping

4. **Native Share Sheet Integration**
   - Use expo-sharing for file sharing
   - Create shareable CSV files
   - Support email and cloud sharing
   - Add social media sharing options
   - Implement filename conventions
   - Handle share success/failure

5. **Dashboard Layout**
   - Create bottom tab navigation (Sessions, Stats, Settings)
   - Design statistics overview screen
   - Build session detail view
   - Implement pitch history table
   - Add charts and visualizations

**Deliverables:**
- Complete dashboard UI
- Statistics calculation utilities
- CSV export functionality
- Share integration examples
- Data visualization components

**Success Criteria:**
- Sessions list loads in <500ms for 100+ sessions
- CSV exports contain accurate data
- Statistics calculations are mathematically correct
- Share sheet opens system native dialog
- Dashboard remains responsive with large datasets

**UI/UX Considerations:**
- Clean, intuitive navigation
- Real-time statistics updates
- Visual data representations (charts, graphs)
- Clear uncertainty communication to users

---

### Phase 5: Agentic AI Integration (Automation)
**Duration:** 3-4 days | **Status:** Not Started | **Owner:** AI/Automation Team

**Objectives:**
- Integrate agent-driven workflows
- Enable automated build/test/release
- Implement telemetry for insights
- Create extensible AI hooks

**Dependencies:** All previous phases (complete app functionality)

**Tasks:**

1. **Agent Hooks Setup**
   - Define MCP (Model Context Protocol) endpoints
   - Create agent-callable functions
   - Implement authentication/authorization
   - Add request validation
   - Set up logging and monitoring

2. **MCP Server Endpoints**
   - Data export endpoint (pitch data access)
   - Analytics endpoint (statistics queries)
   - Session management endpoint
   - Configuration endpoint
   - Health check endpoint

3. **Automated Pipelines**
   - CI/CD triggered by commits
   - Automated testing on pull requests
   - Release automation on version tags
   - Dependency update automation
   - Performance regression detection

4. **Telemetry & Analytics**
   - Track app usage metrics
   - Log feature utilization
   - Monitor crash reports
   - Capture performance metrics
   - Analyze user behavior patterns

5. **Documentation & Extensibility**
   - Create agent integration documentation
   - Define workflow examples
   - Document API contracts
   - Provide SDK/client libraries
   - Create agent testing framework

**Deliverables:**
- MCP server implementation
- Agent endpoint documentation
- Automated workflow definitions
- Telemetry dashboard
- Integration guide for external agents

**Success Criteria:**
- Agents can successfully execute workflows
- Build/test/release pipeline fully automated
- Telemetry data collected and accessible
- Documentation enables third-party integration
- System handles 100+ agent requests/day

**Scalability Considerations:**
- Rate limiting for agent requests
- Queuing system for async operations
- Monitoring and alerting
- Agent failure recovery

---

## Technical Architecture

### Technology Stack
- **Framework:** React Native with Expo (cross-platform mobile)
- **Camera:** VisionCamera (real-time frame processing)
- **Storage:** SQLite (local persistence) + AsyncStorage (session cache)
- **Language:** TypeScript (type safety)
- **Color Detection:** YUV color space analysis
- **Build/Deploy:** Expo CLI + GitHub Actions
- **State Management:** React Context or Redux (TBD)
- **Navigation:** React Navigation
- **Analytics:** Telemetry library (TBD)

### Component Architecture

```
App (Root)
├── TrackingScreen (Phase 2)
│   ├── CameraView (VisionCamera)
│   ├── ROIOverlay (Draggable)
│   ├── BallDetector (YUV Filter)
│   ├── CalibrationMeter (Quality)
│   └── CoachOverlay (Guidance)
├── DashboardScreen (Phase 4)
│   ├── SessionList
│   ├── StatisticsView
│   └── ExportControls
├── SettingsScreen
└── AgentHooks (Phase 5)
```

### Data Flow

```
CameraFrame → YUVDetection → BallPosition →
Calibration → PitchHeight → Uncertainty →
Storage → Analytics → Export/Share
```

---

## Phase Completion Criteria & Milestones

| Phase | Target Date | Key Deliverables | Status |
|-------|------------|------------------|--------|
| Phase 1 | 2 days | Project structure, configs, CI/CD | In Progress |
| Phase 2 | 7 days | Camera tracking, ball detection | Not Started |
| Phase 3 | 10 days | Data persistence, calculations | Not Started |
| Phase 4 | 13 days | Dashboard, analytics, export | Not Started |
| Phase 5 | 16 days | AI integration, automation | Not Started |

---

## Success Metrics

### Functional Metrics
- Ball detection accuracy >95% under normal lighting
- Pitch height measurement uncertainty <±0.5 feet
- Calibration completion rate >90%
- CSV export accuracy 100%

### Performance Metrics
- Camera frame processing >30 FPS
- UI responsiveness <100ms latency
- Storage query performance <100ms
- App startup time <3 seconds

### User Experience Metrics
- Calibration time <30 seconds
- Session recording intuitive (success on first attempt >80%)
- Export completion rate >95%
- User retention >60% at 2-week mark

---

## Risk Mitigation

### Technical Risks
- **Camera Performance:** Optimize frame processor, run on worker thread
- **Color Detection Accuracy:** Test extensively under varied lighting, add sensitivity controls
- **Data Accuracy:** Implement uncertainty calculations, validate against known heights
- **Storage Scalability:** Use SQLite indexing, implement data archival

### Operational Risks
- **Timeline Overrun:** Daily standups, aggressive scope management
- **Dependency Issues:** Pin versions, maintain upgrade plan
- **Testing Coverage:** Implement unit and integration tests in each phase
- **Documentation Gaps:** Write docs as we build, not after

---

## Decision Log

### Phase 1 Decisions
- **Database Choice:** SQLite via expo-sqlite for offline support and performance
- **Monorepo Strategy:** pnpm workspaces for efficient package management
- **TypeScript Strictness:** Strict mode for type safety
- **CI/CD Platform:** GitHub Actions (native to repo, no external cost)

### Pending Decisions (For Phase 2+)
- State management approach (Context API vs Redux vs Zustand)
- Exact uncertainty calculation methodology
- Chart library selection for analytics
- Analytics platform (Sentry, Firebase, custom)

---

## Success Definition

**MVP is complete when:**
1. Users can track pitches in real-time using phone camera
2. App accurately measures pitch height with documented uncertainty
3. Users can export pitch data as CSV for analysis
4. App persists data locally and survives app crashes
5. Automated workflows enable agent-driven actions
6. App runs smoothly at 30+ FPS on target devices

---

## Next Steps

1. Complete Phase 1 setup (today)
2. Set up development environment documentation
3. Create sprint backlog for Phase 2
4. Schedule team sync on computer vision approach
5. Begin VisionCamera proof-of-concept in parallel

