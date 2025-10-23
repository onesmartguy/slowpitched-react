/**
 * Database Adapter for MCP Server
 * Provides access to mobile app's SQLite database
 *
 * This adapter allows the MCP server to access the same database
 * used by the mobile app for consistent data access.
 */

import path from 'path';

// Import database services from mobile app
// These paths assume the MCP server is in the project root
const MOBILE_DB_PATH = path.join(__dirname, '../../../apps/mobile/src/services/database');

// Re-export database services for MCP server use
import {
  initDatabase,
  getDatabase,
  closeDatabase,
} from '../../../apps/mobile/src/services/database/index';

import {
  createSession,
  getSessionById,
  getAllSessions,
  updateSession,
  deleteSession,
  getRecentSessions,
} from '../../../apps/mobile/src/services/database/sessionService';

import {
  logPitch,
  getPitchById,
  getPitchesBySession,
  getPitchCount,
  deletePitch,
  batchLogPitches,
  getRecentPitches,
  getPitchesByDateRange,
  getHighQualityPitches,
  getAllPitches,
} from '../../../apps/mobile/src/services/database/pitchService';

import {
  getSessionSummary,
  getSessionStatistics,
  calculateConfidenceInterval,
} from '../../../apps/mobile/src/services/database/statisticsService';

import type { Session, Pitch, SessionStatistics } from '../../../apps/mobile/src/types';

/**
 * Database Adapter Class
 * Singleton pattern for database access from MCP server
 */
class DatabaseAdapter {
  private initialized: boolean = false;

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await initDatabase();
      this.initialized = true;
      console.log('[DatabaseAdapter] Database initialized successfully');
    } catch (error) {
      console.error('[DatabaseAdapter] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Session operations
  async createSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'pitchCount'>): Promise<Session> {
    await this.ensureInitialized();
    return createSession(session);
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    await this.ensureInitialized();
    return getSessionById(sessionId);
  }

  async getAllSessions(): Promise<Session[]> {
    await this.ensureInitialized();
    return getAllSessions();
  }

  async getRecentSessions(limit?: number): Promise<Session[]> {
    await this.ensureInitialized();
    return getRecentSessions(limit);
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    await this.ensureInitialized();
    return updateSession(sessionId, updates);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();
    return deleteSession(sessionId);
  }

  // Pitch operations
  async logPitch(pitch: Omit<Pitch, 'id' | 'createdAt'>): Promise<Pitch> {
    await this.ensureInitialized();
    return logPitch(pitch);
  }

  async batchLogPitches(pitches: Array<Omit<Pitch, 'id' | 'createdAt'>>): Promise<Pitch[]> {
    await this.ensureInitialized();
    return batchLogPitches(pitches);
  }

  async getPitchById(pitchId: string): Promise<Pitch | null> {
    await this.ensureInitialized();
    return getPitchById(pitchId);
  }

  async getPitchesBySession(sessionId: string, limit?: number, offset?: number): Promise<Pitch[]> {
    await this.ensureInitialized();
    return getPitchesBySession(sessionId, limit, offset);
  }

  async getPitchCount(sessionId: string): Promise<number> {
    await this.ensureInitialized();
    return getPitchCount(sessionId);
  }

  async getAllPitches(limit?: number, offset?: number): Promise<Pitch[]> {
    await this.ensureInitialized();
    return getAllPitches(limit, offset);
  }

  async getRecentPitches(limit?: number): Promise<Pitch[]> {
    await this.ensureInitialized();
    return getRecentPitches(limit);
  }

  async getPitchesByDateRange(startDate: string, endDate: string): Promise<Pitch[]> {
    await this.ensureInitialized();
    return getPitchesByDateRange(startDate, endDate);
  }

  async getHighQualityPitches(minQualityScore: number, limit?: number): Promise<Pitch[]> {
    await this.ensureInitialized();
    return getHighQualityPitches(minQualityScore, limit);
  }

  async deletePitch(pitchId: string): Promise<void> {
    await this.ensureInitialized();
    return deletePitch(pitchId);
  }

  // Statistics operations
  async getSessionSummary(sessionId: string): Promise<{
    statistics: SessionStatistics;
    avgUncertainty: number;
    qualityDistribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    pitchFrequency: number;
  }> {
    await this.ensureInitialized();
    return getSessionSummary(sessionId);
  }

  async getSessionStatistics(sessionId: string): Promise<SessionStatistics> {
    await this.ensureInitialized();
    return getSessionStatistics(sessionId);
  }

  // Advanced query operations
  async getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    await this.ensureInitialized();
    const allSessions = await getAllSessions();

    return allSessions.filter(session => {
      const sessionDate = new Date(session.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return sessionDate >= start && sessionDate <= end;
    });
  }

  async getPitchesWithFilters(filters: {
    sessionId?: string;
    minHeight?: number;
    maxHeight?: number;
    minQuality?: number;
    limit?: number;
    offset?: number;
  }): Promise<Pitch[]> {
    await this.ensureInitialized();

    let pitches: Pitch[];

    if (filters.sessionId) {
      pitches = await getPitchesBySession(filters.sessionId, filters.limit, filters.offset);
    } else {
      pitches = await getAllPitches(filters.limit, filters.offset);
    }

    // Apply additional filters
    let filtered = pitches;

    if (filters.minHeight !== undefined) {
      filtered = filtered.filter(p => p.height >= filters.minHeight!);
    }

    if (filters.maxHeight !== undefined) {
      filtered = filtered.filter(p => p.height <= filters.maxHeight!);
    }

    if (filters.minQuality !== undefined) {
      filtered = filtered.filter(p => p.qualityScore >= filters.minQuality!);
    }

    return filtered;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      await closeDatabase();
      this.initialized = false;
      console.log('[DatabaseAdapter] Database closed');
    }
  }
}

// Singleton instance
const dbAdapter = new DatabaseAdapter();

export default dbAdapter;

// Export types
export type { Session, Pitch, SessionStatistics };
