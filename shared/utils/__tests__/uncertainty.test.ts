/**
 * Tests for uncertainty calculation utilities
 */

import {
  calculateStandardError,
  calculateConfidenceInterval,
  propagateUncertaintyMultiplication,
  propagateUncertaintyAddition,
  calculateCalibrationUncertainty,
  calculatePitchUncertainty,
  estimateMeasurementNoise,
  uncertaintyToQualityScore,
  bayesianUncertaintyUpdate,
  weightedAverageWithUncertainty,
} from '../src/uncertainty';

describe('Uncertainty Calculations', () => {
  describe('calculateStandardError', () => {
    it('should calculate standard error from multiple measurements', () => {
      const values = [10, 12, 11, 13, 12];
      const se = calculateStandardError(values);

      expect(se).toBeGreaterThan(0);
      expect(se).toBeLessThan(1); // Should be small for these values
    });

    it('should return 0 for single measurement', () => {
      const values = [10];
      const se = calculateStandardError(values);

      expect(se).toBe(0);
    });

    it('should return 0 for empty array', () => {
      const values: number[] = [];
      const se = calculateStandardError(values);

      expect(se).toBe(0);
    });

    it('should handle identical values', () => {
      const values = [5, 5, 5, 5, 5];
      const se = calculateStandardError(values);

      expect(se).toBe(0);
    });
  });

  describe('calculateConfidenceInterval', () => {
    it('should calculate 95% confidence interval', () => {
      const mean = 10;
      const standardError = 0.5;
      const [lower, upper] = calculateConfidenceInterval(mean, standardError, 0.95);

      expect(lower).toBeLessThan(mean);
      expect(upper).toBeGreaterThan(mean);
      expect(upper - lower).toBeCloseTo(2 * 1.96 * standardError, 2);
    });

    it('should calculate 90% confidence interval', () => {
      const mean = 10;
      const standardError = 0.5;
      const [lower, upper] = calculateConfidenceInterval(mean, standardError, 0.9);

      expect(lower).toBeLessThan(mean);
      expect(upper).toBeGreaterThan(mean);
      expect(upper - lower).toBeCloseTo(2 * 1.645 * standardError, 2);
    });

    it('should calculate 99% confidence interval', () => {
      const mean = 10;
      const standardError = 0.5;
      const [lower, upper] = calculateConfidenceInterval(mean, standardError, 0.99);

      expect(lower).toBeLessThan(mean);
      expect(upper).toBeGreaterThan(mean);
      expect(upper - lower).toBeCloseTo(2 * 2.576 * standardError, 2);
    });

    it('should default to 95% when invalid confidence level provided', () => {
      const mean = 10;
      const standardError = 0.5;
      const [lower, upper] = calculateConfidenceInterval(mean, standardError, 0.85);

      // Should use 1.96 (95% CI)
      expect(upper - lower).toBeCloseTo(2 * 1.96 * standardError, 2);
    });
  });

  describe('propagateUncertaintyMultiplication', () => {
    it('should propagate uncertainty through multiplication', () => {
      const value1 = 100; // pixels
      const uncertainty1 = 2; // ±2 pixels
      const value2 = 0.1; // pixels per foot
      const uncertainty2 = 0.01; // ±0.01

      const result = propagateUncertaintyMultiplication(value1, uncertainty1, value2, uncertainty2);

      expect(result).toBeGreaterThan(0);
      // Result should be approximately sqrt((2/100)^2 + (0.01/0.1)^2) * (100 * 0.1)
      expect(result).toBeCloseTo(1.02, 1);
    });

    it('should handle zero uncertainty in one value', () => {
      const value1 = 100;
      const uncertainty1 = 2;
      const value2 = 0.1;
      const uncertainty2 = 0;

      const result = propagateUncertaintyMultiplication(value1, uncertainty1, value2, uncertainty2);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(0.2, 2); // Should be (2/100) * (100 * 0.1)
    });
  });

  describe('propagateUncertaintyAddition', () => {
    it('should propagate uncertainty through addition', () => {
      const uncertainty1 = 0.5;
      const uncertainty2 = 0.3;

      const result = propagateUncertaintyAddition(uncertainty1, uncertainty2);

      // Should be sqrt(0.5^2 + 0.3^2)
      expect(result).toBeCloseTo(0.583, 2);
    });

    it('should handle zero uncertainties', () => {
      const uncertainty1 = 0;
      const uncertainty2 = 0;

      const result = propagateUncertaintyAddition(uncertainty1, uncertainty2);

      expect(result).toBe(0);
    });

    it('should be commutative', () => {
      const u1 = 0.5;
      const u2 = 0.3;

      const result1 = propagateUncertaintyAddition(u1, u2);
      const result2 = propagateUncertaintyAddition(u2, u1);

      expect(result1).toBe(result2);
    });
  });

  describe('calculateCalibrationUncertainty', () => {
    it('should calculate calibration uncertainty from pixel measurements', () => {
      const pixelMeasurements = [100, 102, 99, 101, 100];
      const referenceHeight = 5; // feet

      const uncertainty = calculateCalibrationUncertainty(pixelMeasurements, referenceHeight);

      expect(uncertainty).toBeGreaterThan(0);
      expect(uncertainty).toBeLessThan(1); // Should be reasonable for these values
    });

    it('should return default uncertainty for single measurement', () => {
      const pixelMeasurements = [100];
      const referenceHeight = 5;

      const uncertainty = calculateCalibrationUncertainty(pixelMeasurements, referenceHeight);

      expect(uncertainty).toBe(0.1); // Default uncertainty
    });

    it('should return default uncertainty for empty array', () => {
      const pixelMeasurements: number[] = [];
      const referenceHeight = 5;

      const uncertainty = calculateCalibrationUncertainty(pixelMeasurements, referenceHeight);

      expect(uncertainty).toBe(0.1);
    });
  });

  describe('calculatePitchUncertainty', () => {
    it('should combine calibration and measurement uncertainties', () => {
      const calibrationUncertainty = 0.1;
      const measurementNoise = 0.05;
      const qualityScore = 90;

      const uncertainty = calculatePitchUncertainty(
        calibrationUncertainty,
        measurementNoise,
        qualityScore
      );

      expect(uncertainty).toBeGreaterThan(calibrationUncertainty);
      expect(uncertainty).toBeGreaterThan(measurementNoise);
    });

    it('should increase uncertainty for lower quality scores', () => {
      const calibrationUncertainty = 0.1;
      const measurementNoise = 0.05;

      const highQualityUncertainty = calculatePitchUncertainty(
        calibrationUncertainty,
        measurementNoise,
        95
      );

      const lowQualityUncertainty = calculatePitchUncertainty(
        calibrationUncertainty,
        measurementNoise,
        50
      );

      expect(lowQualityUncertainty).toBeGreaterThan(highQualityUncertainty);
    });

    it('should handle perfect quality score', () => {
      const calibrationUncertainty = 0.1;
      const measurementNoise = 0.05;
      const qualityScore = 100;

      const uncertainty = calculatePitchUncertainty(
        calibrationUncertainty,
        measurementNoise,
        qualityScore
      );

      expect(uncertainty).toBeGreaterThan(0);
    });
  });

  describe('estimateMeasurementNoise', () => {
    it('should estimate noise based on pixels per foot and confidence', () => {
      const pixelsPerFoot = 20;
      const detectionConfidence = 95;

      const noise = estimateMeasurementNoise(pixelsPerFoot, detectionConfidence);

      expect(noise).toBeGreaterThan(0);
      expect(noise).toBeLessThan(0.5); // Should be reasonable for good confidence
    });

    it('should increase noise for lower confidence', () => {
      const pixelsPerFoot = 20;

      const highConfidenceNoise = estimateMeasurementNoise(pixelsPerFoot, 95);
      const lowConfidenceNoise = estimateMeasurementNoise(pixelsPerFoot, 50);

      expect(lowConfidenceNoise).toBeGreaterThan(highConfidenceNoise);
    });

    it('should decrease noise for higher pixels per foot', () => {
      const detectionConfidence = 90;

      const lowResolutionNoise = estimateMeasurementNoise(10, detectionConfidence);
      const highResolutionNoise = estimateMeasurementNoise(50, detectionConfidence);

      expect(highResolutionNoise).toBeLessThan(lowResolutionNoise);
    });
  });

  describe('uncertaintyToQualityScore', () => {
    it('should convert uncertainty to quality score', () => {
      const uncertainty = 0.1;
      const maxUncertainty = 1.0;

      const qualityScore = uncertaintyToQualityScore(uncertainty, maxUncertainty);

      expect(qualityScore).toBe(90); // (1 - 0.1/1.0) * 100
    });

    it('should return 0 for maximum uncertainty', () => {
      const uncertainty = 1.0;
      const maxUncertainty = 1.0;

      const qualityScore = uncertaintyToQualityScore(uncertainty, maxUncertainty);

      expect(qualityScore).toBe(0);
    });

    it('should return 100 for zero uncertainty', () => {
      const uncertainty = 0;
      const maxUncertainty = 1.0;

      const qualityScore = uncertaintyToQualityScore(uncertainty, maxUncertainty);

      expect(qualityScore).toBe(100);
    });

    it('should cap at 0 for uncertainty above maximum', () => {
      const uncertainty = 1.5;
      const maxUncertainty = 1.0;

      const qualityScore = uncertaintyToQualityScore(uncertainty, maxUncertainty);

      expect(qualityScore).toBe(0);
    });
  });

  describe('bayesianUncertaintyUpdate', () => {
    it('should update uncertainty with new measurement', () => {
      const priorMean = 5.0;
      const priorUncertainty = 0.5;
      const newMeasurement = 5.2;
      const measurementUncertainty = 0.3;

      const result = bayesianUncertaintyUpdate(
        priorMean,
        priorUncertainty,
        newMeasurement,
        measurementUncertainty
      );

      expect(result.mean).toBeGreaterThan(priorMean);
      expect(result.mean).toBeLessThan(newMeasurement);
      expect(result.uncertainty).toBeLessThan(priorUncertainty);
      expect(result.uncertainty).toBeLessThan(measurementUncertainty);
    });

    it('should reduce uncertainty with each update', () => {
      let mean = 5.0;
      let uncertainty = 1.0;

      const measurements = [5.1, 4.9, 5.2, 4.8];
      const measurementUncertainty = 0.5;

      for (const measurement of measurements) {
        const result = bayesianUncertaintyUpdate(
          mean,
          uncertainty,
          measurement,
          measurementUncertainty
        );
        expect(result.uncertainty).toBeLessThan(uncertainty);
        mean = result.mean;
        uncertainty = result.uncertainty;
      }
    });

    it('should weight measurements by their precision', () => {
      const priorMean = 5.0;
      const priorUncertainty = 1.0;

      // Precise measurement (low uncertainty)
      const preciseMeasurement = 6.0;
      const preciseUncertainty = 0.1;

      const result = bayesianUncertaintyUpdate(
        priorMean,
        priorUncertainty,
        preciseMeasurement,
        preciseUncertainty
      );

      // Posterior should be closer to the precise measurement
      expect(Math.abs(result.mean - preciseMeasurement)).toBeLessThan(
        Math.abs(result.mean - priorMean)
      );
    });
  });

  describe('weightedAverageWithUncertainty', () => {
    it('should calculate weighted average with uncertainties', () => {
      const values = [5.0, 5.2, 4.8];
      const uncertainties = [0.1, 0.2, 0.3];

      const result = weightedAverageWithUncertainty(values, uncertainties);

      expect(result.mean).toBeGreaterThan(4.8);
      expect(result.mean).toBeLessThan(5.2);
      expect(result.uncertainty).toBeGreaterThan(0);
      expect(result.uncertainty).toBeLessThan(0.1); // Should be less than smallest uncertainty
    });

    it('should weight more precise measurements higher', () => {
      const values = [5.0, 10.0]; // Very different values
      const uncertainties = [0.1, 10.0]; // First is much more precise

      const result = weightedAverageWithUncertainty(values, uncertainties);

      // Should be much closer to 5.0 than 10.0
      expect(Math.abs(result.mean - 5.0)).toBeLessThan(Math.abs(result.mean - 10.0));
    });

    it('should throw error for mismatched array lengths', () => {
      const values = [5.0, 5.2];
      const uncertainties = [0.1];

      expect(() => {
        weightedAverageWithUncertainty(values, uncertainties);
      }).toThrow();
    });

    it('should throw error for empty arrays', () => {
      const values: number[] = [];
      const uncertainties: number[] = [];

      expect(() => {
        weightedAverageWithUncertainty(values, uncertainties);
      }).toThrow();
    });

    it('should handle single value', () => {
      const values = [5.0];
      const uncertainties = [0.1];

      const result = weightedAverageWithUncertainty(values, uncertainties);

      expect(result.mean).toBe(5.0);
      expect(result.uncertainty).toBe(0.1);
    });
  });
});
