/**
 * Calibration Storage Service
 * CRUD operations for calibration data
 */

import { getDatabase } from './index';
import type { CalibrationData, CalibrationRow, ROI } from '../../types';

/**
 * Convert database row to CalibrationData object
 */
function rowToCalibration(row: CalibrationRow): CalibrationData {
  return {
    id: row.id,
    referenceHeight: row.reference_height,
    pixelsPerFoot: row.pixels_per_foot,
    qualityScore: row.quality_score,
    uncertainty: row.uncertainty,
    roi: {
      x: row.roi_x,
      y: row.roi_y,
      width: row.roi_width,
      height: row.roi_height,
    },
    createdAt: new Date(row.created_at).getTime(),
  };
}

/**
 * Convert CalibrationData object to database row format
 */
function calibrationToRow(
  calibration: CalibrationData
): Omit<CalibrationRow, 'id' | 'created_at'> {
  return {
    reference_height: calibration.referenceHeight,
    pixels_per_foot: calibration.pixelsPerFoot,
    quality_score: calibration.qualityScore,
    uncertainty: calibration.uncertainty,
    roi_x: calibration.roi.x,
    roi_y: calibration.roi.y,
    roi_width: calibration.roi.width,
    roi_height: calibration.roi.height,
  };
}

/**
 * Create a new calibration record
 */
export async function createCalibration(
  calibration: Omit<CalibrationData, 'id'>
): Promise<CalibrationData> {
  const db = getDatabase();
  const row = calibrationToRow(calibration as CalibrationData);
  const id = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.runAsync(
    `INSERT INTO calibrations (
      id, reference_height, pixels_per_foot, quality_score,
      uncertainty, roi_x, roi_y, roi_width, roi_height, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      row.reference_height,
      row.pixels_per_foot,
      row.quality_score,
      row.uncertainty,
      row.roi_x,
      row.roi_y,
      row.roi_width,
      row.roi_height,
      new Date().toISOString(),
    ]
  );

  return getCalibrationById(id);
}

/**
 * Get calibration by ID
 */
export async function getCalibrationById(id: string): Promise<CalibrationData> {
  const db = getDatabase();
  const row = await db.getFirstAsync<CalibrationRow>(
    'SELECT * FROM calibrations WHERE id = ?',
    [id]
  );

  if (!row) {
    throw new Error(`Calibration not found: ${id}`);
  }

  return rowToCalibration(row);
}

/**
 * Get most recent calibration
 */
export async function getLatestCalibration(): Promise<CalibrationData | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<CalibrationRow>(
    'SELECT * FROM calibrations ORDER BY created_at DESC LIMIT 1'
  );

  return row ? rowToCalibration(row) : null;
}

/**
 * Get all calibrations ordered by date (newest first)
 */
export async function getAllCalibrations(): Promise<CalibrationData[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<CalibrationRow>(
    'SELECT * FROM calibrations ORDER BY created_at DESC'
  );

  return rows.map(rowToCalibration);
}

/**
 * Get calibrations with quality above threshold
 */
export async function getHighQualityCalibrations(
  minQuality: number
): Promise<CalibrationData[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<CalibrationRow>(
    'SELECT * FROM calibrations WHERE quality_score >= ? ORDER BY created_at DESC',
    [minQuality]
  );

  return rows.map(rowToCalibration);
}

/**
 * Delete a calibration record
 */
export async function deleteCalibration(id: string): Promise<void> {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM calibrations WHERE id = ?', [id]);

  if (result.changes === 0) {
    throw new Error(`Calibration not found: ${id}`);
  }
}

/**
 * Delete old calibrations (keep only N most recent)
 */
export async function pruneOldCalibrations(keepCount: number = 10): Promise<number> {
  const db = getDatabase();

  const result = await db.runAsync(
    `DELETE FROM calibrations
     WHERE id NOT IN (
       SELECT id FROM calibrations
       ORDER BY created_at DESC
       LIMIT ?
     )`,
    [keepCount]
  );

  return result.changes;
}
