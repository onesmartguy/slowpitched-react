/**
 * Tests for Statistics Service (Enhanced)
 * Phase 7.1: Testing Strategy - Database Services
 */

import {
  calculateSessionStatistics,
  getPitchHeightDistribution,
  calculateAverageUncertainty,
  getPitchQualityDistribution,
  getPitchFrequency,
  getSessionSummary,
} from '../src/services/database/statisticsService';
import { getPitchesBySession } from '../src/services/database/pitchService';
import type { Pitch } from '../src/types';

// Mock pitchService
jest.mock('../src/services/database/pitchService', () => ({
  getPitchesBySession: jest.fn(),
}));

describe('StatisticsService (Enhanced)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockPitch = (height: number, qualityScore: number, timestamp: number, uncertainty: number = 0.1): Pitch => ({
    id: `pitch-${Math.random()}`,
    sessionId: 'session-1',
    height,
    uncertainty,
    timestamp,
    qualityScore,
    ballPosition: { x: 100, y: 200 },
    createdAt: timestamp,
  });

  describe('calculateSessionStatistics', () => {
    it('should calculate statistics for session with pitches', async () => {
      const pitches: Pitch[] = [
        createMockPitch(4.0, 85, Date.now(), 0.05),
        createMockPitch(5.0, 90, Date.now(), 0.08),
        createMockPitch(6.0, 95, Date.now(), 0.06),
        createMockPitch(5.5, 88, Date.now(), 0.07),
        createMockPitch(4.5, 82, Date.now(), 0.09),
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const stats = await calculateSessionStatistics('session-1');

      expect(stats.minHeight).toBe(4.0);
      expect(stats.maxHeight).toBe(6.0);
      expect(stats.avgHeight).toBe(5.0);
      expect(stats.totalPitches).toBe(5);
      expect(stats.medianHeight).toBe(5.0);
      expect(stats.percentile25).toBeLessThan(5.0);
      expect(stats.percentile75).toBeGreaterThan(5.0);
      expect(stats.stdDev).toBeGreaterThan(0);
      expect(stats.variance).toBeGreaterThan(0);
    });

    it('should return zeros for empty session', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const stats = await calculateSessionStatistics('empty-session');

      expect(stats).toEqual({
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
    });

    it('should handle single pitch', async () => {
      const pitches: Pitch[] = [createMockPitch(5.5, 90, Date.now())];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const stats = await calculateSessionStatistics('session-1');

      expect(stats.minHeight).toBe(5.5);
      expect(stats.maxHeight).toBe(5.5);
      expect(stats.avgHeight).toBe(5.5);
      expect(stats.medianHeight).toBe(5.5);
      expect(stats.stdDev).toBe(0); // Variance is 0 for single value
      expect(stats.totalPitches).toBe(1);
    });

    it('should calculate correct percentiles', async () => {
      // Create 11 pitches with heights from 1.0 to 11.0
      const pitches: Pitch[] = Array.from({ length: 11 }, (_, i) =>
        createMockPitch(i + 1, 90, Date.now() + i * 1000)
      );

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const stats = await calculateSessionStatistics('session-1');

      expect(stats.percentile25).toBeCloseTo(3.5, 1); // 25th percentile
      expect(stats.medianHeight).toBe(6); // 50th percentile (middle value)
      expect(stats.percentile75).toBeCloseTo(8.5, 1); // 75th percentile
    });

    it('should calculate correct variance and standard deviation', async () => {
      const pitches: Pitch[] = [
        createMockPitch(2, 90, Date.now()),
        createMockPitch(4, 90, Date.now()),
        createMockPitch(4, 90, Date.now()),
        createMockPitch(4, 90, Date.now()),
        createMockPitch(5, 90, Date.now()),
        createMockPitch(5, 90, Date.now()),
        createMockPitch(7, 90, Date.now()),
        createMockPitch(9, 90, Date.now()),
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const stats = await calculateSessionStatistics('session-1');

      // Mean = 5, variance calculation uses sample variance (n-1)
      expect(stats.variance).toBeGreaterThan(0);
      expect(stats.stdDev).toBeGreaterThan(0);
      expect(stats.stdDev).toBe(Math.sqrt(stats.variance));
    });
  });

  describe('getPitchHeightDistribution', () => {
    it('should create histogram bins', async () => {
      const pitches: Pitch[] = [
        createMockPitch(2.0, 90, Date.now()),
        createMockPitch(3.0, 90, Date.now()),
        createMockPitch(5.0, 90, Date.now()),
        createMockPitch(7.0, 90, Date.now()),
        createMockPitch(8.0, 90, Date.now()),
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const distribution = await getPitchHeightDistribution('session-1', 3);

      expect(distribution).toHaveLength(3);
      expect(distribution[0].binStart).toBeCloseTo(2.0, 1);
      expect(distribution[distribution.length - 1].binEnd).toBeCloseTo(8.0, 1);
      expect(distribution.reduce((sum, bin) => sum + bin.count, 0)).toBe(5);
    });

    it('should return empty array for empty session', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const distribution = await getPitchHeightDistribution('empty-session');

      expect(distribution).toEqual([]);
    });

    it('should use default bin count', async () => {
      const pitches: Pitch[] = Array.from({ length: 50 }, (_, i) =>
        createMockPitch(i + 1, 90, Date.now())
      );

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const distribution = await getPitchHeightDistribution('session-1');

      expect(distribution).toHaveLength(10); // Default bin count
    });

    it('should handle edge values in last bin', async () => {
      const pitches: Pitch[] = [
        createMockPitch(1.0, 90, Date.now()),
        createMockPitch(5.0, 90, Date.now()),
        createMockPitch(10.0, 90, Date.now()), // Max value should be included in last bin
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const distribution = await getPitchHeightDistribution('session-1', 2);

      expect(distribution).toHaveLength(2);
      const totalCount = distribution.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(3); // All pitches counted
    });
  });

  describe('calculateAverageUncertainty', () => {
    it('should calculate average uncertainty', async () => {
      const pitches: Pitch[] = [
        createMockPitch(5.0, 90, Date.now(), 0.10),
        createMockPitch(5.5, 90, Date.now(), 0.20),
        createMockPitch(6.0, 90, Date.now(), 0.15),
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const avgUncertainty = await calculateAverageUncertainty('session-1');

      expect(avgUncertainty).toBeCloseTo(0.15, 2); // (0.10 + 0.20 + 0.15) / 3
    });

    it('should return 0 for empty session', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const avgUncertainty = await calculateAverageUncertainty('empty-session');

      expect(avgUncertainty).toBe(0);
    });
  });

  describe('getPitchQualityDistribution', () => {
    it('should categorize pitches by quality', async () => {
      const pitches: Pitch[] = [
        createMockPitch(5.0, 95, Date.now()), // excellent (>=90)
        createMockPitch(5.0, 92, Date.now()), // excellent (>=90)
        createMockPitch(5.0, 85, Date.now()), // good (70-89)
        createMockPitch(5.0, 75, Date.now()), // good (70-89)
        createMockPitch(5.0, 65, Date.now()), // fair (50-69)
        createMockPitch(5.0, 55, Date.now()), // fair (50-69)
        createMockPitch(5.0, 45, Date.now()), // poor (<50)
        createMockPitch(5.0, 30, Date.now()), // poor (<50)
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const distribution = await getPitchQualityDistribution('session-1');

      // Note: quality_score is 0-100, but thresholds are 90, 70, 50
      expect(distribution.excellent).toBe(2);
      expect(distribution.good).toBe(2);
      expect(distribution.fair).toBe(2);
      expect(distribution.poor).toBe(2);
    });

    it('should return zeros for empty session', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const distribution = await getPitchQualityDistribution('empty-session');

      expect(distribution).toEqual({
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      });
    });

    it('should handle boundary values correctly', async () => {
      const pitches: Pitch[] = [
        createMockPitch(5.0, 90, Date.now()), // excellent (exactly 90)
        createMockPitch(5.0, 70, Date.now()), // good (exactly 70)
        createMockPitch(5.0, 50, Date.now()), // fair (exactly 50)
        createMockPitch(5.0, 49, Date.now()), // poor (just below 50)
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const distribution = await getPitchQualityDistribution('session-1');

      expect(distribution).toEqual({
        excellent: 1,
        good: 1,
        fair: 1,
        poor: 1,
      });
    });
  });

  describe('getPitchFrequency', () => {
    it('should calculate pitches per minute', async () => {
      const now = Date.now();
      const pitches: Pitch[] = [
        createMockPitch(5.0, 90, now),
        createMockPitch(5.0, 90, now + 60 * 1000), // 1 minute later
        createMockPitch(5.0, 90, now + 120 * 1000), // 2 minutes later
        createMockPitch(5.0, 90, now + 180 * 1000), // 3 minutes later
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const frequency = await getPitchFrequency('session-1');

      expect(frequency).toBeCloseTo(4 / 3, 1); // 4 pitches over 3 minutes
    });

    it('should return 0 for single pitch', async () => {
      const pitches: Pitch[] = [createMockPitch(5.0, 90, Date.now())];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const frequency = await getPitchFrequency('session-1');

      expect(frequency).toBe(0);
    });

    it('should return 0 for empty session', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const frequency = await getPitchFrequency('empty-session');

      expect(frequency).toBe(0);
    });

    it('should handle pitches at same timestamp', async () => {
      const now = Date.now();
      const pitches: Pitch[] = [
        createMockPitch(5.0, 90, now),
        createMockPitch(5.0, 90, now), // Same timestamp
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const frequency = await getPitchFrequency('session-1');

      expect(frequency).toBe(0); // Duration is 0
    });
  });

  describe('getSessionSummary', () => {
    it('should return all metrics in parallel', async () => {
      const now = Date.now();
      const pitches: Pitch[] = [
        createMockPitch(4.0, 95, now, 0.05), // excellent
        createMockPitch(5.0, 85, now + 60 * 1000, 0.10), // good
        createMockPitch(6.0, 75, now + 120 * 1000, 0.08), // good
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitches);

      const summary = await getSessionSummary('session-1');

      expect(summary).toHaveProperty('statistics');
      expect(summary).toHaveProperty('avgUncertainty');
      expect(summary).toHaveProperty('qualityDistribution');
      expect(summary).toHaveProperty('pitchFrequency');

      expect(summary.statistics.totalPitches).toBe(3);
      expect(summary.avgUncertainty).toBeCloseTo(0.0767, 2);
      expect(summary.qualityDistribution.excellent).toBe(1);
      expect(summary.qualityDistribution.good).toBe(2); // 85 and 75 are both good
      expect(summary.qualityDistribution.fair).toBe(0);
      expect(summary.pitchFrequency).toBeGreaterThan(0);
    });

    it('should handle empty session in summary', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);

      const summary = await getSessionSummary('empty-session');

      expect(summary.statistics.totalPitches).toBe(0);
      expect(summary.avgUncertainty).toBe(0);
      expect(summary.qualityDistribution.excellent).toBe(0);
      expect(summary.pitchFrequency).toBe(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle getPitchesBySession errors', async () => {
      (getPitchesBySession as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(calculateSessionStatistics('session-1')).rejects.toThrow('Database error');
      await expect(getPitchHeightDistribution('session-1')).rejects.toThrow('Database error');
      await expect(calculateAverageUncertainty('session-1')).rejects.toThrow('Database error');
      await expect(getPitchQualityDistribution('session-1')).rejects.toThrow('Database error');
      await expect(getPitchFrequency('session-1')).rejects.toThrow('Database error');
      await expect(getSessionSummary('session-1')).rejects.toThrow('Database error');
    });

    it('should handle very large datasets', async () => {
      const largePitches: Pitch[] = Array.from({ length: 1000 }, (_, i) =>
        createMockPitch(i % 10, 90, Date.now() + i * 1000)
      );

      (getPitchesBySession as jest.Mock).mockResolvedValue(largePitches);

      const stats = await calculateSessionStatistics('session-1');

      expect(stats.totalPitches).toBe(1000);
      expect(stats.minHeight).toBe(0);
      expect(stats.maxHeight).toBe(9);
    });
  });
});
