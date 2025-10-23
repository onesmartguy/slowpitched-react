/**
 * Session Storage Service
 * CRUD operations for session data
 */

import { getDatabase } from './index';
import { getPitchCount } from './pitchService';
import type { Session, SessionRow } from '../../types';

/**
 * Convert database row to Session object
 */
async function rowToSession(row: SessionRow): Promise<Session> {
  const pitchCount = await getPitchCount(row.id);

  return {
    id: row.id,
    name: row.name,
    date: row.date,
    pitcherName: row.pitcher_name || undefined,
    location: row.location || undefined,
    notes: row.notes || undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    pitchCount,
  };
}

/**
 * Convert Session object to database row format
 */
function sessionToRow(session: Session): Omit<SessionRow, 'created_at' | 'updated_at'> {
  return {
    id: session.id,
    name: session.name,
    date: session.date,
    pitcher_name: session.pitcherName || null,
    location: session.location || null,
    notes: session.notes || null,
  };
}

/**
 * Create a new session
 */
export async function createSession(session: Session): Promise<Session> {
  const db = getDatabase();
  const row = sessionToRow(session);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sessions (
      id, name, date, pitcher_name, location, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.name, row.date, row.pitcher_name, row.location, row.notes, now, now]
  );

  return getSessionById(session.id);
}

/**
 * Get session by ID
 */
export async function getSessionById(id: string): Promise<Session> {
  const db = getDatabase();
  const row = await db.getFirstAsync<SessionRow>('SELECT * FROM sessions WHERE id = ?', [id]);

  if (!row) {
    throw new Error(`Session not found: ${id}`);
  }

  return rowToSession(row);
}

/**
 * Get all sessions ordered by date (newest first)
 */
export async function getAllSessions(): Promise<Session[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions ORDER BY date DESC, created_at DESC'
  );

  return Promise.all(rows.map(rowToSession));
}

/**
 * Get sessions within a date range
 */
export async function getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    [startDate, endDate]
  );

  return Promise.all(rows.map(rowToSession));
}

/**
 * Update a session
 */
export async function updateSession(session: Session): Promise<Session> {
  const db = getDatabase();
  const row = sessionToRow(session);

  const result = await db.runAsync(
    `UPDATE sessions SET
      name = ?, date = ?, pitcher_name = ?,
      location = ?, notes = ?, updated_at = ?
    WHERE id = ?`,
    [row.name, row.date, row.pitcher_name, row.location, row.notes, new Date().toISOString(), session.id]
  );

  if (result.changes === 0) {
    throw new Error(`Session not found: ${session.id}`);
  }

  return getSessionById(session.id);
}

/**
 * Delete a session (and all its pitches via CASCADE)
 */
export async function deleteSession(id: string): Promise<void> {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);

  if (result.changes === 0) {
    throw new Error(`Session not found: ${id}`);
  }
}

/**
 * Get recent sessions (limit to N most recent)
 */
export async function getRecentSessions(limit: number = 10): Promise<Session[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions ORDER BY date DESC, created_at DESC LIMIT ?',
    [limit]
  );

  return Promise.all(rows.map(rowToSession));
}

/**
 * Search sessions by name or pitcher name
 */
export async function searchSessions(query: string): Promise<Session[]> {
  const db = getDatabase();
  const searchPattern = `%${query}%`;
  const rows = await db.getAllAsync<SessionRow>(
    `SELECT * FROM sessions
     WHERE name LIKE ? OR pitcher_name LIKE ?
     ORDER BY date DESC`,
    [searchPattern, searchPattern]
  );

  return Promise.all(rows.map(rowToSession));
}

/**
 * Get session count
 */
export async function getSessionCount(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sessions');

  return result?.count || 0;
}
