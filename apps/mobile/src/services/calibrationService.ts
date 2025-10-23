import type { CalibrationData } from '@/types';

/**
 * Calibration service for managing pitch height calibration
 * Handles reference height input and uncertainty calculations
 */
export class CalibrationService {
  private static instance: CalibrationService;
  private calibrationData: CalibrationData | null = null;
  private calibrationMeasurements: number[] = [];

  private constructor() {}

  static getInstance(): CalibrationService {
    if (!CalibrationService.instance) {
      CalibrationService.instance = new CalibrationService();
    }
    return CalibrationService.instance;
  }

  /**
   * Start a new calibration session
   * Resets any previous calibration data
   */
  startCalibration(_referenceHeight: number): void {
    this.calibrationMeasurements = [];
    this.calibrationData = null;
  }

  /**
   * Add a calibration measurement
   * @param pixelHeight - Measured height in pixels
   */
  addMeasurement(pixelHeight: number): void {
    this.calibrationMeasurements.push(pixelHeight);
  }

  /**
   * Finalize calibration with reference height
   * Calculates calibration factor and uncertainty
   *
   * @param referenceHeight - Known height in feet
   * @returns Calibration data with uncertainty
   */
  finalizeCalibration(referenceHeight: number): CalibrationData {
    if (this.calibrationMeasurements.length === 0) {
      throw new Error('No calibration measurements available');
    }

    // Calculate average pixel height
    const avgPixelHeight =
      this.calibrationMeasurements.reduce((sum, h) => sum + h, 0) /
      this.calibrationMeasurements.length;

    // Calculate calibration factor (feet per pixel)
    const pixelsPerFoot = avgPixelHeight / referenceHeight;

    // Calculate uncertainty from measurement variance
    const variance = this.calculateVariance(this.calibrationMeasurements);
    const stdDev = Math.sqrt(variance);

    // Uncertainty increases with fewer measurements
    const measurementCount = this.calibrationMeasurements.length;
    const uncertaintyFactor = Math.max(1, 5 / measurementCount);

    // Base uncertainty from standard deviation (minimum 0.1 feet for single measurement)
    const baseUncertainty = stdDev > 0
      ? (stdDev / avgPixelHeight) * referenceHeight
      : 0.1; // Minimum uncertainty for single measurement

    // Total uncertainty with factors
    const totalUncertainty = baseUncertainty * uncertaintyFactor;

    this.calibrationData = {
      referenceHeight,
      pixelHeight: avgPixelHeight,
      pixelsPerFoot,
      uncertainty: totalUncertainty,
      timestamp: Date.now(),
      measurementCount,
    };

    return this.calibrationData;
  }

  /**
   * Get current calibration data
   */
  getCalibration(): CalibrationData | null {
    return this.calibrationData;
  }

  /**
   * Check if calibration is valid and recent
   * @param maxAge - Maximum age in milliseconds (default: 1 hour)
   */
  isCalibrationValid(maxAge: number = 3600000): boolean {
    if (!this.calibrationData) return false;

    const age = Date.now() - this.calibrationData.timestamp;
    return age < maxAge;
  }

  /**
   * Get calibration quality score (0-100)
   * Based on uncertainty and measurement count
   */
  getQualityScore(): number {
    if (!this.calibrationData) return 0;

    const { uncertainty, measurementCount } = this.calibrationData;

    // Lower uncertainty = higher quality
    // More measurements = higher quality
    const uncertaintyScore = Math.max(0, 100 - uncertainty * 100);
    const measurementScore = Math.min(100, measurementCount * 20);

    return Math.round((uncertaintyScore * 0.7 + measurementScore * 0.3));
  }

  /**
   * Convert pixel height to feet using calibration
   */
  pixelsToFeet(pixels: number): number {
    if (!this.calibrationData) {
      throw new Error('No calibration data available');
    }

    return pixels / this.calibrationData.pixelsPerFoot;
  }

  /**
   * Clear calibration data
   */
  reset(): void {
    this.calibrationData = null;
    this.calibrationMeasurements = [];
  }

  /**
   * Calculate variance of measurements
   */
  private calculateVariance(measurements: number[]): number {
    if (measurements.length === 0) return 0;

    const mean = measurements.reduce((sum, m) => sum + m, 0) / measurements.length;
    const squaredDiffs = measurements.map((m) => Math.pow(m - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / measurements.length;
  }
}

export const calibrationService = CalibrationService.getInstance();
