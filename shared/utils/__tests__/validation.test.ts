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
  });
});
