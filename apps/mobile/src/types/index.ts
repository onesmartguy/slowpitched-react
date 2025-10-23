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
  metadata?: {
    pitchType?: string;
    ballType?: string;
    notes?: string;
  };
}

/**
 * Represents a session (collection of pitches)
 */
export interface Session {
  id: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  name: string;
  pitchCount: number;
  metadata?: {
    location?: string;
    pitcher?: string;
    conditions?: string;
  };
}

/**
 * Calibration data for height tracking
 */
export interface CalibrationData {
  referenceHeight: number; // Known reference height in feet
  pixelHeight: number; // Pixel height at reference
  pixelsPerFoot: number; // Calibration factor (pixels per foot)
  uncertainty: number; // Calibration uncertainty
  timestamp: number;
  measurementCount: number; // Number of measurements used for calibration
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
