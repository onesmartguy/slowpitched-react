/**
 * ML Analytics Endpoint
 * Phase 6: Advanced analytics with machine learning
 */

import { Router, Request, Response } from 'express';
import dbAdapter from '../database/adapter';
import {
  LinearRegression,
  detectAnomalies,
  classifyTrend,
  calculateConsistency,
  forecastPerformance,
  calculatePercentile,
} from '../services/mlAnalytics';

const router = Router();

/**
 * POST /api/ml/predict
 * Predict future performance trends
 *
 * Body:
 * - sessionIds: array of session IDs to analyze
 * - horizon: number of days to predict (default: 7)
 */
router.post('/predict', async (req: Request, res: Response) => {
  try {
    const { sessionIds, horizon = 7 } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionIds array is required',
      });
    }

    // Gather data from sessions
    const dataPoints = [];

    for (const sessionId of sessionIds) {
      const summary = await dbAdapter.getSessionSummary(sessionId);
      const session = await dbAdapter.getSessionById(sessionId);

      if (session) {
        dataPoints.push({
          date: session.date,
          value: summary.statistics.avgHeight,
        });
      }
    }

    if (dataPoints.length < 3) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'Need at least 3 sessions for prediction',
      });
    }

    // Sort by date
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Train model and predict
    const model = new LinearRegression();
    model.train(dataPoints);

    const predictions = model.predict(horizon);
    const rSquared = model.rSquared(dataPoints);

    res.json({
      dataPoints,
      predictions,
      model: {
        type: 'linear_regression',
        rSquared: parseFloat(rSquared.toFixed(3)),
        dataPointsUsed: dataPoints.length,
      },
      horizon,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate predictions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ml/anomalies
 * Detect anomalies in pitch data
 *
 * Body:
 * - sessionId: session to analyze
 * - threshold: z-score threshold (default: 3)
 */
router.post('/anomalies', async (req: Request, res: Response) => {
  try {
    const { sessionId, threshold = 3 } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionId is required',
      });
    }

    const pitches = await dbAdapter.getPitchesBySession(sessionId);

    if (pitches.length === 0) {
      return res.json({
        sessionId,
        anomalies: [],
        totalPitches: 0,
        anomalyCount: 0,
      });
    }

    const heights = pitches.map(p => p.height);
    const anomalies = detectAnomalies(heights, threshold);

    const anomalyDetails = anomalies
      .filter(a => a.isAnomaly)
      .map(a => ({
        ...a,
        pitch: pitches[a.index],
      }));

    res.json({
      sessionId,
      threshold,
      totalPitches: pitches.length,
      anomalyCount: anomalyDetails.length,
      anomalyPercentage: parseFloat(((anomalyDetails.length / pitches.length) * 100).toFixed(1)),
      anomalies: anomalyDetails,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to detect anomalies',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ml/trend
 * Classify performance trend
 *
 * Body:
 * - sessionIds: array of session IDs in chronological order
 */
router.post('/trend', async (req: Request, res: Response) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionIds array is required',
      });
    }

    const dataPoints = [];

    for (const sessionId of sessionIds) {
      const summary = await dbAdapter.getSessionSummary(sessionId);
      const session = await dbAdapter.getSessionById(sessionId);

      if (session) {
        dataPoints.push({
          date: session.date,
          value: summary.statistics.avgHeight,
        });
      }
    }

    if (dataPoints.length < 3) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'Need at least 3 sessions for trend classification',
      });
    }

    // Sort by date
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const trendAnalysis = classifyTrend(dataPoints);

    res.json({
      dataPoints,
      trend: trendAnalysis,
      sessionsAnalyzed: dataPoints.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to classify trend',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ml/consistency
 * Analyze consistency across sessions
 *
 * Body:
 * - sessionIds: array of session IDs
 */
router.post('/consistency', async (req: Request, res: Response) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionIds array is required',
      });
    }

    const sessionData = [];

    for (const sessionId of sessionIds) {
      const summary = await dbAdapter.getSessionSummary(sessionId);
      const session = await dbAdapter.getSessionById(sessionId);

      if (session) {
        sessionData.push({
          sessionId,
          sessionName: session.name,
          date: session.date,
          avgHeight: summary.statistics.avgHeight,
          stdDev: summary.statistics.stdDev,
        });
      }
    }

    if (sessionData.length === 0) {
      return res.json({
        consistency: { score: 0, rating: 'poor', cv: 0 },
        sessionsAnalyzed: 0,
      });
    }

    const avgHeights = sessionData.map(s => s.avgHeight);
    const consistency = calculateConsistency(avgHeights);

    res.json({
      consistency,
      sessionsAnalyzed: sessionData.length,
      sessionData,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to analyze consistency',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ml/forecast
 * Forecast future performance
 *
 * Body:
 * - sessionIds: array of session IDs
 * - horizon: forecast horizon in days (default: 7)
 */
router.post('/forecast', async (req: Request, res: Response) => {
  try {
    const { sessionIds, horizon = 7 } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionIds array is required',
      });
    }

    const dataPoints = [];

    for (const sessionId of sessionIds) {
      const summary = await dbAdapter.getSessionSummary(sessionId);
      const session = await dbAdapter.getSessionById(sessionId);

      if (session) {
        dataPoints.push({
          date: session.date,
          value: summary.statistics.avgHeight,
        });
      }
    }

    if (dataPoints.length < 3) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'Need at least 3 sessions for forecasting',
      });
    }

    // Sort by date
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const forecast = forecastPerformance(dataPoints, horizon);

    res.json({
      dataPoints,
      forecast,
      horizon,
      method: 'exponential_smoothing',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate forecast',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ml/insights/:sessionId
 * Get comprehensive ML insights for a session
 */
router.get('/insights/:sessionId', async (req: Request, res: Response) => {
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
    const summary = await dbAdapter.getSessionSummary(sessionId);

    if (pitches.length === 0) {
      return res.json({
        sessionId,
        insights: {
          message: 'No pitches recorded in this session',
        },
      });
    }

    // Anomaly detection
    const heights = pitches.map(p => p.height);
    const anomalies = detectAnomalies(heights, 3).filter(a => a.isAnomaly);

    // Consistency analysis
    const consistency = calculateConsistency(heights);

    // Percentiles
    const p25 = calculatePercentile(heights, 25);
    const p50 = calculatePercentile(heights, 50);
    const p75 = calculatePercentile(heights, 75);

    res.json({
      sessionId,
      sessionName: session.name,
      insights: {
        anomalies: {
          count: anomalies.length,
          percentage: parseFloat(((anomalies.length / pitches.length) * 100).toFixed(1)),
          details: anomalies.slice(0, 5), // Top 5 anomalies
        },
        consistency,
        distribution: {
          p25: parseFloat(p25.toFixed(2)),
          median: parseFloat(p50.toFixed(2)),
          p75: parseFloat(p75.toFixed(2)),
        },
        summary: {
          totalPitches: pitches.length,
          avgHeight: summary.statistics.avgHeight,
          stdDev: summary.statistics.stdDev,
          range: {
            min: summary.statistics.minHeight,
            max: summary.statistics.maxHeight,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
