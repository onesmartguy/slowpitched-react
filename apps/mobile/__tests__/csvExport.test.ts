/**
 * Tests for CSV Export Utilities
 * Phase 7.1: Testing Strategy - Utility Functions
 */

import { exportSessionToCSV, exportMultipleSessionsToCSV } from '../src/utils/csvExport';
import { getSessionById } from '../src/services/database/sessionService';
import { getPitchesBySession } from '../src/services/database/pitchService';
import { getSessionSummary } from '../src/services/database/statisticsService';
import type { Session, Pitch } from '../src/types';

// Mock expo-sqlite first
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

// Mock database index to avoid initialization
jest.mock('../src/services/database/index', () => ({
  getDatabase: jest.fn(),
}));

// Mock database services
jest.mock('../src/services/database/sessionService');
jest.mock('../src/services/database/pitchService');
jest.mock('../src/services/database/statisticsService');

describe('CSV Export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession: Session = {
    id: 'session-1',
    name: 'Morning Practice',
    date: '2025-10-27',
    pitcherName: 'John Doe',
    location: 'Main Field',
    notes: 'Great practice session',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pitchCount: 3,
  };

  const mockPitches: Pitch[] = [
    {
      id: 'pitch-1',
      sessionId: 'session-1',
      height: 5.5,
      uncertainty: 0.1,
      timestamp: new Date('2025-10-27T10:00:00Z').getTime(),
      qualityScore: 95,
      ballPosition: { x: 100, y: 200 },
      createdAt: Date.now(),
    },
    {
      id: 'pitch-2',
      sessionId: 'session-1',
      height: 6.0,
      uncertainty: 0.08,
      timestamp: new Date('2025-10-27T10:01:00Z').getTime(),
      qualityScore: 92,
      ballPosition: { x: 110, y: 210 },
      createdAt: Date.now(),
    },
    {
      id: 'pitch-3',
      sessionId: 'session-1',
      height: 5.8,
      uncertainty: 0.12,
      timestamp: new Date('2025-10-27T10:02:00Z').getTime(),
      qualityScore: 88,
      ballPosition: { x: 105, y: 205 },
      createdAt: Date.now(),
    },
  ];

  const mockSummary = {
    statistics: {
      minHeight: 5.5,
      maxHeight: 6.0,
      avgHeight: 5.77,
      stdDev: 0.25,
      variance: 0.06,
      medianHeight: 5.8,
      percentile25: 5.65,
      percentile75: 5.9,
      totalPitches: 3,
    },
    avgUncertainty: 0.1,
    qualityDistribution: {
      excellent: 2,
      good: 1,
      fair: 0,
      poor: 0,
    },
    pitchFrequency: 1.5,
  };

  describe('exportSessionToCSV', () => {
    beforeEach(() => {
      (getSessionById as jest.Mock).mockResolvedValue(mockSession);
      (getPitchesBySession as jest.Mock).mockResolvedValue(mockPitches);
      (getSessionSummary as jest.Mock).mockResolvedValue(mockSummary);
    });

    it('should export session with all metadata', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Session: Morning Practice');
      expect(csv).toContain('Date: 2025-10-27');
      expect(csv).toContain('Pitcher: John Doe');
      expect(csv).toContain('Location: Main Field');
      expect(csv).toContain('Total Pitches: 3');
    });

    it('should include statistics summary', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Statistics');
      expect(csv).toContain('Average Height,5.77,ft');
      expect(csv).toContain('Average Uncertainty,0.10,ft');
      expect(csv).toContain('Min Height,5.50,ft');
      expect(csv).toContain('Max Height,6.00,ft');
      expect(csv).toContain('Median Height,5.80,ft');
      expect(csv).toContain('25th Percentile,5.65,ft');
      expect(csv).toContain('75th Percentile,5.90,ft');
      expect(csv).toContain('Standard Deviation,0.25,ft');
      expect(csv).toContain('Variance,0.06,ft²');
      expect(csv).toContain('Pitch Frequency,1.5,pitches/min');
    });

    it('should include quality distribution', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Quality Distribution');
      expect(csv).toContain('Excellent (90-100),2');
      expect(csv).toContain('Good (70-89),1');
      expect(csv).toContain('Fair (50-69),0');
      expect(csv).toContain('Poor (0-49),0');
    });

    it('should include pitch data with headers', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Pitch Data');
      expect(csv).toContain('Pitch #,Timestamp,Height (ft),Uncertainty (±ft),Quality Score,Ball X,Ball Y');
    });

    it('should format pitch data rows correctly', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('1,2025-10-27T10:00:00.000Z,5.50,0.10,95,100,200');
      expect(csv).toContain('2,2025-10-27T10:01:00.000Z,6.00,0.08,92,110,210');
      expect(csv).toContain('3,2025-10-27T10:02:00.000Z,5.80,0.12,88,105,205');
    });

    it('should include session notes at the end', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Session Notes');
      expect(csv).toContain('Great practice session');
    });

    it('should handle session without optional fields', async () => {
      const minimalSession: Session = {
        id: 'session-2',
        name: 'Quick Session',
        date: '2025-10-27',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pitchCount: 0,
      };

      (getSessionById as jest.Mock).mockResolvedValue(minimalSession);
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);
      (getSessionSummary as jest.Mock).mockResolvedValue({
        ...mockSummary,
        statistics: { ...mockSummary.statistics, totalPitches: 0 },
      });

      const csv = await exportSessionToCSV('session-2');

      expect(csv).toContain('Session: Quick Session');
      expect(csv).not.toContain('Pitcher:');
      expect(csv).not.toContain('Location:');
      expect(csv).not.toContain('Session Notes');
    });

    it('should escape CSV special characters in fields', async () => {
      const sessionWithSpecialChars: Session = {
        ...mockSession,
        name: 'Session, with commas',
        pitcherName: 'John "The Ace" Doe',
        notes: 'Line 1\nLine 2',
      };

      (getSessionById as jest.Mock).mockResolvedValue(sessionWithSpecialChars);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('"Session, with commas"');
      expect(csv).toContain('"John ""The Ace"" Doe"');
      expect(csv).toContain('"Line 1\nLine 2"');
    });

    it('should include calibration ID column if any pitch has it', async () => {
      const pitchesWithCalibration = [
        { ...mockPitches[0], calibrationId: 'cal-1' },
        { ...mockPitches[1] },
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitchesWithCalibration);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Calibration ID');
      expect(csv).toContain(',cal-1\n');
      expect(csv).toContain(',\n'); // Empty for second pitch
    });

    it('should include notes column if any pitch has metadata', async () => {
      const pitchesWithMetadata = [
        { ...mockPitches[0], metadata: { notes: 'Perfect pitch' } },
        { ...mockPitches[1] },
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitchesWithMetadata);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain(',Notes');
      expect(csv).toContain(',Perfect pitch\n');
      expect(csv).toContain(',\n'); // Empty for second pitch
    });

    it('should escape metadata notes correctly', async () => {
      const pitchesWithSpecialMetadata = [
        { ...mockPitches[0], metadata: { notes: 'Note, with comma' } },
      ];

      (getPitchesBySession as jest.Mock).mockResolvedValue(pitchesWithSpecialMetadata);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain(',"Note, with comma"');
    });

    it('should handle empty pitches array', async () => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);
      (getSessionSummary as jest.Mock).mockResolvedValue({
        ...mockSummary,
        statistics: {
          minHeight: 0,
          maxHeight: 0,
          avgHeight: 0,
          stdDev: 0,
          variance: 0,
          medianHeight: 0,
          percentile25: 0,
          percentile75: 0,
          totalPitches: 0,
        },
      });

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Total Pitches: 0');
      expect(csv).toContain('Pitch Data');
      expect(csv).toContain('Pitch #,Timestamp');
    });
  });

  describe('exportMultipleSessionsToCSV', () => {
    beforeEach(() => {
      (getSessionById as jest.Mock).mockImplementation(async (id: string) => ({
        ...mockSession,
        id,
        name: `Session ${id}`,
      }));
      (getPitchesBySession as jest.Mock).mockResolvedValue(mockPitches);
      (getSessionSummary as jest.Mock).mockResolvedValue(mockSummary);
    });

    it('should export multiple sessions separated by divider', async () => {
      const csv = await exportMultipleSessionsToCSV(['session-1', 'session-2']);

      expect(csv).toContain('Session: Session session-1');
      expect(csv).toContain('Session: Session session-2');
      expect(csv).toContain('='.repeat(80));
    });

    it('should export sessions in parallel', async () => {
      const startTime = Date.now();
      await exportMultipleSessionsToCSV(['session-1', 'session-2', 'session-3']);
      const duration = Date.now() - startTime;

      expect(getSessionById).toHaveBeenCalledTimes(3);
      // Should be faster than sequential (parallel execution)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle single session array', async () => {
      const csv = await exportMultipleSessionsToCSV(['session-1']);

      expect(csv).toContain('Session: Session session-1');
      expect(csv).not.toContain('='.repeat(80));
    });

    it('should handle empty sessions array', async () => {
      const csv = await exportMultipleSessionsToCSV([]);

      expect(csv).toBe('');
    });
  });

  describe('CSV escaping', () => {
    beforeEach(() => {
      (getPitchesBySession as jest.Mock).mockResolvedValue([]);
      (getSessionSummary as jest.Mock).mockResolvedValue(mockSummary);
    });

    it('should escape commas', async () => {
      const session = { ...mockSession, name: 'Test, Session' };
      (getSessionById as jest.Mock).mockResolvedValue(session);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('"Test, Session"');
    });

    it('should escape quotes by doubling them', async () => {
      const session = { ...mockSession, pitcherName: 'John "Ace" Doe' };
      (getSessionById as jest.Mock).mockResolvedValue(session);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('"John ""Ace"" Doe"');
    });

    it('should escape newlines', async () => {
      const session = { ...mockSession, notes: 'Line 1\nLine 2\nLine 3' };
      (getSessionById as jest.Mock).mockResolvedValue(session);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('"Line 1\nLine 2\nLine 3"');
    });

    it('should not escape simple strings', async () => {
      const session = { ...mockSession, name: 'SimpleSession' };
      (getSessionById as jest.Mock).mockResolvedValue(session);

      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Session: SimpleSession');
      expect(csv).not.toContain('"SimpleSession"');
    });
  });

  describe('error handling', () => {
    it('should propagate getSessionById errors', async () => {
      (getSessionById as jest.Mock).mockRejectedValue(new Error('Session not found'));

      await expect(exportSessionToCSV('nonexistent')).rejects.toThrow('Session not found');
    });

    it('should propagate getPitchesBySession errors', async () => {
      (getSessionById as jest.Mock).mockResolvedValue(mockSession);
      (getPitchesBySession as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(exportSessionToCSV('session-1')).rejects.toThrow('Database error');
    });

    it('should propagate getSessionSummary errors', async () => {
      (getSessionById as jest.Mock).mockResolvedValue(mockSession);
      (getPitchesBySession as jest.Mock).mockResolvedValue(mockPitches);
      (getSessionSummary as jest.Mock).mockRejectedValue(new Error('Stats calculation failed'));

      await expect(exportSessionToCSV('session-1')).rejects.toThrow('Stats calculation failed');
    });

    it('should handle errors in multi-session export', async () => {
      (getSessionById as jest.Mock)
        .mockResolvedValueOnce(mockSession)
        .mockRejectedValueOnce(new Error('Session 2 not found'));

      await expect(exportMultipleSessionsToCSV(['session-1', 'session-2'])).rejects.toThrow(
        'Session 2 not found'
      );
    });
  });

  describe('data formatting', () => {
    beforeEach(() => {
      (getSessionById as jest.Mock).mockResolvedValue(mockSession);
      (getPitchesBySession as jest.Mock).mockResolvedValue(mockPitches);
      (getSessionSummary as jest.Mock).mockResolvedValue(mockSummary);
    });

    it('should format numbers with 2 decimal places', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toMatch(/Average Height,5\.77,ft/);
      expect(csv).toMatch(/Min Height,5\.50,ft/);
    });

    it('should format quality scores as integers', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toMatch(/,95,/);
      expect(csv).toMatch(/,92,/);
      expect(csv).not.toMatch(/95\.0/);
    });

    it('should format timestamps as ISO strings', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('2025-10-27T10:00:00.000Z');
      expect(csv).toContain('2025-10-27T10:01:00.000Z');
    });

    it('should format pitch frequency with 1 decimal place', async () => {
      const csv = await exportSessionToCSV('session-1');

      expect(csv).toContain('Pitch Frequency,1.5,pitches/min');
    });
  });
});
