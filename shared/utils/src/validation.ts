/**
 * Validation utilities for Pitch Height Tracker Pro
 * Ensures data integrity across the application
 */

/**
 * Validate pitch height value
 * @param height - Height in feet
 * @returns true if valid, false otherwise
 */
export function isValidHeight(height: number): boolean {
  // Baseball/softball pitches typically range from 0 to 8 feet
  // Allow some margin for outliers
  return height > 0 && height < 12;
}

/**
 * Validate uncertainty value
 * @param uncertainty - Uncertainty in feet
 * @returns true if valid, false otherwise
 */
export function isValidUncertainty(uncertainty: number): boolean {
  // Uncertainty should be positive and reasonably small
  // Typical range: 0.1 to 2 feet
  return uncertainty > 0 && uncertainty < 5;
}

/**
 * Validate quality score
 * @param score - Score from 0-100
 * @returns true if valid, false otherwise
 */
export function isValidQualityScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

/**
 * Validate timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @returns true if valid, false otherwise
 */
export function isValidTimestamp(timestamp: number): boolean {
  // Check if timestamp is reasonable (not too far in past or future)
  const now = Date.now();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  return timestamp > now - oneYearMs && timestamp < now + oneYearMs;
}

/**
 * Validate ROI coordinates
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns true if valid, false otherwise
 */
export function isValidROI(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 1920 && y + height <= 2160;
}

/**
 * Validate ball detection confidence
 * @param confidence - Confidence from 0-1
 * @returns true if valid, false otherwise
 */
export function isValidConfidence(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}

/**
 * Validate pixel position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param frameWidth - Frame width in pixels
 * @param frameHeight - Frame height in pixels
 * @returns true if valid, false otherwise
 */
export function isValidPixelPosition(
  x: number,
  y: number,
  frameWidth: number,
  frameHeight: number
): boolean {
  return x >= 0 && x < frameWidth && y >= 0 && y < frameHeight;
}

/**
 * Validate session metadata
 * @param name - Session name
 * @returns true if valid, false otherwise
 */
export function isValidSessionName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 255;
}

/**
 * Validate collection of pitch heights for statistics
 * @param heights - Array of heights
 * @returns true if valid, false otherwise
 */
export function isValidHeightArray(heights: number[]): boolean {
  if (!Array.isArray(heights) || heights.length === 0) {
    return false;
  }
  return heights.every(isValidHeight);
}

/**
 * Check if array has valid sample size for statistics
 * @param array - Array to check
 * @param minSize - Minimum required size
 * @returns true if valid size, false otherwise
 */
export function hasValidSampleSize(array: unknown[], minSize: number = 3): boolean {
  return Array.isArray(array) && array.length >= minSize;
}

/**
 * Validate UUID v4 format
 * @param uuid - UUID string
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string for database storage
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  return str.replace(/['"\\]/g, (char) => '\\' + char).trim();
}

/**
 * Validate calibration data
 * @param referenceHeight - Reference height in feet
 * @param pixelHeight - Pixel height measurement
 * @returns true if valid, false otherwise
 */
export function isValidCalibrationData(referenceHeight: number, pixelHeight: number): boolean {
  return isValidHeight(referenceHeight) && pixelHeight > 0;
}
