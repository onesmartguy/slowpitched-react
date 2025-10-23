import type { BallDetectionResult, ROI } from '@/types';
import { calibrationService } from './calibrationService';

export interface TrackingResult {
  height: number;
  uncertainty: number;
  confidence: number;
  timestamp: number;
  qualityScore: number;
}

/**
 * Tracking Pipeline Service
 * Orchestrates the complete tracking workflow from detection to measurement
 */
export class TrackingPipeline {
  private static instance: TrackingPipeline;
  private isTracking = false;
  private trackingResults: TrackingResult[] = [];

  private constructor() {}

  static getInstance(): TrackingPipeline {
    if (!TrackingPipeline.instance) {
      TrackingPipeline.instance = new TrackingPipeline();
    }
    return TrackingPipeline.instance;
  }

  /**
   * Start tracking session
   */
  startTracking(): void {
    this.isTracking = true;
    this.trackingResults = [];
  }

  /**
   * Stop tracking session
   */
  stopTracking(): void {
    this.isTracking = false;
  }

  /**
   * Check if currently tracking
   */
  isActivelyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Process a detection result and calculate pitch height
   *
   * @param detection - Ball detection result from color detection service
   * @param roi - Region of interest
   * @returns Tracking result with height and uncertainty
   */
  processDetection(detection: BallDetectionResult, _roi?: ROI): TrackingResult | null {
    if (!this.isTracking) {
      return null;
    }

    // Require valid detection
    if (!detection.detected || detection.confidence < 50) {
      return null;
    }

    // Require valid calibration
    const calibration = calibrationService.getCalibration();
    if (!calibration || !calibrationService.isCalibrationValid()) {
      throw new Error('Valid calibration required for tracking');
    }

    // Calculate height in pixels (Y coordinate)
    const pixelHeight = detection.y;

    // Convert to feet using calibration
    const heightInFeet = calibrationService.pixelsToFeet(pixelHeight);

    // Calculate total uncertainty
    const totalUncertainty = this.calculateTotalUncertainty(
      calibration,
      detection.confidence,
      pixelHeight
    );

    // Calculate quality score (0-100)
    const qualityScore = this.calculateQualityScore(detection, calibration);

    const result: TrackingResult = {
      height: heightInFeet,
      uncertainty: totalUncertainty,
      confidence: detection.confidence,
      timestamp: Date.now(),
      qualityScore,
    };

    this.trackingResults.push(result);
    return result;
  }

  /**
   * Calculate total uncertainty from multiple sources
   *
   * @param calibration - Calibration data
   * @param detectionConfidence - Detection confidence (0-100)
   * @param pixelHeight - Measured height in pixels
   */
  private calculateTotalUncertainty(
    calibration: any,
    detectionConfidence: number,
    _pixelHeight: number
  ): number {
    // Calibration uncertainty
    const calibrationUncertainty = calibration.uncertainty;

    // Detection uncertainty (lower confidence = higher uncertainty)
    const detectionUncertainty = ((100 - detectionConfidence) / 100) * 0.5;

    // Tracking uncertainty (small random factor)
    const trackingUncertainty = 0.1;

    // Combine uncertainties using root sum of squares
    const totalUncertainty = Math.sqrt(
      Math.pow(calibrationUncertainty, 2) +
        Math.pow(detectionUncertainty, 2) +
        Math.pow(trackingUncertainty, 2)
    );

    return totalUncertainty;
  }

  /**
   * Calculate quality score for a tracking result
   *
   * @param detection - Ball detection result
   * @param calibration - Calibration data
   * @returns Quality score (0-100)
   */
  private calculateQualityScore(
    detection: BallDetectionResult,
    _calibration: any
  ): number {
    // Detection confidence (40% weight)
    const detectionScore = detection.confidence * 0.4;

    // Calibration quality (40% weight)
    const calibrationScore = calibrationService.getQualityScore() * 0.4;

    // Pixel count factor (20% weight)
    const pixelScore = Math.min(100, (detection.pixelCount / 200) * 100) * 0.2;

    return Math.round(detectionScore + calibrationScore + pixelScore);
  }

  /**
   * Get all tracking results from current session
   */
  getResults(): TrackingResult[] {
    return [...this.trackingResults];
  }

  /**
   * Get average height from current session
   */
  getAverageHeight(): number | null {
    if (this.trackingResults.length === 0) return null;

    const sum = this.trackingResults.reduce((acc, r) => acc + r.height, 0);
    return sum / this.trackingResults.length;
  }

  /**
   * Get statistics for current session
   */
  getStatistics(): {
    count: number;
    average: number | null;
    min: number | null;
    max: number | null;
    avgUncertainty: number | null;
  } {
    if (this.trackingResults.length === 0) {
      return {
        count: 0,
        average: null,
        min: null,
        max: null,
        avgUncertainty: null,
      };
    }

    const heights = this.trackingResults.map((r) => r.height);
    const uncertainties = this.trackingResults.map((r) => r.uncertainty);

    return {
      count: this.trackingResults.length,
      average: heights.reduce((a, b) => a + b, 0) / heights.length,
      min: Math.min(...heights),
      max: Math.max(...heights),
      avgUncertainty: uncertainties.reduce((a, b) => a + b, 0) / uncertainties.length,
    };
  }

  /**
   * Clear tracking results
   */
  clearResults(): void {
    this.trackingResults = [];
  }

  /**
   * Reset the entire pipeline
   */
  reset(): void {
    this.isTracking = false;
    this.trackingResults = [];
  }
}

export const trackingPipeline = TrackingPipeline.getInstance();
