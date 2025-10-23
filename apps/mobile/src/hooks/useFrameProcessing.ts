import { useRef, useCallback } from 'react';
import type { Frame } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { colorDetectionService } from '@/services/colorDetectionService';
import type { BallDetectionResult, ROI } from '@/types';

export interface FrameProcessingOptions {
  roi?: ROI;
  onDetection?: (result: BallDetectionResult) => void;
  processingRate?: number; // Process every N frames (default: 1)
}

/**
 * Hook for processing camera frames with YUV color detection
 * Optimized for performance with frame skipping
 */
export function useFrameProcessing(options: FrameProcessingOptions) {
  const { roi, onDetection, processingRate = 1 } = options;
  const frameCountRef = useRef(0);
  const lastProcessTimeRef = useRef(0);

  /**
   * Frame processor callback
   * Called for each camera frame - must be optimized for performance
   */
  const processFrame = useCallback(
    (frame: Frame) => {
      'worklet';

      // Frame skipping for performance
      frameCountRef.current++;
      if (frameCountRef.current % processingRate !== 0) {
        return;
      }

      // Throttle to maintain target FPS
      const now = Date.now();
      if (now - lastProcessTimeRef.current < 33) {
        // ~30 FPS max
        return;
      }
      lastProcessTimeRef.current = now;

      try {
        // Get frame data (this is a simplified placeholder)
        // In production, this would extract actual pixel data from the frame
        const width = frame.width;
        const height = frame.height;

        // Create mock image data for now
        // TODO: Replace with actual frame data extraction
        const mockImageData = new Uint8Array(width * height * 4);

        // Determine ROI bounds
        const roiX = roi?.x ?? 0;
        const roiY = roi?.y ?? 0;
        const roiWidth = roi?.width ?? width;
        const roiHeight = roi?.height ?? height;

        // Detect ball in frame
        const detection = colorDetectionService.detectBall(
          mockImageData,
          width,
          height,
          roiX,
          roiY,
          roiWidth,
          roiHeight
        );

        // Call detection callback on JS thread
        if (onDetection) {
          runOnJS(onDetection)(detection);
        }
      } catch (error) {
        console.error('Frame processing error:', error);
      }
    },
    [roi, onDetection, processingRate]
  );

  return {
    processFrame,
  };
}
