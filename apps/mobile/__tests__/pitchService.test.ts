/**
 * Tests for Pitch Service
 * Phase 7.1: Testing Strategy - Database Services
 */

import {
  createPitch,
  getPitchById,
  getPitchesBySession,
  getPitchesByDateRange,
  updatePitch,
  deletePitch,
  deletePitchesBySession,
  getPitchCount,
  getHighQualityPitches,
  createPitchesBatch,
} from '../src/services/database/pitchService';
import { initializeDatabase } from '../src/services/database';
import type { Pitch } from '../src/types';

// Mock the database module
jest.mock('../src/services/database/index', () => {
  const mockDb = {
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    withTransactionAsync: jest.fn(),
  };
  return {
    getDatabase: jest.fn(() => mockDb),
  };
});

import { getDatabase } from '../src/services/database';

describe('PitchService', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = getDatabase();
  });

  describe('createPitch', () => {
    it('should create a new pitch and return it', async () => {
      const pitch: Pitch = {
        id: 'pitch-1',
        sessionId: 'session-1',
        height: 5.5,
        uncertainty: 0.1,
        timestamp: Date.now(),
        qualityScore: 0.95,
        ballPosition: { x: 100, y: 200 },
      };

      const mockRow = {
        id: 'pitch-1',
        session_id: 'session-1',
        height: 5.5,
        uncertainty: 0.1,
        timestamp: new Date(pitch.timestamp).toISOString(),
        quality_score: 0.95,
        pixel_position_x: 100,
        pixel_position_y: 200,
        calibration_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await createPitch(pitch);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pitches'),
        expect.arrayContaining([
          'pitch-1',
          'session-1',
          5.5,
          0.1,
          expect.any(String),
          0.95,
          100,
          200,
          null,
          null,
          expect.any(String),
        ])
      );
      expect(result).toEqual(expect.objectContaining({
        id: 'pitch-1',
        sessionId: 'session-1',
        height: 5.5,
      }));
    });

    it('should create pitch with metadata', async () => {
      const pitch: Pitch = {
        id: 'pitch-2',
        sessionId: 'session-1',
        height: 6.0,
        uncertainty: 0.05,
        timestamp: Date.now(),
        qualityScore: 0.98,
        ballPosition: { x: 150, y: 250 },
        metadata: { pitcher: 'John Doe', ballType: 'softball' },
      };

      const mockRow = {
        id: 'pitch-2',
        session_id: 'session-1',
        height: 6.0,
        uncertainty: 0.05,
        timestamp: new Date(pitch.timestamp).toISOString(),
        quality_score: 0.98,
        pixel_position_x: 150,
        pixel_position_y: 250,
        calibration_id: null,
        metadata: JSON.stringify({ pitcher: 'John Doe', ballType: 'softball' }),
        created_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await createPitch(pitch);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pitches'),
        expect.arrayContaining([
          'pitch-2',
          expect.any(String), // metadata JSON
        ])
      );
      expect(result.metadata).toEqual({ pitcher: 'John Doe', ballType: 'softball' });
    });
  });

  describe('getPitchById', () => {
    it('should retrieve pitch by ID', async () => {
      const mockRow = {
        id: 'pitch-1',
        session_id: 'session-1',
        height: 5.5,
        uncertainty: 0.1,
        timestamp: new Date().toISOString(),
        quality_score: 0.95,
        pixel_position_x: 100,
        pixel_position_y: 200,
        calibration_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await getPitchById('pitch-1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM pitches WHERE id = ?',
        ['pitch-1']
      );
      expect(result.id).toBe('pitch-1');
      expect(result.sessionId).toBe('session-1');
    });

    it('should throw error if pitch not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await expect(getPitchById('nonexistent')).rejects.toThrow('Pitch not found: nonexistent');
    });
  });

  describe('getPitchesBySession', () => {
    it('should retrieve all pitches for a session', async () => {
      const mockRows = [
        {
          id: 'pitch-1',
          session_id: 'session-1',
          height: 5.5,
          uncertainty: 0.1,
          timestamp: new Date().toISOString(),
          quality_score: 0.95,
          pixel_position_x: 100,
          pixel_position_y: 200,
          calibration_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pitch-2',
          session_id: 'session-1',
          height: 6.0,
          uncertainty: 0.08,
          timestamp: new Date().toISOString(),
          quality_score: 0.92,
          pixel_position_x: 110,
          pixel_position_y: 210,
          calibration_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await getPitchesBySession('session-1');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM pitches WHERE session_id = ?'),
        ['session-1']
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pitch-1');
      expect(result[1].id).toBe('pitch-2');
    });

    it('should return empty array if no pitches found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await getPitchesBySession('empty-session');

      expect(result).toEqual([]);
    });
  });

  describe('getPitchesByDateRange', () => {
    it('should retrieve pitches within date range', async () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-10-31');

      const mockRows = [
        {
          id: 'pitch-1',
          session_id: 'session-1',
          height: 5.5,
          uncertainty: 0.1,
          timestamp: new Date('2025-10-15').toISOString(),
          quality_score: 0.95,
          pixel_position_x: 100,
          pixel_position_y: 200,
          calibration_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await getPitchesByDateRange(startDate, endDate);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE timestamp BETWEEN ? AND ?'),
        [startDate.toISOString(), endDate.toISOString()]
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('updatePitch', () => {
    it('should update pitch and return updated record', async () => {
      const pitch: Pitch = {
        id: 'pitch-1',
        sessionId: 'session-1',
        height: 6.0,
        uncertainty: 0.05,
        timestamp: Date.now(),
        qualityScore: 0.98,
        ballPosition: { x: 150, y: 250 },
      };

      const mockRow = {
        id: 'pitch-1',
        session_id: 'session-1',
        height: 6.0,
        uncertainty: 0.05,
        timestamp: new Date(pitch.timestamp).toISOString(),
        quality_score: 0.98,
        pixel_position_x: 150,
        pixel_position_y: 250,
        calibration_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await updatePitch(pitch);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE pitches SET'),
        expect.arrayContaining(['session-1', 6.0, 0.05, 'pitch-1'])
      );
      expect(result.height).toBe(6.0);
    });

    it('should throw error if pitch not found', async () => {
      const pitch: Pitch = {
        id: 'nonexistent',
        sessionId: 'session-1',
        height: 5.5,
        uncertainty: 0.1,
        timestamp: Date.now(),
        qualityScore: 0.95,
        ballPosition: { x: 100, y: 200 },
      };

      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      await expect(updatePitch(pitch)).rejects.toThrow('Pitch not found: nonexistent');
    });
  });

  describe('deletePitch', () => {
    it('should delete pitch by ID', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await deletePitch('pitch-1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM pitches WHERE id = ?',
        ['pitch-1']
      );
    });

    it('should throw error if pitch not found', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      await expect(deletePitch('nonexistent')).rejects.toThrow('Pitch not found: nonexistent');
    });
  });

  describe('deletePitchesBySession', () => {
    it('should delete all pitches for session and return count', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 5 });

      const count = await deletePitchesBySession('session-1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM pitches WHERE session_id = ?',
        ['session-1']
      );
      expect(count).toBe(5);
    });

    it('should return 0 if no pitches deleted', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const count = await deletePitchesBySession('empty-session');

      expect(count).toBe(0);
    });
  });

  describe('getPitchCount', () => {
    it('should return pitch count for session', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 42 });

      const count = await getPitchCount('session-1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        ['session-1']
      );
      expect(count).toBe(42);
    });

    it('should return 0 if no pitches', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const count = await getPitchCount('empty-session');

      expect(count).toBe(0);
    });
  });

  describe('getHighQualityPitches', () => {
    it('should retrieve pitches above quality threshold', async () => {
      const mockRows = [
        {
          id: 'pitch-1',
          session_id: 'session-1',
          height: 5.5,
          uncertainty: 0.05,
          timestamp: new Date().toISOString(),
          quality_score: 0.95,
          pixel_position_x: 100,
          pixel_position_y: 200,
          calibration_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pitch-2',
          session_id: 'session-1',
          height: 6.0,
          uncertainty: 0.03,
          timestamp: new Date().toISOString(),
          quality_score: 0.98,
          pixel_position_x: 110,
          pixel_position_y: 210,
          calibration_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await getHighQualityPitches('session-1', 0.9);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE session_id = ? AND quality_score >= ?'),
        ['session-1', 0.9]
      );
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.qualityScore >= 0.9)).toBe(true);
    });
  });

  describe('createPitchesBatch', () => {
    it('should create multiple pitches in a transaction', async () => {
      const pitches: Pitch[] = [
        {
          id: 'pitch-1',
          sessionId: 'session-1',
          height: 5.5,
          uncertainty: 0.1,
          timestamp: Date.now(),
          qualityScore: 0.95,
          ballPosition: { x: 100, y: 200 },
        },
        {
          id: 'pitch-2',
          sessionId: 'session-1',
          height: 6.0,
          uncertainty: 0.08,
          timestamp: Date.now(),
          qualityScore: 0.92,
          ballPosition: { x: 110, y: 210 },
        },
      ];

      let transactionCallback: any;
      mockDb.withTransactionAsync.mockImplementation(async (callback: any) => {
        transactionCallback = callback;
        await callback();
      });
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await createPitchesBatch(pitches);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle empty batch', async () => {
      mockDb.withTransactionAsync.mockImplementation(async (callback: any) => {
        await callback();
      });

      await createPitchesBatch([]);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.getFirstAsync.mockRejectedValue(new Error('Database connection failed'));

      await expect(getPitchById('pitch-1')).rejects.toThrow('Database connection failed');
    });

    it('should handle transaction rollback', async () => {
      mockDb.withTransactionAsync.mockRejectedValue(new Error('Transaction failed'));

      const pitches: Pitch[] = [
        {
          id: 'pitch-1',
          sessionId: 'session-1',
          height: 5.5,
          uncertainty: 0.1,
          timestamp: Date.now(),
          qualityScore: 0.95,
          ballPosition: { x: 100, y: 200 },
        },
      ];

      await expect(createPitchesBatch(pitches)).rejects.toThrow('Transaction failed');
    });
  });
});
