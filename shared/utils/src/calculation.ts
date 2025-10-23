/**
 * Mathematical calculations for pitch height tracking
 * Phase 1: Utility function signatures (implementations in Phase 3)
 */

/**
 * Calculate pitch height from pixel measurements
 * Accounts for calibration and perspective
 *
 * @param pixelHeight - Height in pixels
 * @param calibrationFactor - Factor derived from calibration
 * @returns Height in feet
 */
export function calculatePitchHeight(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pixelHeight: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calibrationFactor: number
): number {
  // TODO: Implement pixel-to-feet conversion
  // This will use calibration data to map pixel distances to real-world heights
  return 0;
}

/**
 * Calculate uncertainty for a measurement
 * Combines calibration, detection, and tracking uncertainties
 *
 * @param calibrationUncertainty - Uncertainty from calibration
 * @param detectionConfidence - Confidence of ball detection (0-1)
 * @param trackingQuality - Quality of tracking (0-1)
 * @returns Uncertainty value in feet
 */
export function calculateUncertainty(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calibrationUncertainty: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  detectionConfidence: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackingQuality: number
): number {
  // TODO: Implement weighted uncertainty calculation
  // This will combine multiple uncertainty sources
  return 0;
}

/**
 * Calculate statistics for a set of pitch heights
 * @param heights - Array of pitch heights in feet
 * @returns Statistics object
 */
export interface PitchStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
}

export function calculateStatistics(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  heights: number[]
): PitchStatistics {
  // TODO: Implement statistical calculations
  // This will compute mean, standard deviation, etc.
  return {
    min: 0,
    max: 0,
    mean: 0,
    median: 0,
    stdDev: 0,
    variance: 0,
  };
}

/**
 * Calculate confidence interval for measurements
 * @param mean - Mean height
 * @param stdDev - Standard deviation
 * @param confidence - Confidence level (0.95 for 95%)
 * @returns Confidence interval bounds
 */
export function calculateConfidenceInterval(
  mean: number,
  stdDev: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  confidence: number = 0.95
): { lower: number; upper: number } {
  // TODO: Implement confidence interval calculation
  // This will use t-distribution or z-score
  return { lower: 0, upper: 0 };
}

/**
 * Convert pixel distance to world distance using calibration
 * @param pixelDistance - Distance in pixels
 * @param pixelsPerFoot - Calibration factor (pixels per foot)
 * @returns Distance in feet
 */
export function pixelsToFeet(pixelDistance: number, pixelsPerFoot: number): number {
  return pixelDistance / pixelsPerFoot;
}

/**
 * Convert world distance to pixel distance
 * @param feetDistance - Distance in feet
 * @param pixelsPerFoot - Calibration factor
 * @returns Distance in pixels
 */
export function feetToPixels(feetDistance: number, pixelsPerFoot: number): number {
  return feetDistance * pixelsPerFoot;
}

/**
 * Interpolate position between frames
 * Useful for smooth motion tracking
 *
 * @param pos1 - Previous position
 * @param pos2 - Current position
 * @param alpha - Interpolation factor (0-1)
 * @returns Interpolated position
 */
export function interpolatePosition(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  alpha: number
): { x: number; y: number } {
  return {
    x: pos1.x + (pos2.x - pos1.x) * alpha,
    y: pos1.y + (pos2.y - pos1.y) * alpha,
  };
}
