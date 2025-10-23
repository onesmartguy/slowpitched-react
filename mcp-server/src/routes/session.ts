/**
 * Session Management Endpoint
 * Provides session CRUD operations for agents
 */

import { Router, Request, Response } from 'express';
import dbAdapter from '../database/adapter';
import { wsServer } from '../websocket/server';

const router = Router();

/**
 * POST /api/session
 * Create a new session
 *
 * Body:
 * - name: session name
 * - date: session date (ISO string)
 * - pitcherName: optional pitcher name
 * - location: optional location
 * - notes: optional notes
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, date, pitcherName, location, notes } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        error: 'Missing required fields: name, date',
      });
    }

    const session = await dbAdapter.createSession({
      name,
      date,
      pitcherName,
      location,
      notes,
    });

    // Broadcast session created event via WebSocket
    wsServer.broadcastSessionUpdate({
      sessionId: session.id,
      action: 'created',
      session: {
        id: session.id,
        name: session.name,
        date: session.date,
        pitchCount: session.pitchCount,
      },
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/session/:sessionId
 * Update existing session
 */
router.put('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    // TODO: Integrate with sessionService
    const updatedSession = {
      id: sessionId,
      ...updates,
      updatedAt: Date.now(),
    };

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/session/:sessionId
 * Delete a session and all associated pitches
 */
router.delete('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // TODO: Integrate with sessionService.deleteSession()
    res.json({
      success: true,
      sessionId,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/session/:sessionId/pitches
 * Add pitch data to a session
 *
 * Body:
 * - height: pitch height in feet
 * - uncertainty: measurement uncertainty
 * - qualityScore: quality score (0-100)
 * - ballPosition: { x, y } position
 * - calibrationId: optional calibration ID
 * - metadata: optional metadata object
 */
router.post('/:sessionId/pitches', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { height, uncertainty, qualityScore, ballPosition, calibrationId, metadata } = req.body;

    if (!height || !uncertainty || !qualityScore || !ballPosition) {
      return res.status(400).json({
        error: 'Missing required fields: height, uncertainty, qualityScore, ballPosition',
      });
    }

    // TODO: Integrate with pitchService
    const pitch = {
      id: `pitch_${Date.now()}`,
      sessionId,
      height,
      uncertainty,
      timestamp: Date.now(),
      qualityScore,
      ballPosition,
      calibrationId,
      metadata,
      createdAt: Date.now(),
    };

    res.status(201).json(pitch);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create pitch',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/session/:sessionId/pitches/batch
 * Add multiple pitches to a session in one request
 *
 * Body:
 * - pitches: array of pitch objects
 */
router.post('/:sessionId/pitches/batch', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { pitches } = req.body;

    if (!pitches || !Array.isArray(pitches)) {
      return res.status(400).json({
        error: 'Missing required field: pitches (array)',
      });
    }

    // TODO: Integrate with pitchService.createPitchesBatch()
    const createdPitches = pitches.map((pitch, index) => ({
      id: `pitch_${Date.now()}_${index}`,
      sessionId,
      ...pitch,
      createdAt: Date.now(),
    }));

    res.status(201).json({
      success: true,
      count: createdPitches.length,
      pitches: createdPitches,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create pitches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
