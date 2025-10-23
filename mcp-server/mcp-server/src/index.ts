/**
 * MCP Server for Pitch Height Tracker Pro
 * Phase 5: Agentic AI Integration
 *
 * Provides REST API endpoints for agent interaction with the pitch tracking system
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';
import { createServer } from 'http';

// Routes
import dataRouter from './routes/data';
import analyticsRouter from './routes/analytics';
import sessionRouter from './routes/session';
import configRouter from './routes/config';
import mlRouter from './routes/ml';
import dbAdapter from './database/adapter';
import healthRouter from './routes/health';

// WebSocket
import { wsServer } from './websocket/server';

// Logger configuration
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(limiter); // Apply rate limiting

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/data', dataRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/session', sessionRouter);
app.use('/api/config', configRouter);
app.use('/api/ml', mlRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Pitch Height Tracker MCP Server',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/api/health',
      data: '/api/data',
      analytics: '/api/analytics',
      session: '/api/session',
      config: '/api/config',
      ml: '/api/ml',
    },
    documentation: 'https://github.com/onesmartguy/slowpitched-react/blob/main/docs/MCP_API.md',
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Create HTTP server for WebSocket support
const httpServer = createServer(app);

// Initialize database and start server
dbAdapter
  .initialize()
  .then(() => {
    logger.info('Database initialized successfully');

    // Initialize WebSocket server
    wsServer.initialize(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`MCP Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 MCP Server running at http://localhost:${PORT}`);
      console.log(`📊 Database: Connected`);
      console.log(`📡 WebSocket: Active`);
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database', error);
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });

export default app;
