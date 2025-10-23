import { colorDetectionService } from '../src/services/colorDetectionService';
import { YELLOW_DETECTION } from '@shared/constants';

describe('ColorDetectionService', () => {
  describe('rgbToYUV', () => {
    it('should convert pure yellow RGB to YUV', () => {
      const yuv = colorDetectionService.rgbToYUV(255, 255, 0);
      expect(yuv.y).toBeCloseTo(225.9, 1);
      expect(yuv.u).toBeCloseTo(-111.18, 1);
      expect(yuv.v).toBeCloseTo(25.5, 1); // Fixed expected value
    });

    it('should convert white RGB to YUV', () => {
      const yuv = colorDetectionService.rgbToYUV(255, 255, 255);
      expect(yuv.y).toBeCloseTo(255, 1);
      expect(yuv.u).toBeCloseTo(0, 1);
      expect(yuv.v).toBeCloseTo(0, 1);
    });

    it('should convert black RGB to YUV', () => {
      const yuv = colorDetectionService.rgbToYUV(0, 0, 0);
      expect(yuv.y).toBe(0);
      expect(yuv.u).toBe(0);
      expect(yuv.v).toBe(0);
    });
  });

  describe('isYellowBall', () => {
    it('should detect yellow color within threshold', () => {
      // Yellow values within threshold
      const y = (YELLOW_DETECTION.Y_MIN + YELLOW_DETECTION.Y_MAX) / 2;
      const u = (YELLOW_DETECTION.U_MIN + YELLOW_DETECTION.U_MAX) / 2;
      const v = (YELLOW_DETECTION.V_MIN + YELLOW_DETECTION.V_MAX) / 2;

      expect(colorDetectionService.isYellowBall(y, u, v)).toBe(true);
    });

    it('should reject color outside Y threshold', () => {
      const y = YELLOW_DETECTION.Y_MIN - 10;
      const u = (YELLOW_DETECTION.U_MIN + YELLOW_DETECTION.U_MAX) / 2;
      const v = (YELLOW_DETECTION.V_MIN + YELLOW_DETECTION.V_MAX) / 2;

      expect(colorDetectionService.isYellowBall(y, u, v)).toBe(false);
    });

    it('should reject color outside U threshold', () => {
      const y = (YELLOW_DETECTION.Y_MIN + YELLOW_DETECTION.Y_MAX) / 2;
      const u = YELLOW_DETECTION.U_MIN - 10;
      const v = (YELLOW_DETECTION.V_MIN + YELLOW_DETECTION.V_MAX) / 2;

      expect(colorDetectionService.isYellowBall(y, u, v)).toBe(false);
    });

    it('should reject color outside V threshold', () => {
      const y = (YELLOW_DETECTION.Y_MIN + YELLOW_DETECTION.Y_MAX) / 2;
      const u = (YELLOW_DETECTION.U_MIN + YELLOW_DETECTION.U_MAX) / 2;
      const v = YELLOW_DETECTION.V_MAX + 10;

      expect(colorDetectionService.isYellowBall(y, u, v)).toBe(false);
    });
  });

  describe('detectBall', () => {
    it('should return not detected for empty image data', () => {
      const imageData = new Uint8Array(100 * 100 * 4);
      const result = colorDetectionService.detectBall(imageData, 100, 100);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.pixelCount).toBe(0);
    });

    it('should detect ball with sufficient yellow pixels', () => {
      // Create image with yellow pixels
      const width = 100;
      const height = 100;
      const imageData = new Uint8Array(width * height * 4);

      // Fill center area with yellow (RGB: 255, 255, 0)
      for (let y = 40; y < 60; y++) {
        for (let x = 40; x < 60; x++) {
          const index = (y * width + x) * 4;
          imageData[index] = 255; // R
          imageData[index + 1] = 255; // G
          imageData[index + 2] = 0; // B
          imageData[index + 3] = 255; // A
        }
      }

      const result = colorDetectionService.detectBall(imageData, width, height);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.pixelCount).toBeGreaterThan(YELLOW_DETECTION.MIN_PIXEL_THRESHOLD);
    });

    it('should respect ROI boundaries', () => {
      const width = 100;
      const height = 100;
      const imageData = new Uint8Array(width * height * 4);

      // Fill area outside ROI with yellow
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          const index = (y * width + x) * 4;
          imageData[index] = 255;
          imageData[index + 1] = 255;
          imageData[index + 2] = 0;
          imageData[index + 3] = 255;
        }
      }

      // ROI that doesn't include the yellow area
      const result = colorDetectionService.detectBall(
        imageData,
        width,
        height,
        50, // roiX
        50, // roiY
        40, // roiWidth
        40  // roiHeight
      );

      expect(result.detected).toBe(false);
    });
  });
});
