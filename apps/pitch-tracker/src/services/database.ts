import * as SQLite from 'expo-sqlite';
import { PitchData } from '../types';

// SQLite wrapper for pitch data storage in React Native
class PitchDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = 'pitchtracker.db';

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      
      // Create tables if they don't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS pitches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          height REAL NOT NULL,
          velocity REAL NOT NULL,
          x REAL NOT NULL,
          y REAL NOT NULL,
          savedAt TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          startTime TEXT NOT NULL,
          endTime TEXT,
          pitchCount INTEGER DEFAULT 0
        );
        
        CREATE INDEX IF NOT EXISTS idx_timestamp ON pitches(timestamp);
        CREATE INDEX IF NOT EXISTS idx_height ON pitches(height);
      `);
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  async savePitch(pitchData: PitchData): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.runAsync(
        'INSERT INTO pitches (timestamp, height, velocity, x, y, savedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          pitchData.timestamp,
          pitchData.height,
          pitchData.velocity,
          pitchData.x,
          pitchData.y,
          new Date().toISOString()
        ]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      throw new Error(`Failed to save pitch: ${error}`);
    }
  }

  async getAllPitches(): Promise<PitchData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync('SELECT * FROM pitches ORDER BY timestamp DESC');
      return result.map((row: any) => ({
        timestamp: row.timestamp,
        height: row.height,
        velocity: row.velocity,
        x: row.x,
        y: row.y
      }));
    } catch (error) {
      throw new Error(`Failed to get pitches: ${error}`);
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.execAsync(`
        DELETE FROM pitches;
        DELETE FROM sessions;
      `);
    } catch (error) {
      throw new Error(`Failed to clear data: ${error}`);
    }
  }

  async getStatistics(): Promise<{
    totalPitches: number;
    averageHeight: number;
    averageVelocity: number;
    heightRange: { min: number; max: number };
    velocityRange: { min: number; max: number };
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getFirstAsync(`
        SELECT 
          COUNT(*) as totalPitches,
          AVG(height) as averageHeight,
          AVG(velocity) as averageVelocity,
          MIN(height) as minHeight,
          MAX(height) as maxHeight,
          MIN(velocity) as minVelocity,
          MAX(velocity) as maxVelocity
        FROM pitches
      `) as any;
      
      if (!result || result.totalPitches === 0) {
        return {
          totalPitches: 0,
          averageHeight: 0,
          averageVelocity: 0,
          heightRange: { min: 0, max: 0 },
          velocityRange: { min: 0, max: 0 }
        };
      }

      return {
        totalPitches: result.totalPitches,
        averageHeight: result.averageHeight || 0,
        averageVelocity: result.averageVelocity || 0,
        heightRange: {
          min: result.minHeight || 0,
          max: result.maxHeight || 0
        },
        velocityRange: {
          min: result.minVelocity || 0,
          max: result.maxVelocity || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error}`);
    }
  }
}

export const pitchDB = new PitchDatabase();