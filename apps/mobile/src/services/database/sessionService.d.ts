/**
 * Session Storage Service
 * CRUD operations for session data
 */
import type { Session } from '../../types';
/**
 * Create a new session
 */
export declare function createSession(session: Session): Promise<Session>;
/**
 * Get session by ID
 */
export declare function getSessionById(id: string): Promise<Session>;
/**
 * Get all sessions ordered by date (newest first)
 */
export declare function getAllSessions(): Promise<Session[]>;
/**
 * Get sessions within a date range
 */
export declare function getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]>;
/**
 * Update a session
 */
export declare function updateSession(session: Session): Promise<Session>;
/**
 * Delete a session (and all its pitches via CASCADE)
 */
export declare function deleteSession(id: string): Promise<void>;
/**
 * Get recent sessions (limit to N most recent)
 */
export declare function getRecentSessions(limit?: number): Promise<Session[]>;
/**
 * Search sessions by name or pitcher name
 */
export declare function searchSessions(query: string): Promise<Session[]>;
/**
 * Get session count
 */
export declare function getSessionCount(): Promise<number>;
//# sourceMappingURL=sessionService.d.ts.map