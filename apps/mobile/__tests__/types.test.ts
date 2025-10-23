/**
 * Unit tests for type definitions
 * Validates core TypeScript interfaces and types
 */
import {
  Pitch,
  Session,
  CalibrationData,
  ROI,
  BallDetectionResult,
  SessionStatistics,
  RootStackParamList,
} from '../src/types/index';

describe('Type Definitions', () => {
  describe('Pitch interface', () => {
    it('should create valid pitch object', () => {
      const pitch: Pitch = {
        id: 'pitch-1',
        sessionId: 'session-1',
        height: 5.5,
        uncertainty: 0.2,
        timestamp: Date.now(),
        qualityScore: 85,
        ballPosition: { x: 100, y: 200 },
        metadata: { pitchType: 'fastball' },
      };

      expect(pitch.id).toBe('pitch-1');
      expect(pitch.height).toBe(5.5);
      expect(pitch.qualityScore).toBe(85);
    });
  });

  describe('Session interface', () => {
    it('should create valid session object', () => {
      const session: Session = {
        id: 'session-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: 'Test Session',
        pitchCount: 10,
      };

      expect(session.name).toBe('Test Session');
      expect(session.pitchCount).toBe(10);
    });
  });

  describe('CalibrationData interface', () => {
    it('should create valid calibration object', () => {
      const calibration: CalibrationData = {
        referenceHeight: 6.5,
        pixelHeight: 200,
        pixelsPerFoot: 30.77,
        uncertainty: 0.1,
        timestamp: Date.now(),
        measurementCount: 5,
      };

      expect(calibration.referenceHeight).toBe(6.5);
      expect(calibration.pixelHeight).toBe(200);
      expect(calibration.pixelsPerFoot).toBe(30.77);
      expect(calibration.measurementCount).toBe(5);
    });
  });

  describe('ROI interface', () => {
    it('should create valid ROI object', () => {
      const roi: ROI = {
        x: 50,
        y: 100,
        width: 300,
        height: 400,
      };

      expect(roi.width).toBe(300);
      expect(roi.height).toBe(400);
    });
  });

  describe('BallDetectionResult interface', () => {
    it('should create valid detection result with ball found', () => {
      const result: BallDetectionResult = {
        detected: true,
        x: 150,
        y: 250,
        confidence: 95,
        pixelCount: 50,
      };

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(95);
      expect(result.x).toBe(150);
      expect(result.y).toBe(250);
    });

    it('should create valid detection result without ball', () => {
      const result: BallDetectionResult = {
        detected: false,
        x: 0,
        y: 0,
        confidence: 0,
        pixelCount: 0,
      };

      expect(result.detected).toBe(false);
      expect(result.pixelCount).toBe(0);
    });
  });

  describe('SessionStatistics interface', () => {
    it('should create valid statistics object', () => {
      const stats: SessionStatistics = {
        minHeight: 4.5,
        maxHeight: 8.0,
        avgHeight: 6.2,
        stdDev: 1.1,
        variance: 1.2,
        medianHeight: 6.1,
        percentile25: 5.5,
        percentile75: 6.8,
        totalPitches: 50,
      };

      expect(stats.avgHeight).toBe(6.2);
      expect(stats.totalPitches).toBe(50);
      expect(stats.minHeight).toBeLessThan(stats.maxHeight);
    });
  });

  describe('RootStackParamList type', () => {
    it('should define valid navigation routes', () => {
      const routes: RootStackParamList = {
        TrackingScreen: undefined,
        DashboardScreen: undefined,
        SessionDetailScreen: { sessionId: 'test-session' },
        SettingsScreen: undefined,
      };

      expect(routes.TrackingScreen).toBeUndefined();
      expect(routes.SessionDetailScreen.sessionId).toBe('test-session');
    });
  });
});
