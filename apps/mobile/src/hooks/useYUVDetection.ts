import { useState, useCallback } from 'react';
import { colorDetectionService } from '@/services/colorDetectionService';
import type { BallDetectionResult } from '@/types';

export interface YUVDetectionState {
  currentDetection: BallDetectionResult;
  detectionHistory: BallDetectionResult[];
  averageConfidence: number;
  detectionsPerSecond: number;
}

/**
 * Hook for managing YUV color detection state and statistics
 */
export function useYUVDetection() {
  const [state, setState] = useState<YUVDetectionState>({
    currentDetection: {
      detected: false,
      x: 0,
      y: 0,
      confidence: 0,
      pixelCount: 0,
    },
    detectionHistory: [],
    averageConfidence: 0,
    detectionsPerSecond: 0,
  });

  /**
   * Update detection state with new result
   */
  const updateDetection = useCallback((detection: BallDetectionResult) => {
    setState((prev) => {
      // Keep last 30 detections (1 second at 30 FPS)
      const newHistory = [...prev.detectionHistory, detection].slice(-30);

      // Calculate statistics
      const detectedFrames = newHistory.filter((d) => d.detected);
      const avgConfidence =
        detectedFrames.length > 0
          ? detectedFrames.reduce((sum, d) => sum + d.confidence, 0) / detectedFrames.length
          : 0;

      const detectionsPerSecond = detectedFrames.length;

      return {
        currentDetection: detection,
        detectionHistory: newHistory,
        averageConfidence: Math.round(avgConfidence),
        detectionsPerSecond,
      };
    });
  }, []);

  /**
   * Reset detection state
   */
  const reset = useCallback(() => {
    setState({
      currentDetection: {
        detected: false,
        x: 0,
        y: 0,
        confidence: 0,
        pixelCount: 0,
      },
      detectionHistory: [],
      averageConfidence: 0,
      detectionsPerSecond: 0,
    });
  }, []);

  /**
   * Check if YUV color is yellow (utility function)
   */
  const isYellow = useCallback((y: number, u: number, v: number): boolean => {
    return colorDetectionService.isYellowBall(y, u, v);
  }, []);

  /**
   * Convert RGB to YUV (utility function)
   */
  const rgbToYUV = useCallback((r: number, g: number, b: number) => {
    return colorDetectionService.rgbToYUV(r, g, b);
  }, []);

  return {
    state,
    updateDetection,
    reset,
    isYellow,
    rgbToYUV,
  };
}
