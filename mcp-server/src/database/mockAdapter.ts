/**
 * Mock Database Adapter for Standalone MCP Server
 * Provides in-memory data storage for testing without mobile app dependency
 */

interface Pitch {
  id: string;
  sessionId: string;
  height: number;
  uncertainty: number;
  qualityScore: number;
  timestamp: number;
  createdAt: string;
}

interface Session {
  id: string;
  name: string;
  date: string;
  pitcherName?: string;
  location?: string;
  notes?: string;
  pitchCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionSummary {
  sessionId: string;
  totalPitches: number;
  statistics: {
    avgHeight: number;
    stdDev: number;
    minHeight: number;
    maxHeight: number;
    avgUncertainty: number;
    avgQuality: number;
  };
}

/**
 * Mock Database Adapter
 * In-memory storage for testing
 */
class MockDatabaseAdapter {
  private initialized: boolean = false;
  private sessions: Map<string, Session> = new Map();
  private pitches: Map<string, Pitch> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[MockDB] Initializing in-memory database...');

    // Create some sample data
    this.createSampleData();

    this.initialized = true;
    console.log('[MockDB] Database initialized with sample data');
  }

  private createSampleData(): void {
    // Sample session
    const sessionId = 'session_' + Date.now();
    const session: Session = {
      id: sessionId,
      name: 'Sample Session',
      date: new Date().toISOString(),
      pitcherName: 'Test Pitcher',
      location: 'Practice Field',
      notes: 'Sample data for testing',
      pitchCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, session);

    // Sample pitches
    for (let i = 0; i < 10; i++) {
      const pitchId = `pitch_${Date.now()}_${i}`;
      const pitch: Pitch = {
        id: pitchId,
        sessionId,
        height: 42 + Math.random() * 6, // 42-48 inches
        uncertainty: 0.5 + Math.random() * 1.5, // 0.5-2 inches
        qualityScore: 70 + Math.random() * 30, // 70-100
        timestamp: Date.now() - (10 - i) * 1000,
        createdAt: new Date(Date.now() - (10 - i) * 1000).toISOString(),
      };
      this.pitches.set(pitchId, pitch);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // Session operations
  async getAllSessions(): Promise<Session[]> {
    this.ensureInitialized();
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSessionById(id: string): Promise<Session | null> {
    this.ensureInitialized();
    return this.sessions.get(id) || null;
  }

  async createSession(data: Omit<Session, 'id' | 'pitchCount' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    this.ensureInitialized();
    const session: Session = {
      ...data,
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      pitchCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | null> {
    this.ensureInitialized();
    const session = this.sessions.get(id);
    if (!session) return null;

    const updated = {
      ...session,
      ...data,
      id: session.id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    this.ensureInitialized();
    // Also delete associated pitches
    const pitchesToDelete = Array.from(this.pitches.values())
      .filter(p => p.sessionId === id)
      .map(p => p.id);

    pitchesToDelete.forEach(pitchId => this.pitches.delete(pitchId));
    return this.sessions.delete(id);
  }

  async getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    this.ensureInitialized();
    const sessions = Array.from(this.sessions.values());
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return sessionDate >= start && sessionDate <= end;
    });
  }

  // Pitch operations
  async getPitchesBySession(sessionId: string): Promise<Pitch[]> {
    this.ensureInitialized();
    return Array.from(this.pitches.values())
      .filter(p => p.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async getPitchById(id: string): Promise<Pitch | null> {
    this.ensureInitialized();
    return this.pitches.get(id) || null;
  }

  async getAllPitches(limit?: number, offset?: number): Promise<Pitch[]> {
    this.ensureInitialized();
    let pitches = Array.from(this.pitches.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    if (offset) pitches = pitches.slice(offset);
    if (limit) pitches = pitches.slice(0, limit);

    return pitches;
  }

  async getPitchesWithFilters(filters: {
    sessionId?: string;
    minHeight?: number;
    maxHeight?: number;
    minQuality?: number;
    limit?: number;
    offset?: number;
  }): Promise<Pitch[]> {
    this.ensureInitialized();
    let pitches = Array.from(this.pitches.values());

    if (filters.sessionId) {
      pitches = pitches.filter(p => p.sessionId === filters.sessionId);
    }
    if (filters.minHeight !== undefined) {
      pitches = pitches.filter(p => p.height >= filters.minHeight!);
    }
    if (filters.maxHeight !== undefined) {
      pitches = pitches.filter(p => p.height <= filters.maxHeight!);
    }
    if (filters.minQuality !== undefined) {
      pitches = pitches.filter(p => p.qualityScore >= filters.minQuality!);
    }

    pitches.sort((a, b) => b.timestamp - a.timestamp);

    if (filters.offset) pitches = pitches.slice(filters.offset);
    if (filters.limit) pitches = pitches.slice(0, filters.limit);

    return pitches;
  }

  async createPitch(data: Omit<Pitch, 'id' | 'createdAt'>): Promise<Pitch> {
    this.ensureInitialized();
    const pitch: Pitch = {
      ...data,
      id: 'pitch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.pitches.set(pitch.id, pitch);

    // Update session pitch count
    const session = this.sessions.get(data.sessionId);
    if (session) {
      session.pitchCount++;
      session.updatedAt = new Date().toISOString();
      this.sessions.set(session.id, session);
    }

    return pitch;
  }

  // Statistics
  async getSessionStatistics(sessionId: string): Promise<SessionSummary['statistics']> {
    const summary = await this.getSessionSummary(sessionId);
    return summary.statistics;
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummary> {
    this.ensureInitialized();
    const pitches = await this.getPitchesBySession(sessionId);

    if (pitches.length === 0) {
      return {
        sessionId,
        totalPitches: 0,
        statistics: {
          avgHeight: 0,
          stdDev: 0,
          minHeight: 0,
          maxHeight: 0,
          avgUncertainty: 0,
          avgQuality: 0,
        },
      };
    }

    const heights = pitches.map(p => p.height);
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
    const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
    const stdDev = Math.sqrt(variance);

    return {
      sessionId,
      totalPitches: pitches.length,
      statistics: {
        avgHeight: parseFloat(avgHeight.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        minHeight: parseFloat(Math.min(...heights).toFixed(2)),
        maxHeight: parseFloat(Math.max(...heights).toFixed(2)),
        avgUncertainty: parseFloat(
          (pitches.reduce((sum, p) => sum + p.uncertainty, 0) / pitches.length).toFixed(2)
        ),
        avgQuality: parseFloat(
          (pitches.reduce((sum, p) => sum + p.qualityScore, 0) / pitches.length).toFixed(2)
        ),
      },
    };
  }

  // CSV Export
  async exportSessionToCSV(sessionId: string): Promise<string> {
    this.ensureInitialized();
    const session = await this.getSessionById(sessionId);
    const pitches = await this.getPitchesBySession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    let csv = 'Pitch Number,Height (inches),Uncertainty (inches),Quality Score,Timestamp\n';

    pitches.forEach((pitch, index) => {
      csv += `${index + 1},${pitch.height.toFixed(2)},${pitch.uncertainty.toFixed(2)},${pitch.qualityScore.toFixed(1)},${new Date(pitch.timestamp).toISOString()}\n`;
    });

    return csv;
  }
}

const dbAdapter = new MockDatabaseAdapter();
export default dbAdapter;
