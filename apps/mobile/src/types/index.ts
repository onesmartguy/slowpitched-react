/**
 * Core type definitions for Pitch Height Tracker Pro
 * Phase 1: Type scaffolding for subsequent phases
 */

/**
 * Represents a single pitch measurement
 */
export interface Pitch {
  id: string;
  sessionId: string;
  height: number; // Height in feet
  uncertainty: number; // Measurement uncertainty (±value)
  timestamp: number; // Unix timestamp in milliseconds
  qualityScore: number; // 0-100 tracking quality
  ballPosition: {
    x: number; // Pixel x coordinate
    y: number; // Pixel y coordinate
  };
  calibrationId?: string; // Reference to calibration used
  metadata?: {
    pitchType?: string;
    ballType?: string;
    notes?: string;
  };
  createdAt?: number; // Database timestamp
}

/**
 * Database row representation of Pitch
 */
export interface PitchRow {
  id: string;
  session_id: string;
  height: number;
  uncertainty: number;
  timestamp: string; // ISO string in DB
  quality_score: number;
  pixel_position_x: number;
  pixel_position_y: number;
  calibration_id: string | null;
  metadata: string | null; // JSON string in DB
  created_at: string; // ISO string in DB
}

/**
 * Represents a session (collection of pitches)
 */
export interface Session {
  id: string;
  name: string;
  date: string; // ISO date string
  pitcherName?: string;
  location?: string;
  notes?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  pitchCount?: number; // Computed field
}

/**
 * Database row representation of Session
 */
export interface SessionRow {
  id: string;
  name: string;
  date: string; // ISO string in DB
  pitcher_name: string | null;
  location: string | null;
  notes: string | null;
  created_at: string; // ISO string in DB
  updated_at: string; // ISO string in DB
}

/**
 * Calibration data for height tracking
 */
export interface CalibrationData {
  id?: string; // Database ID
  referenceHeight: number; // Known reference height in feet
  pixelHeight?: number; // Pixel height at reference
  pixelsPerFoot: number; // Calibration factor (pixels per foot)
  qualityScore: number; // 0-100 calibration quality
  uncertainty: number; // Calibration uncertainty
  roi: ROI; // Region of interest used
  timestamp?: number; // Unix timestamp
  measurementCount?: number; // Number of measurements used for calibration
  createdAt?: number; // Database timestamp
}

/**
 * Database row representation of Calibration
 */
export interface CalibrationRow {
  id: string;
  reference_height: number;
  pixels_per_foot: number;
  quality_score: number;
  uncertainty: number;
  roi_x: number;
  roi_y: number;
  roi_width: number;
  roi_height: number;
  created_at: string; // ISO string in DB
}

/**
 * ROI (Region of Interest) definition
 */
export interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Camera frame data for processing
 */
export interface FrameData {
  width: number;
  height: number;
  data: Uint8Array; // YUV pixel data
  timestamp: number;
}

/**
 * Ball detection result from frame processing
 */
export interface BallDetectionResult {
  detected: boolean;
  x: number; // X coordinate in pixels
  y: number; // Y coordinate in pixels
  confidence: number; // 0-100 percentage
  pixelCount: number; // Number of pixels matching yellow criteria
}

/**
 * Statistics for a session
 */
export interface SessionStatistics {
  minHeight: number;
  maxHeight: number;
  avgHeight: number;
  stdDev: number;
  variance: number;
  medianHeight: number;
  percentile25: number;
  percentile75: number;
  totalPitches: number;
}

/**
 * Navigation route parameters
 */
export type RootStackParamList = {
  TrackingScreen: undefined;
  DashboardScreen: undefined;
  SessionDetailScreen: { sessionId: string };
  SettingsScreen: undefined;
};

/**
 * App configuration
 */
export interface AppConfig {
  yellowHueMin: number;
  yellowHueMax: number;
  yellowSaturationMin: number;
  yellowValueMin: number;
  calibrationReferenceHeight: number;
  minConfidenceThreshold: number;
}
