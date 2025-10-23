/**
 * Session Statistics Service
 * Calculate statistical metrics for pitch sessions
 */

import { getPitchesBySession } from './pitchService';
import type { SessionStatistics, Pitch } from '../../types';

/**
 * Calculate statistics for a session
 */
export async function calculateSessionStatistics(sessionId: string): Promise<SessionStatistics> {
  const pitches = await getPitchesBySession(sessionId);

  if (pitches.length === 0) {
    return {
      minHeight: 0,
      maxHeight: 0,
      avgHeight: 0,
      stdDev: 0,
      variance: 0,
      medianHeight: 0,
      percentile25: 0,
      percentile75: 0,
      totalPitches: 0,
    };
  }

  const heights = pitches.map((p) => p.height).sort((a, b) => a - b);

  return {
    minHeight: Math.min(...heights),
    maxHeight: Math.max(...heights),
    avgHeight: calculateMean(heights),
    stdDev: calculateStandardDeviation(heights),
    variance: calculateVariance(heights),
    medianHeight: calculatePercentile(heights, 50),
    percentile25: calculatePercentile(heights, 25),
    percentile75: calculatePercentile(heights, 75),
    totalPitches: pitches.length,
  };
}

/**
 * Calculate mean
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate variance
 */
function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = calculateMean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}

/**
 * Calculate percentile (values must be sorted)
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Get pitch height distribution (histogram bins)
 */
export async function getPitchHeightDistribution(
  sessionId: string,
  binCount: number = 10
): Promise<{ binStart: number; binEnd: number; count: number }[]> {
  const pitches = await getPitchesBySession(sessionId);

  if (pitches.length === 0) return [];

  const heights = pitches.map((p) => p.height);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  const binSize = (max - min) / binCount;

  const bins: { binStart: number; binEnd: number; count: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;

    const count = heights.filter(
      (h) => h >= binStart && (i === binCount - 1 ? h <= binEnd : h < binEnd)
    ).length;

    bins.push({ binStart, binEnd, count });
  }

  return bins;
}

/**
 * Calculate average uncertainty for a session
 */
export async function calculateAverageUncertainty(sessionId: string): Promise<number> {
  const pitches = await getPitchesBySession(sessionId);

  if (pitches.length === 0) return 0;

  const avgUncertainty = pitches.reduce((sum, p) => sum + p.uncertainty, 0) / pitches.length;

  return avgUncertainty;
}

/**
 * Get pitch quality distribution
 */
export async function getPitchQualityDistribution(
  sessionId: string
): Promise<{ excellent: number; good: number; fair: number; poor: number }> {
  const pitches = await getPitchesBySession(sessionId);

  const distribution = {
    excellent: 0, // 90-100
    good: 0, // 70-89
    fair: 0, // 50-69
    poor: 0, // 0-49
  };

  for (const pitch of pitches) {
    if (pitch.qualityScore >= 90) {
      distribution.excellent++;
    } else if (pitch.qualityScore >= 70) {
      distribution.good++;
    } else if (pitch.qualityScore >= 50) {
      distribution.fair++;
    } else {
      distribution.poor++;
    }
  }

  return distribution;
}

/**
 * Get pitch frequency over time (pitches per minute)
 */
export async function getPitchFrequency(sessionId: string): Promise<number> {
  const pitches = await getPitchesBySession(sessionId);

  if (pitches.length < 2) return 0;

  const timestamps = pitches.map((p) => p.timestamp).sort((a, b) => a - b);
  const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 / 60; // minutes

  if (duration === 0) return 0;

  return pitches.length / duration;
}

/**
 * Get session summary with all key metrics
 */
export async function getSessionSummary(sessionId: string): Promise<{
  statistics: SessionStatistics;
  avgUncertainty: number;
  qualityDistribution: { excellent: number; good: number; fair: number; poor: number };
  pitchFrequency: number;
}> {
  const [statistics, avgUncertainty, qualityDistribution, pitchFrequency] = await Promise.all([
    calculateSessionStatistics(sessionId),
    calculateAverageUncertainty(sessionId),
    getPitchQualityDistribution(sessionId),
    getPitchFrequency(sessionId),
  ]);

  return {
    statistics,
    avgUncertainty,
    qualityDistribution,
    pitchFrequency,
  };
}
