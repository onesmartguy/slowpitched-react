/**
 * Tests for Session Service
 * Phase 7.1: Testing Strategy - Database Services
 */

import {
  createSession,
  getSessionById,
  getAllSessions,
  getSessionsByDateRange,
  updateSession,
  deleteSession,
  getRecentSessions,
  searchSessions,
  getSessionCount,
} from '../src/services/database/sessionService';
import { getPitchCount } from '../src/services/database/pitchService';
import type { Session } from '../src/types';

// Mock the database module
jest.mock('../src/services/database/index', () => {
  const mockDb = {
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  };
  return {
    getDatabase: jest.fn(() => mockDb),
  };
});

// Mock pitchService
jest.mock('../src/services/database/pitchService', () => ({
  getPitchCount: jest.fn(),
}));

import { getDatabase } from '../src/services/database';

describe('SessionService', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = getDatabase();
    (getPitchCount as jest.Mock).mockResolvedValue(0);
  });

  describe('createSession', () => {
    it('should create a new session and return it', async () => {
      const session: Session = {
        id: 'session-1',
        name: 'Morning Practice',
        date: '2025-10-27',
        pitcherName: 'John Doe',
        location: 'Main Field',
        notes: 'Focused on accuracy',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      const mockRow = {
        id: 'session-1',
        name: 'Morning Practice',
        date: '2025-10-27',
        pitcher_name: 'John Doe',
        location: 'Main Field',
        notes: 'Focused on accuracy',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await createSession(session);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions'),
        expect.arrayContaining([
          'session-1',
          'Morning Practice',
          '2025-10-27',
          'John Doe',
          'Main Field',
          'Focused on accuracy',
        ])
      );
      expect(result.id).toBe('session-1');
      expect(result.name).toBe('Morning Practice');
    });

    it('should create session with minimal fields', async () => {
      const session: Session = {
        id: 'session-2',
        name: 'Quick Session',
        date: '2025-10-27',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      const mockRow = {
        id: 'session-2',
        name: 'Quick Session',
        date: '2025-10-27',
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await createSession(session);

      expect(result.pitcherName).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });
  });

  describe('getSessionById', () => {
    it('should retrieve session by ID with pitch count', async () => {
      const mockRow = {
        id: 'session-1',
        name: 'Morning Practice',
        date: '2025-10-27',
        pitcher_name: 'John Doe',
        location: 'Main Field',
        notes: 'Test notes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);
      (getPitchCount as jest.Mock).mockResolvedValue(25);

      const result = await getSessionById('session-1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM sessions WHERE id = ?',
        ['session-1']
      );
      expect(getPitchCount).toHaveBeenCalledWith('session-1');
      expect(result.pitchCount).toBe(25);
    });

    it('should throw error if session not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await expect(getSessionById('nonexistent')).rejects.toThrow(
        'Session not found: nonexistent'
      );
    });
  });

  describe('getAllSessions', () => {
    it('should retrieve all sessions ordered by date', async () => {
      const mockRows = [
        {
          id: 'session-2',
          name: 'Afternoon Session',
          date: '2025-10-28',
          pitcher_name: 'Jane Smith',
          location: 'Field B',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'session-1',
          name: 'Morning Session',
          date: '2025-10-27',
          pitcher_name: 'John Doe',
          location: 'Field A',
          notes: 'Early practice',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(10);

      const result = await getAllSessions();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date DESC')
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session-2');
      expect(result[1].id).toBe('session-1');
    });

    it('should return empty array if no sessions', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await getAllSessions();

      expect(result).toEqual([]);
    });
  });

  describe('getSessionsByDateRange', () => {
    it('should retrieve sessions within date range', async () => {
      const mockRows = [
        {
          id: 'session-1',
          name: 'Mid-month Session',
          date: '2025-10-15',
          pitcher_name: 'John Doe',
          location: 'Main Field',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(5);

      const result = await getSessionsByDateRange('2025-10-01', '2025-10-31');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN ? AND ?'),
        ['2025-10-01', '2025-10-31']
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('updateSession', () => {
    it('should update session and return updated record', async () => {
      const session: Session = {
        id: 'session-1',
        name: 'Updated Session Name',
        date: '2025-10-27',
        pitcherName: 'Jane Smith',
        location: 'New Location',
        notes: 'Updated notes',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 15,
      };

      const mockRow = {
        id: 'session-1',
        name: 'Updated Session Name',
        date: '2025-10-27',
        pitcher_name: 'Jane Smith',
        location: 'New Location',
        notes: 'Updated notes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);
      (getPitchCount as jest.Mock).mockResolvedValue(15);

      const result = await updateSession(session);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE sessions SET'),
        expect.arrayContaining([
          'Updated Session Name',
          '2025-10-27',
          'Jane Smith',
          'New Location',
          'Updated notes',
          expect.any(String), // updated_at timestamp
          'session-1',
        ])
      );
      expect(result.name).toBe('Updated Session Name');
      expect(result.pitcherName).toBe('Jane Smith');
    });

    it('should throw error if session not found', async () => {
      const session: Session = {
        id: 'nonexistent',
        name: 'Test',
        date: '2025-10-27',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      await expect(updateSession(session)).rejects.toThrow('Session not found: nonexistent');
    });

    it('should handle clearing optional fields', async () => {
      const session: Session = {
        id: 'session-1',
        name: 'Minimal Session',
        date: '2025-10-27',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      const mockRow = {
        id: 'session-1',
        name: 'Minimal Session',
        date: '2025-10-27',
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await updateSession(session);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null, null, null]) // pitcher_name, location, notes as null
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session by ID', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await deleteSession('session-1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM sessions WHERE id = ?',
        ['session-1']
      );
    });

    it('should throw error if session not found', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      await expect(deleteSession('nonexistent')).rejects.toThrow(
        'Session not found: nonexistent'
      );
    });
  });

  describe('getRecentSessions', () => {
    it('should retrieve recent sessions with default limit', async () => {
      const mockRows = Array.from({ length: 10 }, (_, i) => ({
        id: `session-${i}`,
        name: `Session ${i}`,
        date: `2025-10-${20 + i}`,
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(5);

      const result = await getRecentSessions();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [10]
      );
      expect(result).toHaveLength(10);
    });

    it('should retrieve recent sessions with custom limit', async () => {
      const mockRows = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        name: `Session ${i}`,
        date: `2025-10-${20 + i}`,
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(3);

      const result = await getRecentSessions(5);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.any(String), [5]);
      expect(result).toHaveLength(5);
    });
  });

  describe('searchSessions', () => {
    it('should search sessions by name', async () => {
      const mockRows = [
        {
          id: 'session-1',
          name: 'Morning Practice',
          date: '2025-10-27',
          pitcher_name: 'John Doe',
          location: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(10);

      const result = await searchSessions('Morning');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE name LIKE ? OR pitcher_name LIKE ?'),
        ['%Morning%', '%Morning%']
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Morning Practice');
    });

    it('should search sessions by pitcher name', async () => {
      const mockRows = [
        {
          id: 'session-2',
          name: 'Afternoon Session',
          date: '2025-10-28',
          pitcher_name: 'Jane Smith',
          location: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);
      (getPitchCount as jest.Mock).mockResolvedValue(8);

      const result = await searchSessions('Jane');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['%Jane%', '%Jane%']
      );
      expect(result).toHaveLength(1);
      expect(result[0].pitcherName).toBe('Jane Smith');
    });

    it('should return empty array if no matches', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await searchSessions('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getSessionCount', () => {
    it('should return total session count', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 42 });

      const count = await getSessionCount();

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM sessions'
      );
      expect(count).toBe(42);
    });

    it('should return 0 if no sessions', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const count = await getSessionCount();

      expect(count).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in create', async () => {
      const session: Session = {
        id: 'session-1',
        name: 'Test',
        date: '2025-10-27',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      await expect(createSession(session)).rejects.toThrow('Database error');
    });

    it('should handle database errors in queries', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Query failed'));

      await expect(getAllSessions()).rejects.toThrow('Query failed');
    });

    it('should handle getPitchCount failures gracefully', async () => {
      const mockRow = {
        id: 'session-1',
        name: 'Test Session',
        date: '2025-10-27',
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);
      (getPitchCount as jest.Mock).mockRejectedValue(new Error('Pitch count failed'));

      await expect(getSessionById('session-1')).rejects.toThrow('Pitch count failed');
    });
  });

  describe('data transformation', () => {
    it('should correctly convert timestamps', async () => {
      const now = new Date();
      const mockRow = {
        id: 'session-1',
        name: 'Test',
        date: '2025-10-27',
        pitcher_name: null,
        location: null,
        notes: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);
      (getPitchCount as jest.Mock).mockResolvedValue(0);

      const result = await getSessionById('session-1');

      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.updatedAt).toBe('number');
      expect(result.createdAt).toBe(now.getTime());
    });
  });
});
