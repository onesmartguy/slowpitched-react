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
    height: number;
    uncertainty: number;
    timestamp: number;
    qualityScore: number;
    ballPosition: {
        x: number;
        y: number;
    };
    calibrationId?: string;
    metadata?: {
        pitchType?: string;
        ballType?: string;
        notes?: string;
    };
    createdAt?: number;
}
/**
 * Database row representation of Pitch
 */
export interface PitchRow {
    id: string;
    session_id: string;
    height: number;
    uncertainty: number;
    timestamp: string;
    quality_score: number;
    pixel_position_x: number;
    pixel_position_y: number;
    calibration_id: string | null;
    metadata: string | null;
    created_at: string;
}
/**
 * Represents a session (collection of pitches)
 */
export interface Session {
    id: string;
    name: string;
    date: string;
    pitcherName?: string;
    location?: string;
    notes?: string;
    createdAt: number;
    updatedAt: number;
    pitchCount?: number;
}
/**
 * Database row representation of Session
 */
export interface SessionRow {
    id: string;
    name: string;
    date: string;
    pitcher_name: string | null;
    location: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
/**
 * Calibration data for height tracking
 */
export interface CalibrationData {
    id?: string;
    referenceHeight: number;
    pixelHeight?: number;
    pixelsPerFoot: number;
    qualityScore: number;
    uncertainty: number;
    roi: ROI;
    timestamp?: number;
    measurementCount?: number;
    createdAt?: number;
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
    created_at: string;
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
    data: Uint8Array;
    timestamp: number;
}
/**
 * Ball detection result from frame processing
 */
export interface BallDetectionResult {
    detected: boolean;
    x: number;
    y: number;
    confidence: number;
    pixelCount: number;
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
 * Quality distribution for pitches
 */
export interface QualityDistribution {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
}
/**
 * Complete session summary with statistics and distributions
 */
export interface SessionSummary {
    statistics: SessionStatistics;
    avgUncertainty: number;
    qualityDistribution: QualityDistribution;
    pitchFrequency: number;
}
/**
 * Navigation route parameters
 */
export type RootStackParamList = {
    TrackingScreen: undefined;
    DashboardScreen: undefined;
    SessionDetailScreen: {
        sessionId: string;
    };
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
//# sourceMappingURL=index.d.ts.map