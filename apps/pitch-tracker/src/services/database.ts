import { PitchData } from '../types'

// Simple IndexedDB wrapper for pitch data storage
class PitchDatabase {
  private dbName = 'PitchTrackerDB'
  private version = 1
  private db: IDBDatabase | null = null

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create pitch data store
        if (!db.objectStoreNames.contains('pitches')) {
          const store = db.createObjectStore('pitches', { keyPath: 'id', autoIncrement: true })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('height', 'height', { unique: false })
        }
        
        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true })
          sessionsStore.createIndex('startTime', 'startTime', { unique: false })
        }
      }
    })
  }

  async savePitch(pitchData: PitchData): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pitches'], 'readwrite')
      const store = transaction.objectStore('pitches')
      const request = store.add({ ...pitchData, savedAt: new Date().toISOString() })
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result as number)
    })
  }

  async getAllPitches(): Promise<PitchData[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pitches'], 'readonly')
      const store = transaction.objectStore('pitches')
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getStatistics(): Promise<{
    totalPitches: number
    averageHeight: number
    averageVelocity: number
    heightRange: { min: number; max: number }
    velocityRange: { min: number; max: number }
  }> {
    const pitches = await this.getAllPitches()
    
    if (pitches.length === 0) {
      return {
        totalPitches: 0,
        averageHeight: 0,
        averageVelocity: 0,
        heightRange: { min: 0, max: 0 },
        velocityRange: { min: 0, max: 0 }
      }
    }

    const heights = pitches.map(p => p.height)
    const velocities = pitches.map(p => p.velocity)
    
    return {
      totalPitches: pitches.length,
      averageHeight: heights.reduce((sum, h) => sum + h, 0) / heights.length,
      averageVelocity: velocities.reduce((sum, v) => sum + v, 0) / velocities.length,
      heightRange: {
        min: Math.min(...heights),
        max: Math.max(...heights)
      },
      velocityRange: {
        min: Math.min(...velocities),
        max: Math.max(...velocities)
      }
    }
  }
}

export const pitchDB = new PitchDatabase()