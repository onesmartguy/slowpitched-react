/**
 * Storage Integration Example
 * Demonstrates how to integrate the storage layer with tracking pipeline
 */

import { initDatabase } from '../services/database';
import { createSession, getSessionById, getAllSessions } from '../services/database/sessionService';
import { createPitch, getPitchesBySession } from '../services/database/pitchService';
import {
  createCalibration,
  getLatestCalibration,
} from '../services/database/calibrationStorageService';
import {
  calculateSessionStatistics,
  getSessionSummary,
} from '../services/database/statisticsService';
import { calculatePitchUncertainty, estimateMeasurementNoise } from '@shared/uncertainty';
import type { Session, Pitch, CalibrationData, BallDetectionResult } from '../types';

/**
 * Example 1: Initialize database on app startup
 */
export async function initializeApp() {
  try {
    console.log('[App] Initializing database...');
    await initDatabase();
    console.log('[App] Database initialized successfully');
  } catch (error) {
    console.error('[App] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Example 2: Start a new tracking session
 */
export async function startTrackingSession(
  sessionName: string,
  pitcherName?: string,
  location?: string
): Promise<Session> {
  const session: Session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: sessionName,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    pitcherName,
    location,
    notes: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await createSession(session);
  console.log('[Session] Created new session:', session.id);

  return session;
}

/**
 * Example 3: Store calibration data
 */
export async function storeCalibration(
  referenceHeight: number,
  pixelMeasurements: number[],
  roi: { x: number; y: number; width: number; height: number },
  qualityScore: number
): Promise<CalibrationData> {
  // Calculate calibration metrics
  const meanPixels =
    pixelMeasurements.reduce((sum, val) => sum + val, 0) / pixelMeasurements.length;
  const pixelsPerFoot = meanPixels / referenceHeight;

  // Calculate uncertainty from measurements
  const standardError =
    pixelMeasurements.length > 1
      ? Math.sqrt(
          pixelMeasurements.reduce((sum, val) => sum + Math.pow(val - meanPixels, 2), 0) /
            (pixelMeasurements.length - 1)
        ) / Math.sqrt(pixelMeasurements.length)
      : 0.1;

  const uncertainty = standardError / pixelsPerFoot;

  const calibration: Omit<CalibrationData, 'id'> = {
    referenceHeight,
    pixelsPerFoot,
    qualityScore,
    uncertainty,
    roi,
    timestamp: Date.now(),
    measurementCount: pixelMeasurements.length,
  };

  const stored = await createCalibration(calibration);
  console.log('[Calibration] Stored calibration:', stored.id);

  return stored;
}

/**
 * Example 4: Process and store a pitch detection
 */
export async function processPitchDetection(
  sessionId: string,
  detection: BallDetectionResult,
  frameTimestamp: number
): Promise<Pitch | null> {
  if (!detection.detected) {
    console.log('[Pitch] Ball not detected, skipping');
    return null;
  }

  // Get latest calibration
  const calibration = await getLatestCalibration();
  if (!calibration) {
    console.error('[Pitch] No calibration available');
    return null;
  }

  // Calculate height from pixel position
  const pixelHeight = detection.y; // Y coordinate in pixels
  const heightInFeet = pixelHeight / calibration.pixelsPerFoot;

  // Calculate uncertainty
  const measurementNoise = estimateMeasurementNoise(
    calibration.pixelsPerFoot,
    detection.confidence
  );

  const uncertainty = calculatePitchUncertainty(
    calibration.uncertainty,
    measurementNoise,
    detection.confidence
  );

  // Create pitch record
  const pitch: Pitch = {
    id: `pitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    height: heightInFeet,
    uncertainty,
    timestamp: frameTimestamp,
    qualityScore: detection.confidence,
    ballPosition: {
      x: detection.x,
      y: detection.y,
    },
    calibrationId: calibration.id,
    metadata: {
      notes: `Detected with ${detection.pixelCount} pixels`,
    },
  };

  await createPitch(pitch);
  console.log(`[Pitch] Stored pitch: ${heightInFeet.toFixed(2)} ft ± ${uncertainty.toFixed(2)} ft`);

  return pitch;
}

/**
 * Example 5: Get session statistics
 */
export async function getSessionStats(sessionId: string) {
  console.log('[Stats] Calculating statistics for session:', sessionId);

  const summary = await getSessionSummary(sessionId);

  console.log('[Stats] Session Summary:');
  console.log(`  Total Pitches: ${summary.statistics.totalPitches}`);
  console.log(
    `  Height Range: ${summary.statistics.minHeight.toFixed(2)} - ${summary.statistics.maxHeight.toFixed(2)} ft`
  );
  console.log(`  Average Height: ${summary.statistics.avgHeight.toFixed(2)} ft`);
  console.log(`  Std Deviation: ${summary.statistics.stdDev.toFixed(2)} ft`);
  console.log(`  Median Height: ${summary.statistics.medianHeight.toFixed(2)} ft`);
  console.log(`  Average Uncertainty: ±${summary.avgUncertainty.toFixed(2)} ft`);
  console.log(`  Pitch Frequency: ${summary.pitchFrequency.toFixed(1)} pitches/min`);
  console.log('  Quality Distribution:');
  console.log(`    Excellent (90-100): ${summary.qualityDistribution.excellent}`);
  console.log(`    Good (70-89): ${summary.qualityDistribution.good}`);
  console.log(`    Fair (50-69): ${summary.qualityDistribution.fair}`);
  console.log(`    Poor (0-49): ${summary.qualityDistribution.poor}`);

  return summary;
}

/**
 * Example 6: Export session data for CSV
 */
export async function exportSessionToCSV(sessionId: string): Promise<string> {
  const session = await getSessionById(sessionId);
  const pitches = await getPitchesBySession(sessionId);
  const statistics = await calculateSessionStatistics(sessionId);

  // CSV Header
  let csv = 'Pitch Height Tracker Pro - Session Export\n\n';
  csv += `Session: ${session.name}\n`;
  csv += `Date: ${session.date}\n`;
  if (session.pitcherName) csv += `Pitcher: ${session.pitcherName}\n`;
  if (session.location) csv += `Location: ${session.location}\n`;
  csv += '\n';

  // Statistics Summary
  csv += 'Session Statistics\n';
  csv += `Total Pitches,${statistics.totalPitches}\n`;
  csv += `Min Height (ft),${statistics.minHeight.toFixed(2)}\n`;
  csv += `Max Height (ft),${statistics.maxHeight.toFixed(2)}\n`;
  csv += `Average Height (ft),${statistics.avgHeight.toFixed(2)}\n`;
  csv += `Median Height (ft),${statistics.medianHeight.toFixed(2)}\n`;
  csv += `Std Deviation (ft),${statistics.stdDev.toFixed(2)}\n`;
  csv += `25th Percentile (ft),${statistics.percentile25.toFixed(2)}\n`;
  csv += `75th Percentile (ft),${statistics.percentile75.toFixed(2)}\n`;
  csv += '\n';

  // Pitch Data
  csv += 'Pitch Data\n';
  csv += 'Pitch #,Timestamp,Height (ft),Uncertainty (±ft),Quality Score,X Position,Y Position\n';

  pitches.forEach((pitch, index) => {
    const timestamp = new Date(pitch.timestamp).toISOString();
    csv += `${index + 1},${timestamp},${pitch.height.toFixed(2)},${pitch.uncertainty.toFixed(2)},${pitch.qualityScore.toFixed(0)},${pitch.ballPosition.x.toFixed(0)},${pitch.ballPosition.y.toFixed(0)}\n`;
  });

  console.log(`[Export] Generated CSV with ${pitches.length} pitches`);

  return csv;
}

/**
 * Example 7: Complete tracking workflow
 */
export async function completeTrackingWorkflow() {
  console.log('=== Complete Tracking Workflow Example ===\n');

  // 1. Initialize database
  await initializeApp();

  // 2. Start a new session
  const session = await startTrackingSession(
    'Practice Session - Fastballs',
    'John Doe',
    'Local Field'
  );

  // 3. Perform calibration
  const calibration = await storeCalibration(
    5.0, // 5 feet reference height
    [120, 122, 119, 121, 120], // Pixel measurements
    { x: 100, y: 50, width: 200, height: 400 }, // ROI
    95 // Quality score
  );

  console.log(
    `\n[Workflow] Calibration complete: ${calibration.pixelsPerFoot.toFixed(2)} pixels/foot\n`
  );

  // 4. Simulate detecting and storing pitches
  const mockDetections: BallDetectionResult[] = [
    { detected: true, x: 150, y: 300, confidence: 95, pixelCount: 120 },
    { detected: true, x: 155, y: 310, confidence: 92, pixelCount: 115 },
    { detected: true, x: 148, y: 295, confidence: 88, pixelCount: 110 },
    { detected: false, x: 0, y: 0, confidence: 45, pixelCount: 20 }, // Rejected
    { detected: true, x: 152, y: 305, confidence: 90, pixelCount: 118 },
  ];

  const storedPitches: Pitch[] = [];
  for (let i = 0; i < mockDetections.length; i++) {
    const detection = mockDetections[i];
    const frameTimestamp = Date.now() + i * 5000; // 5 seconds apart

    const pitch = await processPitchDetection(session.id, detection, frameTimestamp);
    if (pitch) {
      storedPitches.push(pitch);
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `\n[Workflow] Stored ${storedPitches.length} out of ${mockDetections.length} detections\n`
  );

  // 5. Get session statistics
  const summary = await getSessionStats(session.id);

  // 6. Export to CSV
  const csv = await exportSessionToCSV(session.id);
  console.log('\n[Workflow] CSV Export (first 500 chars):');
  console.log(csv.substring(0, 500) + '...\n');

  // 7. List all sessions
  const allSessions = await getAllSessions();
  console.log(`[Workflow] Total sessions in database: ${allSessions.length}\n`);

  console.log('=== Workflow Complete ===');

  return {
    session,
    calibration,
    pitches: storedPitches,
    summary,
    csv,
  };
}

/**
 * Example 8: Query and filter pitches
 */
export async function queryPitches(sessionId: string) {
  // Get all pitches
  const allPitches = await getPitchesBySession(sessionId);
  console.log(`[Query] Total pitches: ${allPitches.length}`);

  // Filter high-quality pitches (quality > 85)
  const highQualityPitches = allPitches.filter((p) => p.qualityScore > 85);
  console.log(`[Query] High-quality pitches: ${highQualityPitches.length}`);

  // Calculate average height of high-quality pitches
  if (highQualityPitches.length > 0) {
    const avgHeight =
      highQualityPitches.reduce((sum, p) => sum + p.height, 0) / highQualityPitches.length;
    console.log(`[Query] Average height (high-quality): ${avgHeight.toFixed(2)} ft`);
  }

  // Find pitches above 5 feet
  const highPitches = allPitches.filter((p) => p.height > 5.0);
  console.log(`[Query] Pitches above 5ft: ${highPitches.length}`);

  return {
    allPitches,
    highQualityPitches,
    highPitches,
  };
}
