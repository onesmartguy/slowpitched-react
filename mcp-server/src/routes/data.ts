/**
 * Data Export Endpoint
 * Provides access to pitch data for external agents
 */

import { Router, Request, Response } from 'express';
import dbAdapter from '../database/adapter';

const router = Router();

/**
 * GET /api/data/sessions
 * Returns list of all sessions
 *
 * Query params:
 * - limit: number of sessions to return (default: 100)
 * - offset: pagination offset (default: 0)
 * - dateFrom: filter by start date (ISO string)
 * - dateTo: filter by end date (ISO string)
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0', dateFrom, dateTo } = req.query;

    let sessions;

    if (dateFrom || dateTo) {
      // Use date range filtering
      const start = dateFrom ? (dateFrom as string) : new Date(0).toISOString();
      const end = dateTo ? (dateTo as string) : new Date().toISOString();
      sessions = await dbAdapter.getSessionsByDateRange(start, end);
    } else {
      // Get all sessions
      sessions = await dbAdapter.getAllSessions();
    }

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedSessions = sessions.slice(offsetNum, offsetNum + limitNum);

    res.json({
      total: sessions.length,
      limit: limitNum,
      offset: offsetNum,
      sessions: paginatedSessions,
      filters: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch sessions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/data/sessions/:sessionId
 * Returns detailed data for a specific session
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await dbAdapter.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No session found with ID: ${sessionId}`,
      });
    }

    const pitches = await dbAdapter.getPitchesBySession(sessionId);
    const statistics = await dbAdapter.getSessionStatistics(sessionId);

    res.json({
      session,
      pitches,
      statistics,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/data/sessions/:sessionId/export
 * Exports session data in specified format
 *
 * Query params:
 * - format: 'json' | 'csv' (default: 'json')
 */
router.get('/sessions/:sessionId/export', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { format = 'json' } = req.query;

    const session = await dbAdapter.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No session found with ID: ${sessionId}`,
      });
    }

    if (format === 'csv') {
      // Generate CSV export
      const csv = await dbAdapter.exportSessionToCSV(sessionId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="session_${sessionId}.csv"`);
      res.send(csv);
    } else {
      // Generate JSON export
      const pitches = await dbAdapter.getPitchesBySession(sessionId);
      const summary = await dbAdapter.getSessionSummary(sessionId);

      res.json({
        sessionId,
        exportedAt: new Date().toISOString(),
        format: 'json',
        session,
        pitches,
        summary,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/data/pitches
 * Returns pitch data with optional filtering
 *
 * Query params:
 * - sessionId: filter by session
 * - minHeight: minimum height filter
 * - maxHeight: maximum height filter
 * - minQuality: minimum quality score
 * - limit: number of pitches to return
 * - offset: pagination offset
 */
router.get('/pitches', async (req: Request, res: Response) => {
  try {
    const { sessionId, minHeight, maxHeight, minQuality, limit = '100', offset = '0' } = req.query;

    const filters = {
      sessionId: sessionId as string | undefined,
      minHeight: minHeight ? parseFloat(minHeight as string) : undefined,
      maxHeight: maxHeight ? parseFloat(maxHeight as string) : undefined,
      minQuality: minQuality ? parseInt(minQuality as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const pitches = await dbAdapter.getPitchesWithFilters(filters);

    res.json({
      total: pitches.length,
      limit: filters.limit,
      offset: filters.offset,
      pitches,
      filters: {
        sessionId: filters.sessionId || null,
        minHeight: filters.minHeight || null,
        maxHeight: filters.maxHeight || null,
        minQuality: filters.minQuality || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch pitches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
