import { calibrationService } from '../src/services/calibrationService';

describe('CalibrationService', () => {
  beforeEach(() => {
    // Reset calibration before each test
    calibrationService.reset();
  });

  describe('startCalibration', () => {
    it('should initialize calibration session', () => {
      calibrationService.startCalibration(4.0);
      const calibration = calibrationService.getCalibration();
      expect(calibration).toBeNull(); // Not finalized yet
    });
  });

  describe('addMeasurement', () => {
    it('should accept calibration measurements', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.addMeasurement(205);
      calibrationService.addMeasurement(198);

      const calibration = calibrationService.finalizeCalibration(4.0);
      expect(calibration.measurementCount).toBe(3);
    });
  });

  describe('finalizeCalibration', () => {
    it('should throw error with no measurements', () => {
      calibrationService.startCalibration(4.0);
      expect(() => calibrationService.finalizeCalibration(4.0)).toThrow(
        'No calibration measurements available'
      );
    });

    it('should calculate calibration with single measurement', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);

      const calibration = calibrationService.finalizeCalibration(4.0);

      expect(calibration.referenceHeight).toBe(4.0);
      expect(calibration.pixelsPerFoot).toBe(50); // 200 pixels / 4 feet
      expect(calibration.uncertainty).toBeGreaterThan(0);
      expect(calibration.measurementCount).toBe(1);
      expect(calibration.timestamp).toBeGreaterThan(0);
    });

    it('should calculate calibration with multiple measurements', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.addMeasurement(204);
      calibrationService.addMeasurement(196);

      const calibration = calibrationService.finalizeCalibration(4.0);

      expect(calibration.referenceHeight).toBe(4.0);
      expect(calibration.pixelsPerFoot).toBe(50); // Average: 200 pixels / 4 feet
      expect(calibration.measurementCount).toBe(3);
    });

    it('should have lower uncertainty with more measurements', () => {
      // Single measurement (will have high uncertainty due to factor)
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      const cal1 = calibrationService.finalizeCalibration(4.0);

      // Multiple measurements with some variance
      calibrationService.reset();
      calibrationService.startCalibration(4.0);
      for (let i = 0; i < 10; i++) {
        calibrationService.addMeasurement(200 + (Math.random() - 0.5) * 4);
      }
      const cal2 = calibrationService.finalizeCalibration(4.0);

      // Single measurement has higher uncertainty factor (5x vs 0.5x)
      // So cal1 should have higher uncertainty than cal2
      expect(cal1.uncertainty).toBeGreaterThan(cal2.uncertainty);
    });
  });

  describe('getCalibration', () => {
    it('should return null when not calibrated', () => {
      expect(calibrationService.getCalibration()).toBeNull();
    });

    it('should return calibration data when calibrated', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      const calibration = calibrationService.getCalibration();
      expect(calibration).not.toBeNull();
      expect(calibration?.referenceHeight).toBe(4.0);
    });
  });

  describe('isCalibrationValid', () => {
    it('should return false when not calibrated', () => {
      expect(calibrationService.isCalibrationValid()).toBe(false);
    });

    it('should return true for recent calibration', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      expect(calibrationService.isCalibrationValid()).toBe(true);
    });

    it('should return false for expired calibration', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      const calibration = calibrationService.finalizeCalibration(4.0);

      // Manually set old timestamp
      calibration.timestamp = Date.now() - 7200000; // 2 hours ago

      expect(calibrationService.isCalibrationValid(3600000)).toBe(false); // 1 hour max age
    });
  });

  describe('getQualityScore', () => {
    it('should return 0 when not calibrated', () => {
      expect(calibrationService.getQualityScore()).toBe(0);
    });

    it('should return higher score for better calibration', () => {
      calibrationService.startCalibration(4.0);

      // Add consistent measurements
      for (let i = 0; i < 10; i++) {
        calibrationService.addMeasurement(200);
      }

      calibrationService.finalizeCalibration(4.0);
      const score = calibrationService.getQualityScore();

      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('pixelsToFeet', () => {
    it('should throw error when not calibrated', () => {
      expect(() => calibrationService.pixelsToFeet(100)).toThrow(
        'No calibration data available'
      );
    });

    it('should correctly convert pixels to feet', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      // 200 pixels = 4 feet, so 50 pixels/foot
      // 100 pixels should be 2 feet
      const feet = calibrationService.pixelsToFeet(100);
      expect(feet).toBeCloseTo(2.0, 1);
    });
  });

  describe('reset', () => {
    it('should clear calibration data', () => {
      calibrationService.startCalibration(4.0);
      calibrationService.addMeasurement(200);
      calibrationService.finalizeCalibration(4.0);

      calibrationService.reset();

      expect(calibrationService.getCalibration()).toBeNull();
      expect(calibrationService.getQualityScore()).toBe(0);
    });
  });
});
