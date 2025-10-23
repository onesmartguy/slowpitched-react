import { YELLOW_DETECTION } from '@shared/constants';
import type { BallDetectionResult } from '@/types';

/**
 * YUV Color Space utilities for yellow ball detection
 * YUV is preferred over RGB for better color consistency under varying lighting
 */
export class ColorDetectionService {
  private static instance: ColorDetectionService;

  private constructor() {}

  static getInstance(): ColorDetectionService {
    if (!ColorDetectionService.instance) {
      ColorDetectionService.instance = new ColorDetectionService();
    }
    return ColorDetectionService.instance;
  }

  /**
   * Convert RGB to YUV color space
   * Y = luminance (brightness)
   * U = blue-difference chroma
   * V = red-difference chroma
   */
  rgbToYUV(r: number, g: number, b: number): { y: number; u: number; v: number } {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = -0.147 * r - 0.289 * g + 0.436 * b;
    const v = 0.615 * r - 0.515 * g - 0.100 * b;

    return { y, u, v };
  }

  /**
   * Check if a YUV pixel matches yellow ball criteria
   * Uses threshold ranges from constants
   */
  isYellowBall(y: number, u: number, v: number): boolean {
    const { Y_MIN, Y_MAX, U_MIN, U_MAX, V_MIN, V_MAX } = YELLOW_DETECTION;

    return (
      y >= Y_MIN && y <= Y_MAX &&
      u >= U_MIN && u <= U_MAX &&
      v >= V_MIN && v <= V_MAX
    );
  }

  /**
   * Detect yellow ball in image data (simplified for now)
   * In production, this would process actual camera frame data
   *
   * @param imageData - Raw pixel data from camera frame
   * @param width - Image width in pixels
   * @param height - Image height in pixels
   * @param roiX - Region of interest X offset
   * @param roiY - Region of interest Y offset
   * @param roiWidth - Region of interest width
   * @param roiHeight - Region of interest height
   * @returns Detection result with position and confidence
   */
  detectBall(
    imageData: Uint8Array,
    width: number,
    height: number,
    roiX: number = 0,
    roiY: number = 0,
    roiWidth: number = width,
    roiHeight: number = height
  ): BallDetectionResult {
    let yellowPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let maxConfidence = 0;

    // Process pixels within ROI
    const startX = Math.max(0, roiX);
    const startY = Math.max(0, roiY);
    const endX = Math.min(width, roiX + roiWidth);
    const endY = Math.min(height, roiY + roiHeight);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = (y * width + x) * 4; // RGBA format
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];

        const yuv = this.rgbToYUV(r, g, b);

        if (this.isYellowBall(yuv.y, yuv.u, yuv.v)) {
          yellowPixelCount++;
          sumX += x;
          sumY += y;

          // Calculate confidence based on how well it matches ideal yellow
          const confidence = this.calculatePixelConfidence(yuv.y, yuv.u, yuv.v);
          maxConfidence = Math.max(maxConfidence, confidence);
        }
      }
    }

    // Calculate centroid if enough yellow pixels detected
    const minPixelThreshold = YELLOW_DETECTION.MIN_PIXEL_THRESHOLD;

    if (yellowPixelCount >= minPixelThreshold) {
      const centerX = sumX / yellowPixelCount;
      const centerY = sumY / yellowPixelCount;

      // Overall confidence based on pixel count and max confidence
      const pixelRatio = Math.min(yellowPixelCount / (minPixelThreshold * 10), 1);
      const overallConfidence = (pixelRatio * 0.5 + maxConfidence * 0.5) * 100;

      return {
        detected: true,
        x: centerX,
        y: centerY,
        confidence: Math.round(overallConfidence),
        pixelCount: yellowPixelCount,
      };
    }

    return {
      detected: false,
      x: 0,
      y: 0,
      confidence: 0,
      pixelCount: 0,
    };
  }

  /**
   * Calculate confidence score for a single pixel (0-1 scale)
   * Based on how close YUV values are to ideal yellow
   */
  private calculatePixelConfidence(y: number, u: number, v: number): number {
    const { Y_MIN, Y_MAX, U_MIN, U_MAX, V_MIN, V_MAX } = YELLOW_DETECTION;

    // Calculate distance from ideal center
    const yCenter = (Y_MIN + Y_MAX) / 2;
    const uCenter = (U_MIN + U_MAX) / 2;
    const vCenter = (V_MIN + V_MAX) / 2;

    const yDist = Math.abs(y - yCenter) / ((Y_MAX - Y_MIN) / 2);
    const uDist = Math.abs(u - uCenter) / ((U_MAX - U_MIN) / 2);
    const vDist = Math.abs(v - vCenter) / ((V_MAX - V_MIN) / 2);

    // Average distance (0 = perfect match, 1 = at threshold edge)
    const avgDist = (yDist + uDist + vDist) / 3;

    // Convert to confidence (1 - distance)
    return Math.max(0, 1 - avgDist);
  }

  /**
   * Apply morphological operations to reduce noise (future enhancement)
   * This would use erosion/dilation to clean up detection
   */
  applyMorphology(imageData: Uint8Array, _width: number, _height: number): Uint8Array {
    // TODO: Implement morphological operations for noise reduction
    // For now, return original data
    return imageData;
  }
}

export const colorDetectionService = ColorDetectionService.getInstance();
