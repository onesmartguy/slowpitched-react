/**
 * WebSocket Server
 * Phase 6: Real-time updates for pitch tracking
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../index';

export interface PitchUpdateEvent {
  sessionId: string;
  pitch: {
    id: string;
    height: number;
    uncertainty: number;
    qualityScore: number;
    timestamp: number;
  };
}

export interface SessionUpdateEvent {
  sessionId: string;
  action: 'created' | 'updated' | 'deleted';
  session?: {
    id: string;
    name: string;
    date: string;
    pitchCount: number;
  };
}

class WebSocketServer {
  private io: Server | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // Configure appropriately for production
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      this.connectedClients.set(clientId, socket);

      logger.info(`WebSocket client connected: ${clientId}`);
      console.log(`📡 WebSocket client connected: ${clientId} (Total: ${this.connectedClients.size})`);

      // Handle client joining specific session rooms
      socket.on('join_session', (sessionId: string) => {
        socket.join(`session:${sessionId}`);
        logger.info(`Client ${clientId} joined session ${sessionId}`);
        console.log(`👥 Client ${clientId} joined session ${sessionId}`);
      });

      // Handle client leaving session rooms
      socket.on('leave_session', (sessionId: string) => {
        socket.leave(`session:${sessionId}`);
        logger.info(`Client ${clientId} left session ${sessionId}`);
        console.log(`👋 Client ${clientId} left session ${sessionId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedClients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
        console.log(`📡 WebSocket client disconnected: ${clientId} (Total: ${this.connectedClients.size})`);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        clientId,
        timestamp: Date.now(),
        message: 'Connected to Pitch Height Tracker WebSocket server',
      });
    });

    logger.info('WebSocket server initialized');
    console.log('📡 WebSocket server initialized');
  }

  /**
   * Broadcast new pitch to all clients watching a session
   */
  broadcastPitch(sessionId: string, pitch: PitchUpdateEvent['pitch']): void {
    if (!this.io) return;

    const event: PitchUpdateEvent = {
      sessionId,
      pitch,
    };

    this.io.to(`session:${sessionId}`).emit('pitch_logged', event);

    logger.debug(`Broadcasted pitch ${pitch.id} to session ${sessionId}`);
  }

  /**
   * Broadcast session update to all clients
   */
  broadcastSessionUpdate(event: SessionUpdateEvent): void {
    if (!this.io) return;

    this.io.emit('session_updated', event);

    logger.debug(`Broadcasted session ${event.action}: ${event.sessionId}`);
  }

  /**
   * Broadcast session statistics update
   */
  broadcastStatisticsUpdate(sessionId: string, statistics: any): void {
    if (!this.io) return;

    this.io.to(`session:${sessionId}`).emit('statistics_updated', {
      sessionId,
      statistics,
      timestamp: Date.now(),
    });

    logger.debug(`Broadcasted statistics update for session ${sessionId}`);
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get all connected client IDs
   */
  getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, event: string, data: any): boolean {
    const client = this.connectedClients.get(clientId);

    if (client) {
      client.emit(event, data);
      return true;
    }

    return false;
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(event: string, data: any): void {
    if (!this.io) return;

    this.io.emit(event, data);
  }

  /**
   * Close WebSocket server
   */
  close(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.connectedClients.clear();
      logger.info('WebSocket server closed');
    }
  }
}

// Singleton instance
export const wsServer = new WebSocketServer();
