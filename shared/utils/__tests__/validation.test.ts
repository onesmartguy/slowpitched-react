/**
 * Unit tests for validation utilities
 */
import {
  isValidHeight,
  isValidUncertainty,
  isValidQualityScore,
  isValidROI,
  isValidPixelPosition,
  sanitizeString,
  isValidTimestamp,
  isValidConfidence,
  isValidSessionName,
  isValidHeightArray,
  hasValidSampleSize,
  isValidUUID,
  isValidCalibrationData,
} from '../src/validation';

describe('Validation Utilities', () => {
  describe('isValidHeight', () => {
    it('should validate positive heights in range', () => {
      expect(isValidHeight(5.5)).toBe(true);
      expect(isValidHeight(6)).toBe(true);
      expect(isValidHeight(1)).toBe(true);
    });

    it('should reject invalid heights', () => {
      expect(isValidHeight(-5)).toBe(false);
      expect(isValidHeight(0)).toBe(false);
    });

    it('should reject heights outside valid range', () => {
      expect(isValidHeight(100)).toBe(false); // Too high (>12)
      expect(isValidHeight(13)).toBe(false); // Too high
    });
  });

  describe('isValidUncertainty', () => {
    it('should validate positive uncertainty', () => {
      expect(isValidUncertainty(0.1)).toBe(true);
      expect(isValidUncertainty(1.5)).toBe(true);
    });

    it('should reject invalid uncertainty', () => {
      expect(isValidUncertainty(-0.5)).toBe(false);
      expect(isValidUncertainty(0)).toBe(false);
      expect(isValidUncertainty(NaN)).toBe(false);
    });
  });

  describe('isValidQualityScore', () => {
    it('should validate scores between 0-100', () => {
      expect(isValidQualityScore(0)).toBe(true);
      expect(isValidQualityScore(50)).toBe(true);
      expect(isValidQualityScore(100)).toBe(true);
    });

    it('should reject invalid scores', () => {
      expect(isValidQualityScore(-1)).toBe(false);
      expect(isValidQualityScore(101)).toBe(false);
      expect(isValidQualityScore(NaN)).toBe(false);
    });
  });

  describe('isValidROI', () => {
    it('should validate valid ROI', () => {
      expect(isValidROI(0, 0, 100, 100)).toBe(true);
      expect(isValidROI(100, 100, 500, 500)).toBe(true);
    });

    it('should reject invalid ROI', () => {
      expect(isValidROI(-1, 0, 100, 100)).toBe(false);
      expect(isValidROI(0, 0, 0, 100)).toBe(false);
      expect(isValidROI(0, 0, 100, -1)).toBe(false);
    });

    it('should reject ROI outside frame bounds', () => {
      expect(isValidROI(0, 0, 2000, 100)).toBe(false); // Too wide
      expect(isValidROI(0, 0, 100, 2200)).toBe(false); // Too tall
    });
  });

  describe('isValidPixelPosition', () => {
    it('should validate positive pixel positions', () => {
      expect(isValidPixelPosition(0, 0, 100, 100)).toBe(true);
      expect(isValidPixelPosition(50, 75, 100, 100)).toBe(true);
    });

    it('should reject out of bounds positions', () => {
      expect(isValidPixelPosition(-1, 0, 100, 100)).toBe(false);
      expect(isValidPixelPosition(100, 0, 100, 100)).toBe(false);
      expect(isValidPixelPosition(0, -1, 100, 100)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should clean whitespace from input strings', () => {
      const result = sanitizeString('  hello world  ');
      expect(result).toMatch(/hello world/);
    });

    it('should escape special characters', () => {
      const result = sanitizeString('"quoted"');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(300);
      const result = sanitizeString(longString);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should escape quotes with backslash', () => {
      const result = sanitizeString('John "The Ace" Doe');
      expect(result).toBe('John \\"The Ace\\" Doe');
    });

    it('should escape backslashes', () => {
      const result = sanitizeString('Path\\to\\file');
      expect(result).toBe('Path\\\\to\\\\file');
    });

    it('should escape single quotes', () => {
      const result = sanitizeString("O'Brien");
      expect(result).toBe("O\\'Brien");
    });
  });

  describe('isValidTimestamp', () => {
    it('should validate current timestamp', () => {
      const now = Date.now();
      expect(isValidTimestamp(now)).toBe(true);
    });

    it('should validate recent past timestamps', () => {
      const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      expect(isValidTimestamp(oneMonthAgo)).toBe(true);
    });

    it('should validate near future timestamps', () => {
      const oneMonthFuture = Date.now() + 30 * 24 * 60 * 60 * 1000;
      expect(isValidTimestamp(oneMonthFuture)).toBe(true);
    });

    it('should reject timestamps too far in past', () => {
      const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
      expect(isValidTimestamp(twoYearsAgo)).toBe(false);
    });

    it('should reject timestamps too far in future', () => {
      const twoYearsFuture = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
      expect(isValidTimestamp(twoYearsFuture)).toBe(false);
    });
  });

  describe('isValidConfidence', () => {
    it('should validate confidence values 0-1', () => {
      expect(isValidConfidence(0)).toBe(true);
      expect(isValidConfidence(0.5)).toBe(true);
      expect(isValidConfidence(1)).toBe(true);
    });

    it('should reject confidence below 0', () => {
      expect(isValidConfidence(-0.1)).toBe(false);
    });

    it('should reject confidence above 1', () => {
      expect(isValidConfidence(1.1)).toBe(false);
    });
  });

  describe('isValidSessionName', () => {
    it('should validate normal session names', () => {
      expect(isValidSessionName('Morning Practice')).toBe(true);
      expect(isValidSessionName('Session 1')).toBe(true);
    });

    it('should validate single character name', () => {
      expect(isValidSessionName('A')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidSessionName('')).toBe(false);
    });

    it('should reject names longer than 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(isValidSessionName(longName)).toBe(false);
    });

    it('should accept name with exactly 255 characters', () => {
      const maxName = 'a'.repeat(255);
      expect(isValidSessionName(maxName)).toBe(true);
    });
  });

  describe('isValidHeightArray', () => {
    it('should validate array of valid heights', () => {
      expect(isValidHeightArray([5.5, 6.0, 5.8])).toBe(true);
    });

    it('should reject empty array', () => {
      expect(isValidHeightArray([])).toBe(false);
    });

    it('should reject array with invalid heights', () => {
      expect(isValidHeightArray([5.5, -1, 6.0])).toBe(false);
      expect(isValidHeightArray([5.5, 15, 6.0])).toBe(false);
    });

    it('should reject non-array input', () => {
      expect(isValidHeightArray(5.5 as any)).toBe(false);
    });
  });

  describe('hasValidSampleSize', () => {
    it('should validate array with default minimum size (3)', () => {
      expect(hasValidSampleSize([1, 2, 3])).toBe(true);
      expect(hasValidSampleSize([1, 2, 3, 4])).toBe(true);
    });

    it('should reject array below default minimum size', () => {
      expect(hasValidSampleSize([1, 2])).toBe(false);
      expect(hasValidSampleSize([1])).toBe(false);
      expect(hasValidSampleSize([])).toBe(false);
    });

    it('should validate with custom minimum size', () => {
      expect(hasValidSampleSize([1, 2], 2)).toBe(true);
      expect(hasValidSampleSize([1], 1)).toBe(true);
    });

    it('should reject below custom minimum size', () => {
      expect(hasValidSampleSize([1, 2], 3)).toBe(false);
    });

    it('should reject non-array input', () => {
      expect(hasValidSampleSize(null as any)).toBe(false);
      expect(hasValidSampleSize(5 as any)).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate proper UUID v4', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false); // Too short
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false); // Too long
    });

    it('should reject UUID with invalid version', () => {
      // Version should be 4
      expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false);
    });

    it('should reject UUID with invalid variant', () => {
      // Variant bits should be 8, 9, a, or b
      expect(isValidUUID('550e8400-e29b-41d4-0716-446655440000')).toBe(false);
    });

    it('should handle lowercase and uppercase', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });
  });

  describe('isValidCalibrationData', () => {
    it('should validate proper calibration data', () => {
      expect(isValidCalibrationData(6.0, 150)).toBe(true);
      expect(isValidCalibrationData(5.5, 100.5)).toBe(true);
    });

    it('should reject invalid reference height', () => {
      expect(isValidCalibrationData(-1, 150)).toBe(false);
      expect(isValidCalibrationData(0, 150)).toBe(false);
      expect(isValidCalibrationData(15, 150)).toBe(false);
    });

    it('should reject invalid pixel height', () => {
      expect(isValidCalibrationData(6.0, 0)).toBe(false);
      expect(isValidCalibrationData(6.0, -10)).toBe(false);
    });
  });
});
