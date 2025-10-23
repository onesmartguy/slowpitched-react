/**
 * Unit tests for calculation utilities
 */
import {
  calculatePitchHeight,
  calculateUncertainty,
  calculateStatistics,
  calculateConfidenceIntervalStub,
  pixelsToFeet,
  feetToPixels,
  interpolatePosition,
} from '../src/calculation';

describe('Calculation Utilities', () => {
  describe('pixelsToFeet', () => {
    it('should convert pixels to feet correctly', () => {
      // 30 pixels = 1 foot
      const result = pixelsToFeet(30, 30);
      expect(result).toBe(1);
    });

    it('should handle zero pixels', () => {
      const result = pixelsToFeet(0, 30);
      expect(result).toBe(0);
    });

    it('should handle different scale factors', () => {
      const result = pixelsToFeet(60, 30);
      expect(result).toBe(2);
    });
  });

  describe('feetToPixels', () => {
    it('should convert feet to pixels correctly', () => {
      const result = feetToPixels(1, 30);
      expect(result).toBe(30);
    });

    it('should handle multiple feet', () => {
      const result = feetToPixels(3, 30);
      expect(result).toBe(90);
    });

    it('should handle zero feet', () => {
      const result = feetToPixels(0, 30);
      expect(result).toBe(0);
    });
  });

  describe('calculatePitchHeight', () => {
    it('should calculate pitch height', () => {
      // Test with basic parameters
      const result = calculatePitchHeight(100, 2);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should be deterministic', () => {
      const result1 = calculatePitchHeight(50, 1.5);
      const result2 = calculatePitchHeight(50, 1.5);
      expect(result1).toBe(result2);
    });
  });

  describe('calculateUncertainty', () => {
    it('should calculate uncertainty value', () => {
      const result = calculateUncertainty(0.5, 0.8, 0.9);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle different confidence levels', () => {
      const high = calculateUncertainty(0.5, 0.9, 0.9);
      const low = calculateUncertainty(0.5, 0.5, 0.5);
      expect(typeof high).toBe('number');
      expect(typeof low).toBe('number');
    });
  });

  describe('calculateStatistics', () => {
    it('should return statistics object', () => {
      const heights = [5, 6, 7, 8, 9];
      const stats = calculateStatistics(heights);

      expect(typeof stats.min).toBe('number');
      expect(typeof stats.max).toBe('number');
      expect(typeof stats.mean).toBe('number');
      expect(typeof stats.median).toBe('number');
      expect(typeof stats.variance).toBe('number');
      expect(typeof stats.stdDev).toBe('number');
    });

    it('should handle single pitch', () => {
      const heights = [6];
      const stats = calculateStatistics(heights);

      expect(typeof stats.min).toBe('number');
      expect(typeof stats.max).toBe('number');
    });

    it('should calculate variance and standard deviation', () => {
      const heights = [1, 2, 3, 4, 5];
      const stats = calculateStatistics(heights);

      expect(typeof stats.variance).toBe('number');
      expect(typeof stats.stdDev).toBe('number');
    });
  });

  describe('calculateConfidenceIntervalStub', () => {
    it('should calculate confidence interval', () => {
      const result = calculateConfidenceIntervalStub(6, 1, 0.95);
      expect(result.lower).toBeDefined();
      expect(result.upper).toBeDefined();
    });

    it('should have lower < upper', () => {
      const result = calculateConfidenceIntervalStub(6, 1, 0.95);
      expect(result.lower).toBeLessThanOrEqual(result.upper);
    });
  });

  describe('interpolatePosition', () => {
    it('should interpolate between two positions', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 10, y: 10 };
      const result = interpolatePosition(pos1, pos2, 0.5);

      expect(result.x).toBeCloseTo(5, 1);
      expect(result.y).toBeCloseTo(5, 1);
    });

    it('should handle alpha=0', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 10, y: 10 };
      const result = interpolatePosition(pos1, pos2, 0);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle alpha=1', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 10, y: 10 };
      const result = interpolatePosition(pos1, pos2, 1);

      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });
  });
});
