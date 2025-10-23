/**
 * Uncertainty Calculation Utilities
 * Statistical methods for calculating and propagating measurement uncertainty
 */

/**
 * Calculate standard error from multiple measurements
 */
export function calculateStandardError(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  const standardDeviation = Math.sqrt(variance);

  return standardDeviation / Math.sqrt(values.length);
}

/**
 * Calculate confidence interval for a given confidence level
 * @param mean - Mean value
 * @param standardError - Standard error of measurements
 * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns Confidence interval as [lower, upper]
 */
export function calculateConfidenceInterval(
  mean: number,
  standardError: number,
  confidenceLevel: number = 0.95
): [number, number] {
  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96; // Default to 95%
  const margin = z * standardError;

  return [mean - margin, mean + margin];
}

/**
 * Propagate uncertainty through multiplication/division
 * Used when converting pixels to feet using calibration factor
 */
export function propagateUncertaintyMultiplication(
  value1: number,
  uncertainty1: number,
  value2: number,
  uncertainty2: number
): number {
  // Relative uncertainties
  const relativeUncertainty1 = uncertainty1 / value1;
  const relativeUncertainty2 = uncertainty2 / value2;

  // Combined relative uncertainty (root sum of squares)
  const combinedRelativeUncertainty = Math.sqrt(
    Math.pow(relativeUncertainty1, 2) + Math.pow(relativeUncertainty2, 2)
  );

  // Absolute uncertainty
  return Math.abs(value1 * value2) * combinedRelativeUncertainty;
}

/**
 * Propagate uncertainty through addition/subtraction
 */
export function propagateUncertaintyAddition(uncertainty1: number, uncertainty2: number): number {
  // Root sum of squares
  return Math.sqrt(Math.pow(uncertainty1, 2) + Math.pow(uncertainty2, 2));
}

/**
 * Calculate calibration uncertainty from multiple measurements
 */
export function calculateCalibrationUncertainty(
  pixelMeasurements: number[],
  referenceHeight: number
): number {
  if (pixelMeasurements.length < 2) return 0.1; // Default uncertainty

  const standardError = calculateStandardError(pixelMeasurements);
  const meanPixels =
    pixelMeasurements.reduce((sum, val) => sum + val, 0) / pixelMeasurements.length;

  // Convert pixel uncertainty to feet uncertainty
  const pixelsPerFoot = meanPixels / referenceHeight;
  const heightUncertainty = standardError / pixelsPerFoot;

  return heightUncertainty;
}

/**
 * Calculate pitch height uncertainty combining calibration and measurement errors
 */
export function calculatePitchUncertainty(
  calibrationUncertainty: number,
  measurementNoise: number,
  qualityScore: number
): number {
  // Base uncertainty from calibration and measurement
  const baseUncertainty = propagateUncertaintyAddition(calibrationUncertainty, measurementNoise);

  // Adjust based on quality score (0-100)
  // Lower quality = higher uncertainty
  const qualityFactor = 1 + (100 - qualityScore) / 100;

  return baseUncertainty * qualityFactor;
}

/**
 * Estimate measurement noise based on pixel detection confidence
 */
export function estimateMeasurementNoise(
  pixelsPerFoot: number,
  detectionConfidence: number
): number {
  // Assume ±1 pixel base noise
  const baseNoisePixels = 1.0;

  // Adjust based on detection confidence (0-100)
  const confidenceFactor = 1 + (100 - detectionConfidence) / 50;

  const noisePixels = baseNoisePixels * confidenceFactor;
  return noisePixels / pixelsPerFoot; // Convert to feet
}

/**
 * Calculate quality score from uncertainty
 * Lower uncertainty = higher quality
 */
export function uncertaintyToQualityScore(
  uncertainty: number,
  maxUncertainty: number = 1.0
): number {
  const normalizedUncertainty = Math.min(uncertainty / maxUncertainty, 1.0);
  return Math.round((1 - normalizedUncertainty) * 100);
}

/**
 * Bayesian update of uncertainty with new measurement
 */
export function bayesianUncertaintyUpdate(
  priorMean: number,
  priorUncertainty: number,
  newMeasurement: number,
  measurementUncertainty: number
): { mean: number; uncertainty: number } {
  // Precision (inverse of variance)
  const priorPrecision = 1 / Math.pow(priorUncertainty, 2);
  const measurementPrecision = 1 / Math.pow(measurementUncertainty, 2);

  // Posterior precision
  const posteriorPrecision = priorPrecision + measurementPrecision;

  // Posterior mean
  const posteriorMean =
    (priorPrecision * priorMean + measurementPrecision * newMeasurement) / posteriorPrecision;

  // Posterior uncertainty
  const posteriorUncertainty = 1 / Math.sqrt(posteriorPrecision);

  return {
    mean: posteriorMean,
    uncertainty: posteriorUncertainty,
  };
}

/**
 * Calculate weighted average with uncertainties
 */
export function weightedAverageWithUncertainty(
  values: number[],
  uncertainties: number[]
): { mean: number; uncertainty: number } {
  if (values.length !== uncertainties.length || values.length === 0) {
    throw new Error('Values and uncertainties arrays must have same non-zero length');
  }

  // Weights are inverse of variance
  const weights = uncertainties.map((u) => 1 / Math.pow(u, 2));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted mean
  const mean = values.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;

  // Combined uncertainty
  const uncertainty = 1 / Math.sqrt(totalWeight);

  return { mean, uncertainty };
}
