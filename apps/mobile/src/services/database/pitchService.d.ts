/**
 * Pitch Storage Service
 * CRUD operations for pitch data
 */
import type { Pitch } from '../../types';
/**
 * Create a new pitch record
 */
export declare function createPitch(pitch: Pitch): Promise<Pitch>;
/**
 * Get pitch by ID
 */
export declare function getPitchById(id: string): Promise<Pitch>;
/**
 * Get all pitches for a session
 */
export declare function getPitchesBySession(sessionId: string): Promise<Pitch[]>;
/**
 * Get pitches within a date range
 */
export declare function getPitchesByDateRange(startDate: Date, endDate: Date): Promise<Pitch[]>;
/**
 * Update a pitch record
 */
export declare function updatePitch(pitch: Pitch): Promise<Pitch>;
/**
 * Delete a pitch record
 */
export declare function deletePitch(id: string): Promise<void>;
/**
 * Delete all pitches for a session
 */
export declare function deletePitchesBySession(sessionId: string): Promise<number>;
/**
 * Get pitch count for a session
 */
export declare function getPitchCount(sessionId: string): Promise<number>;
/**
 * Get pitches with quality above threshold
 */
export declare function getHighQualityPitches(sessionId: string, minQuality: number): Promise<Pitch[]>;
/**
 * Batch insert pitches
 */
export declare function createPitchesBatch(pitches: Pitch[]): Promise<void>;
//# sourceMappingURL=pitchService.d.ts.map