/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';

/**
 * Camera service for VisionCamera configuration and device management
 */
export class CameraService {
  private static instance: CameraService;

  private constructor() {}

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Get the best available camera device (prefer back camera with wide angle)
   */
  async getBestDevice(): Promise<CameraDevice | null> {
    try {
      const devices = await Camera.getAvailableCameraDevices();

      // Prefer back camera
      // Note: VisionCamera v3 doesn't have devices array, check formats instead
      const backWide = devices.find((d) => d.position === 'back');
      if (backWide) return backWide;

      // Fallback to any back camera
      const backCamera = devices.find((d) => d.position === 'back');
      if (backCamera) return backCamera;

      // Last resort: any camera
      return devices[0] || null;
    } catch (error) {
      console.error('Error getting camera device:', error);
      return null;
    }
  }

  /**
   * Get recommended frame processor FPS based on device capabilities
   */
  getRecommendedFPS(device: CameraDevice | null): number {
    if (!device) return 30;

    // Check if device supports 60fps
    const supports60fps = device.formats.some((f) => f.maxFps >= 60);

    // Target 30fps for stability, 60fps if supported and needed
    return supports60fps ? 30 : 30;
  }

  /**
   * Get the best format for the camera device
   * Prioritizes resolution and frame rate
   */
  getBestFormat(device: CameraDevice): any {
    const formats = device.formats;

    // Sort by resolution (descending) and fps (descending)
    const sortedFormats = formats.sort((a, b) => {
      const aPixels = a.videoWidth * a.videoHeight;
      const bPixels = b.videoWidth * b.videoHeight;

      if (aPixels !== bPixels) {
        return bPixels - aPixels; // Higher resolution first
      }

      return b.maxFps - a.maxFps; // Higher FPS first
    });

    // Return format with good resolution (1080p or higher) and 30+ fps
    return sortedFormats.find((f) => f.videoHeight >= 1080 && f.maxFps >= 30) || sortedFormats[0];
  }
}

export const cameraService = CameraService.getInstance();
