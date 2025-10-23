import { trackingPipeline } from '../src/services/trackingPipeline';
import { calibrationService } from '../src/services/calibrationService';
import type { BallDetectionResult } from '../src/types';

describe('TrackingPipeline', () => {
  beforeEach(() => {
    // Reset services before each test
    trackingPipeline.reset();
    calibrationService.reset();
  });

  describe('startTracking / stopTracking', () => {
    it('should start tracking session', () => {
      trackingPipeline.startTracking();
      expect(trackingPipeline.isActivelyTracking()).toBe(true);
    });

    it('should stop tracking session', () => {
      trackingPipeline.startTracking();
      trackingPipeline.stopTracking();
      expect(trackingPipeline.isActivelyTracking()).toBe(false);
    });
  });

  describe('processDetection', () => {
    it('should return null when not tracking', () => {
      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 90,
        pixelCount: 150,
      };

      const result = trackingPipeline.processDetection(detection);
      expect(result).toBeNull();
    });

    it('should return null for low confidence detection', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 30, // Below 50 threshold
        pixelCount: 150,
      };

      const result = trackingPipeline.processDetection(detection);
      expect(result).toBeNull();
    });

    it('should throw error without calibration', () => {
      trackingPipeline.startTracking();

      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 90,
        pixelCount: 150,
      };

      expect(() => trackingPipeline.processDetection(detection)).toThrow(
        'Valid calibration required for tracking'
      );
    });

    it('should successfully process valid detection', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 90,
        pixelCount: 150,
      };

      const result = trackingPipeline.processDetection(detection);

      expect(result).not.toBeNull();
      expect(result?.height).toBeGreaterThan(0);
      expect(result?.uncertainty).toBeGreaterThan(0);
      expect(result?.confidence).toBe(90);
      expect(result?.qualityScore).toBeGreaterThan(0);
      expect(result?.timestamp).toBeGreaterThan(0);
    });

    it('should calculate height correctly', () => {
      trackingPipeline.startTracking();

      // Set up calibration: 200 pixels = 4 feet, so 50 pixels/foot
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 100, // 100 pixels = 2 feet
        confidence: 90,
        pixelCount: 150,
      };

      const result = trackingPipeline.processDetection(detection);

      expect(result?.height).toBeCloseTo(2.0, 1);
    });
  });

  describe('getResults', () => {
    it('should return empty array when no results', () => {
      const results = trackingPipeline.getResults();
      expect(results).toEqual([]);
    });

    it('should return all tracking results', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      // Process multiple detections
      for (let i = 0; i < 3; i++) {
        const detection: BallDetectionResult = {
          detected: true,
          x: 100,
          y: 200 + i * 10,
          confidence: 90,
          pixelCount: 150,
        };
        trackingPipeline.processDetection(detection);
      }

      const results = trackingPipeline.getResults();
      expect(results).toHaveLength(3);
    });
  });

  describe('getStatistics', () => {
    it('should return null statistics when no results', () => {
      const stats = trackingPipeline.getStatistics();

      expect(stats.count).toBe(0);
      expect(stats.average).toBeNull();
      expect(stats.min).toBeNull();
      expect(stats.max).toBeNull();
      expect(stats.avgUncertainty).toBeNull();
    });

    it('should calculate statistics correctly', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      // Process detections with varying heights
      const heights = [100, 150, 200];
      for (const height of heights) {
        const detection: BallDetectionResult = {
          detected: true,
          x: 100,
          y: height,
          confidence: 90,
          pixelCount: 150,
        };
        trackingPipeline.processDetection(detection);
      }

      const stats = trackingPipeline.getStatistics();

      expect(stats.count).toBe(3);
      expect(stats.average).toBeGreaterThan(0);
      expect(stats.min).toBeGreaterThan(0);
      expect(stats.max).toBeGreaterThan(0);
      expect(stats.avgUncertainty).toBeGreaterThan(0);
    });
  });

  describe('clearResults', () => {
    it('should clear all results', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      // Add some results
      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 90,
        pixelCount: 150,
      };
      trackingPipeline.processDetection(detection);

      trackingPipeline.clearResults();

      expect(trackingPipeline.getResults()).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset entire pipeline', () => {
      trackingPipeline.startTracking();

      // Set up calibration
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      // Add some results
      const detection: BallDetectionResult = {
        detected: true,
        x: 100,
        y: 200,
        confidence: 90,
        pixelCount: 150,
      };
      trackingPipeline.processDetection(detection);

      trackingPipeline.reset();

      expect(trackingPipeline.isActivelyTracking()).toBe(false);
      expect(trackingPipeline.getResults()).toHaveLength(0);
    });
  });
});
