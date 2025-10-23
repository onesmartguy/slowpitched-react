/**
 * Pitch Storage Service
 * CRUD operations for pitch data
 */

import { getDatabase } from './index';
import type { Pitch, PitchRow } from '../../types';

/**
 * Convert database row to Pitch object
 */
function rowToPitch(row: PitchRow): Pitch {
  return {
    id: row.id,
    sessionId: row.session_id,
    height: row.height,
    uncertainty: row.uncertainty,
    timestamp: new Date(row.timestamp).getTime(),
    qualityScore: row.quality_score,
    ballPosition: {
      x: row.pixel_position_x,
      y: row.pixel_position_y,
    },
    calibrationId: row.calibration_id || undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/**
 * Convert Pitch object to database row format
 */
function pitchToRow(pitch: Pitch): Omit<PitchRow, 'created_at'> {
  return {
    id: pitch.id,
    session_id: pitch.sessionId,
    height: pitch.height,
    uncertainty: pitch.uncertainty,
    timestamp: new Date(pitch.timestamp).toISOString(),
    quality_score: pitch.qualityScore,
    pixel_position_x: pitch.ballPosition.x,
    pixel_position_y: pitch.ballPosition.y,
    calibration_id: pitch.calibrationId || null,
    metadata: pitch.metadata ? JSON.stringify(pitch.metadata) : null,
  };
}

/**
 * Create a new pitch record
 */
export async function createPitch(pitch: Pitch): Promise<Pitch> {
  const db = getDatabase();
  const row = pitchToRow(pitch);

  await db.runAsync(
    `INSERT INTO pitches (
      id, session_id, height, uncertainty, timestamp,
      quality_score, pixel_position_x, pixel_position_y,
      calibration_id, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.session_id,
      row.height,
      row.uncertainty,
      row.timestamp,
      row.quality_score,
      row.pixel_position_x,
      row.pixel_position_y,
      row.calibration_id,
      row.metadata,
      new Date().toISOString(),
    ]
  );

  return getPitchById(pitch.id);
}

/**
 * Get pitch by ID
 */
export async function getPitchById(id: string): Promise<Pitch> {
  const db = getDatabase();
  const row = await db.getFirstAsync<PitchRow>('SELECT * FROM pitches WHERE id = ?', [id]);

  if (!row) {
    throw new Error(`Pitch not found: ${id}`);
  }

  return rowToPitch(row);
}

/**
 * Get all pitches for a session
 */
export async function getPitchesBySession(sessionId: string): Promise<Pitch[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<PitchRow>(
    'SELECT * FROM pitches WHERE session_id = ? ORDER BY timestamp ASC',
    [sessionId]
  );

  return rows.map(rowToPitch);
}

/**
 * Get pitches within a date range
 */
export async function getPitchesByDateRange(startDate: Date, endDate: Date): Promise<Pitch[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<PitchRow>(
    'SELECT * FROM pitches WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC',
    [startDate.toISOString(), endDate.toISOString()]
  );

  return rows.map(rowToPitch);
}

/**
 * Update a pitch record
 */
export async function updatePitch(pitch: Pitch): Promise<Pitch> {
  const db = getDatabase();
  const row = pitchToRow(pitch);

  const result = await db.runAsync(
    `UPDATE pitches SET
      session_id = ?, height = ?, uncertainty = ?,
      timestamp = ?, quality_score = ?,
      pixel_position_x = ?, pixel_position_y = ?,
      calibration_id = ?, metadata = ?
    WHERE id = ?`,
    [
      row.session_id,
      row.height,
      row.uncertainty,
      row.timestamp,
      row.quality_score,
      row.pixel_position_x,
      row.pixel_position_y,
      row.calibration_id,
      row.metadata,
      pitch.id,
    ]
  );

  if (result.changes === 0) {
    throw new Error(`Pitch not found: ${pitch.id}`);
  }

  return getPitchById(pitch.id);
}

/**
 * Delete a pitch record
 */
export async function deletePitch(id: string): Promise<void> {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM pitches WHERE id = ?', [id]);

  if (result.changes === 0) {
    throw new Error(`Pitch not found: ${id}`);
  }
}

/**
 * Delete all pitches for a session
 */
export async function deletePitchesBySession(sessionId: string): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM pitches WHERE session_id = ?', [sessionId]);

  return result.changes;
}

/**
 * Get pitch count for a session
 */
export async function getPitchCount(sessionId: string): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pitches WHERE session_id = ?',
    [sessionId]
  );

  return result?.count || 0;
}

/**
 * Get pitches with quality above threshold
 */
export async function getHighQualityPitches(
  sessionId: string,
  minQuality: number
): Promise<Pitch[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<PitchRow>(
    'SELECT * FROM pitches WHERE session_id = ? AND quality_score >= ? ORDER BY timestamp ASC',
    [sessionId, minQuality]
  );

  return rows.map(rowToPitch);
}

/**
 * Batch insert pitches
 */
export async function createPitchesBatch(pitches: Pitch[]): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    for (const pitch of pitches) {
      const row = pitchToRow(pitch);

      await db.runAsync(
        `INSERT INTO pitches (
          id, session_id, height, uncertainty, timestamp,
          quality_score, pixel_position_x, pixel_position_y,
          calibration_id, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.session_id,
          row.height,
          row.uncertainty,
          row.timestamp,
          row.quality_score,
          row.pixel_position_x,
          row.pixel_position_y,
          row.calibration_id,
          row.metadata,
          new Date().toISOString(),
        ]
      );
    }
  });
}
