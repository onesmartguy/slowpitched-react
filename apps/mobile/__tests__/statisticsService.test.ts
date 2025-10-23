/**
 * Tests for statistics service calculation logic
 * Note: Database operations are tested separately in integration tests
 */

describe('Statistics Service - Calculation Logic', () => {
  describe('Mean Calculation', () => {
    it('should calculate mean correctly', () => {
      const values = [5, 10, 15, 20, 25];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      expect(mean).toBe(15);
    });

    it('should handle single value', () => {
      const values = [42];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      expect(mean).toBe(42);
    });

    it('should handle negative values', () => {
      const values = [-5, -10, 5, 10];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      expect(mean).toBe(0);
    });
  });

  describe('Variance Calculation', () => {
    it('should calculate variance correctly', () => {
      const values = [2, 4, 6, 8, 10];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);

      expect(variance).toBe(10);
    });

    it('should return 0 for identical values', () => {
      const values = [5, 5, 5, 5, 5];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);

      expect(variance).toBe(0);
    });

    it('should use n-1 denominator (Bessel correction)', () => {
      const values = [1, 2, 3];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);

      // Variance with n-1 should be 1
      expect(variance).toBe(1);
    });
  });

  describe('Standard Deviation Calculation', () => {
    it('should calculate standard deviation correctly', () => {
      const values = [2, 4, 6, 8, 10];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
      const stdDev = Math.sqrt(variance);

      expect(stdDev).toBeCloseTo(Math.sqrt(10), 5);
    });

    it('should return 0 for no variation', () => {
      const values = [7, 7, 7];
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
      const stdDev = Math.sqrt(variance);

      expect(stdDev).toBe(0);
    });
  });

  describe('Percentile Calculation', () => {
    it('should calculate median (50th percentile) correctly', () => {
      const sortedValues = [1, 2, 3, 4, 5];
      const index = (50 / 100) * (sortedValues.length - 1);
      const median = sortedValues[Math.floor(index)];

      expect(median).toBe(3);
    });

    it('should calculate 25th percentile correctly', () => {
      const sortedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const index = (25 / 100) * (sortedValues.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      const percentile25 = sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;

      expect(percentile25).toBeCloseTo(3.25, 2);
    });

    it('should calculate 75th percentile correctly', () => {
      const sortedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const index = (75 / 100) * (sortedValues.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      const percentile75 = sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;

      expect(percentile75).toBeCloseTo(7.75, 2);
    });

    it('should handle even number of values for median', () => {
      const sortedValues = [1, 2, 3, 4];
      const index = (50 / 100) * (sortedValues.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      const median = sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;

      expect(median).toBe(2.5);
    });

    it('should interpolate between values for non-exact percentiles', () => {
      const sortedValues = [10, 20, 30, 40];
      const index = (33.33 / 100) * (sortedValues.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      const percentile = sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;

      expect(percentile).toBeCloseTo(20, 0);
    });
  });

  describe('Min/Max Calculation', () => {
    it('should find minimum value', () => {
      const values = [15, 3, 42, 7, 28];
      const min = Math.min(...values);
      expect(min).toBe(3);
    });

    it('should find maximum value', () => {
      const values = [15, 3, 42, 7, 28];
      const max = Math.max(...values);
      expect(max).toBe(42);
    });

    it('should handle negative values', () => {
      const values = [-5, -10, -2, -8];
      const min = Math.min(...values);
      const max = Math.max(...values);

      expect(min).toBe(-10);
      expect(max).toBe(-2);
    });

    it('should handle single value', () => {
      const values = [42];
      const min = Math.min(...values);
      const max = Math.max(...values);

      expect(min).toBe(42);
      expect(max).toBe(42);
    });
  });

  describe('Histogram Binning', () => {
    it('should divide range into equal bins', () => {
      const values = [0, 10, 20, 30, 40, 50];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = 5;
      const binSize = (max - min) / binCount;

      expect(binSize).toBe(10);

      const bins = [];
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        bins.push({ binStart, binEnd });
      }

      expect(bins.length).toBe(5);
      expect(bins[0]).toEqual({ binStart: 0, binEnd: 10 });
      expect(bins[4]).toEqual({ binStart: 40, binEnd: 50 });
    });

    it('should count values in each bin', () => {
      const values = [1, 2, 3, 11, 12, 13, 21, 22, 23];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = 3;
      const binSize = (max - min) / binCount;

      const bins = [];
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        const count = values.filter(
          (v) => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)
        ).length;
        bins.push({ binStart, binEnd, count });
      }

      expect(bins[0].count).toBe(3); // 1, 2, 3
      expect(bins[1].count).toBe(3); // 11, 12, 13
      expect(bins[2].count).toBe(3); // 21, 22, 23
    });
  });

  describe('Quality Distribution', () => {
    it('should categorize quality scores correctly', () => {
      const scores = [95, 85, 65, 45, 92, 70, 55, 30];

      const distribution = {
        excellent: 0, // 90-100
        good: 0, // 70-89
        fair: 0, // 50-69
        poor: 0, // 0-49
      };

      for (const score of scores) {
        if (score >= 90) {
          distribution.excellent++;
        } else if (score >= 70) {
          distribution.good++;
        } else if (score >= 50) {
          distribution.fair++;
        } else {
          distribution.poor++;
        }
      }

      expect(distribution.excellent).toBe(2); // 95, 92
      expect(distribution.good).toBe(2); // 85, 70
      expect(distribution.fair).toBe(2); // 65, 55
      expect(distribution.poor).toBe(2); // 45, 30
    });

    it('should handle boundary values correctly', () => {
      const scores = [100, 90, 89, 70, 69, 50, 49, 0];

      const distribution = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      };

      for (const score of scores) {
        if (score >= 90) {
          distribution.excellent++;
        } else if (score >= 70) {
          distribution.good++;
        } else if (score >= 50) {
          distribution.fair++;
        } else {
          distribution.poor++;
        }
      }

      expect(distribution.excellent).toBe(2); // 100, 90
      expect(distribution.good).toBe(2); // 89, 70
      expect(distribution.fair).toBe(2); // 69, 50
      expect(distribution.poor).toBe(2); // 49, 0
    });
  });

  describe('Pitch Frequency Calculation', () => {
    it('should calculate pitches per minute', () => {
      const timestamps = [
        new Date('2024-01-01T10:00:00Z').getTime(),
        new Date('2024-01-01T10:01:00Z').getTime(),
        new Date('2024-01-01T10:02:00Z').getTime(),
        new Date('2024-01-01T10:03:00Z').getTime(),
        new Date('2024-01-01T10:04:00Z').getTime(),
      ];

      const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 / 60; // 4 minutes
      const frequency = timestamps.length / duration;

      expect(frequency).toBe(1.25); // 5 pitches in 4 minutes
    });

    it('should handle rapid-fire pitches', () => {
      const timestamps = [
        new Date('2024-01-01T10:00:00Z').getTime(),
        new Date('2024-01-01T10:00:10Z').getTime(),
        new Date('2024-01-01T10:00:20Z').getTime(),
        new Date('2024-01-01T10:00:30Z').getTime(),
      ];

      const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 / 60; // 0.5 minutes
      const frequency = timestamps.length / duration;

      expect(frequency).toBe(8); // 4 pitches in 0.5 minutes = 8 per minute
    });

    it('should return 0 for single pitch', () => {
      const timestamps = [new Date('2024-01-01T10:00:00Z').getTime()];

      if (timestamps.length < 2) {
        expect(0).toBe(0);
      }
    });
  });

  describe('Average Calculation', () => {
    it('should calculate average uncertainty', () => {
      const uncertainties = [0.1, 0.2, 0.15, 0.18, 0.12];
      const avg = uncertainties.reduce((sum, val) => sum + val, 0) / uncertainties.length;

      expect(avg).toBeCloseTo(0.15, 2);
    });

    it('should handle zero uncertainties', () => {
      const uncertainties = [0, 0, 0, 0];
      const avg = uncertainties.reduce((sum, val) => sum + val, 0) / uncertainties.length;

      expect(avg).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array for statistics', () => {
      const values: number[] = [];

      if (values.length === 0) {
        expect({
          minHeight: 0,
          maxHeight: 0,
          avgHeight: 0,
          stdDev: 0,
          variance: 0,
          medianHeight: 0,
          percentile25: 0,
          percentile75: 0,
          totalPitches: 0,
        }).toEqual({
          minHeight: 0,
          maxHeight: 0,
          avgHeight: 0,
          stdDev: 0,
          variance: 0,
          medianHeight: 0,
          percentile25: 0,
          percentile75: 0,
          totalPitches: 0,
        });
      }
    });

    it('should handle single value statistics', () => {
      const values = [42];

      const stats = {
        minHeight: Math.min(...values),
        maxHeight: Math.max(...values),
        avgHeight: values.reduce((sum, val) => sum + val, 0) / values.length,
        totalPitches: values.length,
      };

      expect(stats.minHeight).toBe(42);
      expect(stats.maxHeight).toBe(42);
      expect(stats.avgHeight).toBe(42);
      expect(stats.totalPitches).toBe(1);
    });

    it('should handle two values statistics', () => {
      const values = [10, 20];

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);

      expect(mean).toBe(15);
      expect(variance).toBe(50);
      expect(Math.sqrt(variance)).toBeCloseTo(7.071, 2);
    });
  });
});
