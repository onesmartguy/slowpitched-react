# Phase 7.1: Testing Strategy - Progress Report

**Started**: October 27, 2025
**Status**: IN PROGRESS
**Current Coverage**: 17.45%
**Target Coverage**: 80%+

---

## Current Test Coverage Analysis

### Overall Metrics
- **Statements**: 17.45% (target: 70%+)
- **Branches**: 15.49% (target: 70%+)
- **Functions**: 22.94% (target: 70%+)
- **Lines**: 17.05% (target: 70%+)

### Well-Tested Modules (>70% coverage)
✅ **Shared Utils** (85.36% statements)
- `calculation.ts`: 100% coverage
- `constants.ts`: 100% coverage
- `uncertainty.ts`: 100% coverage
- `validation.ts`: 62.5% coverage (needs improvement)

✅ **Core Services** (60.83% statements)
- `calibrationService.ts`: 97.87% coverage
- `colorDetectionService.ts`: 98.11% coverage
- `trackingPipeline.ts`: 90.56% coverage

### Critical Gaps (0% coverage)

#### 1. React Hooks (0% coverage) - HIGH PRIORITY
- [ ] `useCalibration.ts` (0% coverage, 99 lines)
- [ ] `useCameraPermissions.ts` (0% coverage, 50 lines)
- [ ] `useFrameProcessing.ts` (0% coverage, 82 lines)
- [ ] `useYUVDetection.ts` (0% coverage, 87 lines)

**Impact**: These hooks are core to the tracking functionality
**Estimated Tests Needed**: 20-30 tests
**Priority**: CRITICAL

#### 2. Database Services (2.02% coverage) - HIGH PRIORITY
- [ ] `pitchService.ts` (0% coverage, 215 lines)
- [ ] `sessionService.ts` (0% coverage, 184 lines)
- [ ] `statisticsService.ts` (0% coverage, 194 lines)
- [ ] `userService.ts` (0% coverage, 295 lines)
- [ ] `calibrationStorageService.ts` (0% coverage, 158 lines)
- [ ] `migrations.ts` (0% coverage, 152 lines)

**Impact**: Data persistence and integrity
**Estimated Tests Needed**: 40-50 tests
**Priority**: CRITICAL

#### 3. UI Components (0% coverage) - MEDIUM PRIORITY
- [ ] `ROIComponent.tsx` (0% coverage, 101 lines)
- [ ] `CalibrationMeter.tsx` (0% coverage, 89 lines)
- [ ] `CoachOverlay.tsx` (0% coverage, 93 lines)
- [ ] `BallDetectionIndicator.tsx` (0% coverage, 48 lines)

**Impact**: User interface functionality
**Estimated Tests Needed**: 15-20 tests
**Priority**: MEDIUM

#### 4. Screen Components (0% coverage) - MEDIUM PRIORITY
- [ ] `TrackingScreen.tsx` (0% coverage, 174 lines)
- [ ] `DashboardScreen.tsx` (0% coverage, 236 lines)
- [ ] `SessionDetailScreen.tsx` (0% coverage, 369 lines)
- [ ] `LoginScreen.tsx` (0% coverage, 107 lines)
- [ ] `RegisterScreen.tsx` (0% coverage, 181 lines)
- [ ] `SettingsScreen.tsx` (0% coverage, 73 lines)

**Impact**: User workflows and navigation
**Estimated Tests Needed**: 25-35 tests
**Priority**: MEDIUM

#### 5. Utilities (0% coverage) - LOW PRIORITY
- [ ] `csvExport.ts` (0% coverage, 119 lines)
- [ ] `cameraService.ts` (0% coverage, 81 lines)
- [ ] `telemetryService.ts` (0% coverage, 224 lines)

**Impact**: Export and auxiliary features
**Estimated Tests Needed**: 15-20 tests
**Priority**: LOW

#### 6. Context Providers (0% coverage) - MEDIUM PRIORITY
- [ ] `AuthContext.tsx` (0% coverage, 118 lines)

**Impact**: Authentication state management
**Estimated Tests Needed**: 8-10 tests
**Priority**: MEDIUM

---

## Testing Roadmap

### Phase 7.1.1: Critical Services Testing (Days 1-2)

#### Day 1 Morning: React Hooks Testing
**Target**: Add 20-30 tests, achieve 70%+ coverage on hooks

- [ ] Create `__tests__/hooks/useCalibration.test.tsx`
  - Test calibration state initialization
  - Test startCalibration function
  - Test addCalibrationFrame
  - Test completeCalibration
  - Test quality calculations

- [ ] Create `__tests__/hooks/useFrameProcessing.test.tsx`
  - Test frame processing initialization
  - Test processFrame function
  - Test ball detection integration
  - Test ROI updates

- [ ] Create `__tests__/hooks/useYUVDetection.test.tsx`
  - Test YUV detection initialization
  - Test detectBall function
  - Test sensitivity adjustments

- [ ] Create `__tests__/hooks/useCameraPermissions.test.tsx`
  - Test permission request flow
  - Test permission status checks
  - Test error handling

#### Day 1 Afternoon: Database Services Testing
**Target**: Add 40-50 tests, achieve 70%+ coverage on database

- [ ] Enhance `__tests__/database.test.ts`
  - Add tests for pitchService (CRUD operations)
  - Add tests for sessionService (lifecycle)
  - Add tests for statisticsService (aggregations)
  - Add tests for userService (authentication)
  - Add tests for calibrationStorageService
  - Add tests for migrations (up/down)

#### Day 2 Morning: Utility Functions Testing
**Target**: Add 15-20 tests, achieve 70%+ coverage

- [ ] Create `__tests__/utils/csvExport.test.ts`
  - Test CSV formatting
  - Test header generation
  - Test data escaping
  - Test session exports
  - Test filtered exports

- [ ] Enhance `shared/utils/__tests__/validation.test.ts`
  - Increase branch coverage from 51% to 70%+
  - Add edge case tests

#### Day 2 Afternoon: Context & Camera Testing
**Target**: Add 15-20 tests

- [ ] Create `__tests__/contexts/AuthContext.test.tsx`
  - Test login flow
  - Test register flow
  - Test logout
  - Test token persistence
  - Test error handling

- [ ] Create `__tests__/services/cameraService.test.ts`
  - Test camera initialization
  - Test format configuration
  - Test error handling

---

### Phase 7.1.2: Component Testing (Day 3)

#### Component Testing Strategy
Use React Native Testing Library for component tests

- [ ] Create `__tests__/components/ROIComponent.test.tsx`
  - Test rendering
  - Test drag gestures
  - Test resize handles
  - Test position updates

- [ ] Create `__tests__/components/CalibrationMeter.test.tsx`
  - Test quality display
  - Test progress indicator
  - Test state transitions

- [ ] Create `__tests__/components/CoachOverlay.test.tsx`
  - Test guidance messages
  - Test animations
  - Test visibility

- [ ] Create `__tests__/components/BallDetectionIndicator.test.tsx`
  - Test detection display
  - Test confidence visualization

---

### Phase 7.1.3: Screen Testing (Day 3-4)

#### Integration/Screen Tests
Focus on user workflows and navigation

- [ ] Create `__tests__/screens/TrackingScreen.test.tsx`
  - Test tracking initialization
  - Test camera integration
  - Test calibration flow
  - Test pitch recording

- [ ] Create `__tests__/screens/DashboardScreen.test.tsx`
  - Test session list rendering
  - Test filtering
  - Test navigation to details

- [ ] Create `__tests__/screens/SessionDetailScreen.test.tsx`
  - Test statistics display
  - Test charts rendering
  - Test CSV export

- [ ] Create `__tests__/screens/LoginScreen.test.tsx`
  - Test form validation
  - Test login submission
  - Test error display

- [ ] Create `__tests__/screens/RegisterScreen.test.tsx`
  - Test form validation
  - Test registration submission
  - Test password requirements

---

## Test Infrastructure Enhancements

### Testing Tools Setup

#### Already Configured ✅
- [x] Jest with ts-jest
- [x] React Native Testing Library
- [x] Coverage reporting (text, lcov, html)
- [x] Coverage thresholds (70%)

#### To Be Added
- [ ] Detox for E2E testing
- [ ] Mock service worker (MSW) for API mocking
- [ ] Test utilities for common patterns
- [ ] Custom matchers for assertions

---

## Coverage Milestones

### Milestone 1: Critical Services (End of Day 1)
**Target**: 50% overall coverage
- React hooks: 70%+
- Database services: 70%+
- Core services: Maintain 60%+

### Milestone 2: Components & Utilities (End of Day 2)
**Target**: 65% overall coverage
- Utilities: 70%+
- Context providers: 70%+
- Components: 50%+

### Milestone 3: Screens & Integration (End of Day 3)
**Target**: 75% overall coverage
- Screens: 50%+
- All critical paths tested

### Milestone 4: Polish & Edge Cases (End of Day 4)
**Target**: 80%+ overall coverage
- All modules: 70%+
- Edge cases covered
- Error paths tested

---

## Testing Best Practices

### Unit Testing
- Test single units in isolation
- Mock external dependencies
- Focus on business logic
- Test edge cases and errors

### Component Testing
- Test rendering with various props
- Test user interactions
- Test accessibility
- Avoid testing implementation details

### Integration Testing
- Test multiple units working together
- Test data flow between components
- Test state management
- Test navigation flows

### Coverage Goals
- **80%+** for critical services (database, tracking)
- **70%+** for utilities and hooks
- **60%+** for UI components
- **50%+** for screens (with E2E tests for workflows)

---

## Known Testing Challenges

### Challenge 1: React Native Camera
**Issue**: VisionCamera requires native modules
**Solution**: Mock VisionCamera in tests
```typescript
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevices: jest.fn(),
  useFrameProcessor: jest.fn(),
}));
```

### Challenge 2: SQLite Database
**Issue**: expo-sqlite requires native module
**Solution**: Use in-memory mock or test against real SQLite
```typescript
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => mockDatabase),
}));
```

### Challenge 3: Async Storage
**Issue**: AsyncStorage requires native module
**Solution**: Use @react-native-async-storage/async-storage mock
```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Challenge 4: Navigation
**Issue**: React Navigation requires native modules
**Solution**: Mock navigation props
```typescript
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};
```

---

## Next Actions

### Immediate (Today)
1. ✅ Set up testing infrastructure
2. ✅ Run coverage analysis
3. ✅ Identify gaps and prioritize
4. 🔄 Start React hooks testing
5. ⏳ Begin database services testing

### Tomorrow
6. Complete database services testing
7. Add utility function tests
8. Add context provider tests
9. Achieve 50%+ overall coverage

### Day 3
10. Add component tests
11. Begin screen tests
12. Achieve 65%+ overall coverage

### Day 4
13. Complete screen tests
14. Add edge case tests
15. Achieve 80%+ overall coverage

---

## Success Criteria

Phase 7.1 (Testing Strategy) is complete when:

- [x] Test infrastructure configured
- [ ] Overall coverage >80%
- [ ] All critical services >70% coverage
- [ ] All utilities >70% coverage
- [ ] React hooks >70% coverage
- [ ] Database services >70% coverage
- [ ] Components >60% coverage
- [ ] Screens >50% coverage
- [ ] All tests passing
- [ ] Coverage reports generated
- [ ] Testing documentation updated

---

Last modified by: Claude Code Agent on 2025-10-27 (CST)
