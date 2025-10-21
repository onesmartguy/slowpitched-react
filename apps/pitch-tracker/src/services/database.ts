import * as SQLite from 'expo-sqlite';
import { PitchData } from '../types';

// SQLite wrapper for pitch data storage in React Native (using legacy API)
class PitchDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = 'pitchtracker.db';

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.db = SQLite.openDatabase(this.dbName);
        
        // Create tables if they don't exist
        this.db.transaction(
          (tx) => {
            tx.executeSql(`
              CREATE TABLE IF NOT EXISTS pitches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                height REAL NOT NULL,
                velocity REAL NOT NULL,
                x REAL NOT NULL,
                y REAL NOT NULL,
                savedAt TEXT NOT NULL
              );
            `);
            
            tx.executeSql(`
              CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                startTime TEXT NOT NULL,
                endTime TEXT,
                pitchCount INTEGER DEFAULT 0
              );
            `);
            
            tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_timestamp ON pitches(timestamp);`);
            tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_height ON pitches(height);`);
          },
          (error) => reject(new Error(`Failed to initialize database: ${error}`)),
          () => resolve()
        );
      } catch (error) {
        reject(new Error(`Failed to initialize database: ${error}`));
      }
    });
  }

  async savePitch(pitchData: PitchData): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO pitches (timestamp, height, velocity, x, y, savedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
              pitchData.timestamp,
              pitchData.height,
              pitchData.velocity,
              pitchData.x,
              pitchData.y,
              new Date().toISOString()
            ],
            (_, result) => resolve(result.insertId || 0),
            (_, error) => {
              reject(new Error(`Failed to save pitch: ${error}`));
              return true;
            }
          );
        },
        (error) => reject(new Error(`Transaction failed: ${error}`))
      );
    });
  }

  async getAllPitches(): Promise<PitchData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM pitches ORDER BY timestamp DESC',
            [],
            (_, result) => {
              const pitches: PitchData[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                pitches.push({
                  timestamp: row.timestamp,
                  height: row.height,
                  velocity: row.velocity,
                  x: row.x,
                  y: row.y
                });
              }
              resolve(pitches);
            },
            (_, error) => {
              reject(new Error(`Failed to get pitches: ${error}`));
              return true;
            }
          );
        },
        (error) => reject(new Error(`Transaction failed: ${error}`))
      );
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql('DELETE FROM pitches');
          tx.executeSql('DELETE FROM sessions');
        },
        (error) => reject(new Error(`Failed to clear data: ${error}`)),
        () => resolve()
      );
    });
  }

  async getStatistics(): Promise<{
    totalPitches: number;
    averageHeight: number;
    averageVelocity: number;
    heightRange: { min: number; max: number };
    velocityRange: { min: number; max: number };
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT 
              COUNT(*) as totalPitches,
              AVG(height) as averageHeight,
              AVG(velocity) as averageVelocity,
              MIN(height) as minHeight,
              MAX(height) as maxHeight,
              MIN(velocity) as minVelocity,
              MAX(velocity) as maxVelocity
            FROM pitches`,
            [],
            (_, result) => {
              if (result.rows.length === 0) {
                resolve({
                  totalPitches: 0,
                  averageHeight: 0,
                  averageVelocity: 0,
                  heightRange: { min: 0, max: 0 },
                  velocityRange: { min: 0, max: 0 }
                });
                return;
              }

              const row = result.rows.item(0);
              resolve({
                totalPitches: row.totalPitches || 0,
                averageHeight: row.averageHeight || 0,
                averageVelocity: row.averageVelocity || 0,
                heightRange: {
                  min: row.minHeight || 0,
                  max: row.maxHeight || 0
                },
                velocityRange: {
                  min: row.minVelocity || 0,
                  max: row.maxVelocity || 0
                }
              });
            },
            (_, error) => {
              reject(new Error(`Failed to get statistics: ${error}`));
              return true;
            }
          );
        },
        (error) => reject(new Error(`Transaction failed: ${error}`))
      );
    });
  }
}

export const pitchDB = new PitchDatabase();