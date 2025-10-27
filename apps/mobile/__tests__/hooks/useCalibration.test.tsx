/**
 * Tests for useCalibration hook
 * Phase 7.1: Testing Strategy - React Hooks
 */

import { renderHook, act } from '@testing-library/react-hooks/native';
import { useCalibration } from '../../src/hooks/useCalibration';

// Mock the calibration service
jest.mock('../../src/services/calibrationService', () => ({
  calibrationService: {
    getCalibration: jest.fn(),
    getQualityScore: jest.fn(),
    startCalibration: jest.fn(),
    addMeasurement: jest.fn(),
    finalizeCalibration: jest.fn(),
    reset: jest.fn(),
    isCalibrationValid: jest.fn(),
    pixelsToFeet: jest.fn(),
  },
}));

// Import after mock
import { calibrationService } from '../../src/services/calibrationService';

describe('useCalibration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (calibrationService.getCalibration as jest.Mock).mockReturnValue(null);
    (calibrationService.getQualityScore as jest.Mock).mockReturnValue(0);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCalibration());

      expect(result.current.state).toEqual({
        calibrationData: null,
        qualityScore: 0,
        isCalibrating: false,
        measurementCount: 0,
      });
    });

    it('should load existing calibration data on mount', () => {
      const mockCalibration = {
        pixelsPerFoot: 100,
        referenceHeight: 6,
        timestamp: Date.now(),
        uncertainty: 0.05,
      };

      (calibrationService.getCalibration as jest.Mock).mockReturnValue(mockCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValue(0.95);

      const { result } = renderHook(() => useCalibration());

      expect(result.current.state.calibrationData).toEqual(mockCalibration);
      expect(result.current.state.qualityScore).toBe(0.95);
    });
  });

  describe('startCalibration', () => {
    it('should start calibration with reference height', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startCalibration(6.0);
      });

      expect(calibrationService.startCalibration).toHaveBeenCalledWith(6.0);
      expect(result.current.state.isCalibrating).toBe(true);
      expect(result.current.state.measurementCount).toBe(0);
    });

    it('should reset measurement count when starting calibration', () => {
      const { result } = renderHook(() => useCalibration());

      // Start and add measurements
      act(() => {
        result.current.startCalibration(6.0);
        result.current.addMeasurement(500);
        result.current.addMeasurement(510);
      });

      expect(result.current.state.measurementCount).toBe(2);

      // Start again
      act(() => {
        result.current.startCalibration(6.0);
      });

      expect(result.current.state.measurementCount).toBe(0);
    });
  });

  describe('addMeasurement', () => {
    it('should add measurement and increment count', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startCalibration(6.0);
      });

      act(() => {
        result.current.addMeasurement(500);
      });

      expect(calibrationService.addMeasurement).toHaveBeenCalledWith(500);
      expect(result.current.state.measurementCount).toBe(1);
    });

    it('should handle multiple measurements', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startCalibration(6.0);
        result.current.addMeasurement(500);
        result.current.addMeasurement(510);
        result.current.addMeasurement(495);
      });

      expect(result.current.state.measurementCount).toBe(3);
      expect(calibrationService.addMeasurement).toHaveBeenCalledTimes(3);
    });
  });

  describe('finalizeCalibration', () => {
    it('should finalize calibration and update state', () => {
      const mockCalibration = {
        pixelsPerFoot: 100,
        referenceHeight: 6,
        timestamp: Date.now(),
        uncertainty: 0.05,
      };

      (calibrationService.finalizeCalibration as jest.Mock).mockReturnValue(mockCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValue(0.92);

      const { result } = renderHook(() => useCalibration());

      let returnedCalibration;
      act(() => {
        result.current.startCalibration(6.0);
        returnedCalibration = result.current.finalizeCalibration(6.0);
      });

      expect(calibrationService.finalizeCalibration).toHaveBeenCalledWith(6.0);
      expect(result.current.state.calibrationData).toEqual(mockCalibration);
      expect(result.current.state.qualityScore).toBe(0.92);
      expect(result.current.state.isCalibrating).toBe(false);
      expect(result.current.state.measurementCount).toBe(0);
      expect(returnedCalibration).toEqual(mockCalibration);
    });

    it('should handle finalization errors', () => {
      const error = new Error('Insufficient measurements');
      (calibrationService.finalizeCalibration as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startCalibration(6.0);
      });

      expect(() => {
        act(() => {
          result.current.finalizeCalibration(6.0);
        });
      }).toThrow('Insufficient measurements');

      expect(result.current.state.isCalibrating).toBe(false);
    });

    it('should handle finalization with previous calibration data', () => {
      const oldCalibration = {
        pixelsPerFoot: 90,
        referenceHeight: 6,
        timestamp: Date.now() - 10000,
        uncertainty: 0.08,
      };

      const newCalibration = {
        pixelsPerFoot: 100,
        referenceHeight: 6,
        timestamp: Date.now(),
        uncertainty: 0.05,
      };

      (calibrationService.getCalibration as jest.Mock).mockReturnValue(oldCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValueOnce(0.85);
      (calibrationService.finalizeCalibration as jest.Mock).mockReturnValue(newCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValueOnce(0.92);

      const { result } = renderHook(() => useCalibration());

      expect(result.current.state.calibrationData).toEqual(oldCalibration);

      act(() => {
        result.current.startCalibration(6.0);
        result.current.finalizeCalibration(6.0);
      });

      expect(result.current.state.calibrationData).toEqual(newCalibration);
      expect(result.current.state.qualityScore).toBe(0.92);
    });
  });

  describe('resetCalibration', () => {
    it('should reset calibration to initial state', () => {
      const mockCalibration = {
        pixelsPerFoot: 100,
        referenceHeight: 6,
        timestamp: Date.now(),
        uncertainty: 0.05,
      };

      (calibrationService.getCalibration as jest.Mock).mockReturnValue(mockCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValue(0.92);

      const { result } = renderHook(() => useCalibration());

      expect(result.current.state.calibrationData).toEqual(mockCalibration);

      act(() => {
        result.current.resetCalibration();
      });

      expect(calibrationService.reset).toHaveBeenCalled();
      expect(result.current.state).toEqual({
        calibrationData: null,
        qualityScore: 0,
        isCalibrating: false,
        measurementCount: 0,
      });
    });

    it('should reset while calibrating', () => {
      const { result } = renderHook(() => useCalibration());

      act(() => {
        result.current.startCalibration(6.0);
        result.current.addMeasurement(500);
      });

      expect(result.current.state.isCalibrating).toBe(true);
      expect(result.current.state.measurementCount).toBe(1);

      act(() => {
        result.current.resetCalibration();
      });

      expect(result.current.state.isCalibrating).toBe(false);
      expect(result.current.state.measurementCount).toBe(0);
    });
  });

  describe('isValid', () => {
    it('should check calibration validity without max age', () => {
      (calibrationService.isCalibrationValid as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useCalibration());

      const isValid = result.current.isValid();

      expect(calibrationService.isCalibrationValid).toHaveBeenCalledWith(undefined);
      expect(isValid).toBe(true);
    });

    it('should check calibration validity with max age', () => {
      (calibrationService.isCalibrationValid as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useCalibration());

      const isValid = result.current.isValid(300000); // 5 minutes

      expect(calibrationService.isCalibrationValid).toHaveBeenCalledWith(300000);
      expect(isValid).toBe(false);
    });
  });

  describe('pixelsToFeet', () => {
    it('should convert pixels to feet', () => {
      (calibrationService.pixelsToFeet as jest.Mock).mockReturnValue(5.5);

      const { result } = renderHook(() => useCalibration());

      const feet = result.current.pixelsToFeet(550);

      expect(calibrationService.pixelsToFeet).toHaveBeenCalledWith(550);
      expect(feet).toBe(5.5);
    });

    it('should handle zero pixels', () => {
      (calibrationService.pixelsToFeet as jest.Mock).mockReturnValue(0);

      const { result } = renderHook(() => useCalibration());

      const feet = result.current.pixelsToFeet(0);

      expect(feet).toBe(0);
    });

    it('should handle negative pixels', () => {
      (calibrationService.pixelsToFeet as jest.Mock).mockReturnValue(-2.5);

      const { result } = renderHook(() => useCalibration());

      const feet = result.current.pixelsToFeet(-250);

      expect(feet).toBe(-2.5);
    });
  });

  describe('hook stability', () => {
    it('should maintain stable references for callbacks', () => {
      const { result, rerender } = renderHook(() => useCalibration());

      const initialCallbacks = {
        startCalibration: result.current.startCalibration,
        addMeasurement: result.current.addMeasurement,
        finalizeCalibration: result.current.finalizeCalibration,
        resetCalibration: result.current.resetCalibration,
        isValid: result.current.isValid,
        pixelsToFeet: result.current.pixelsToFeet,
      };

      rerender();

      expect(result.current.startCalibration).toBe(initialCallbacks.startCalibration);
      expect(result.current.addMeasurement).toBe(initialCallbacks.addMeasurement);
      expect(result.current.finalizeCalibration).toBe(initialCallbacks.finalizeCalibration);
      expect(result.current.resetCalibration).toBe(initialCallbacks.resetCalibration);
      expect(result.current.isValid).toBe(initialCallbacks.isValid);
      expect(result.current.pixelsToFeet).toBe(initialCallbacks.pixelsToFeet);
    });
  });

  describe('complete calibration workflow', () => {
    it('should handle full calibration lifecycle', () => {
      const mockCalibration = {
        pixelsPerFoot: 100,
        referenceHeight: 6,
        timestamp: Date.now(),
        uncertainty: 0.05,
      };

      (calibrationService.finalizeCalibration as jest.Mock).mockReturnValue(mockCalibration);
      (calibrationService.getQualityScore as jest.Mock).mockReturnValue(0.92);

      const { result } = renderHook(() => useCalibration());

      // Initial state
      expect(result.current.state.isCalibrating).toBe(false);
      expect(result.current.state.measurementCount).toBe(0);

      // Start calibration
      act(() => {
        result.current.startCalibration(6.0);
      });

      expect(result.current.state.isCalibrating).toBe(true);

      // Add measurements
      act(() => {
        result.current.addMeasurement(500);
        result.current.addMeasurement(510);
        result.current.addMeasurement(495);
      });

      expect(result.current.state.measurementCount).toBe(3);

      // Finalize
      act(() => {
        result.current.finalizeCalibration(6.0);
      });

      expect(result.current.state.isCalibrating).toBe(false);
      expect(result.current.state.calibrationData).toEqual(mockCalibration);
      expect(result.current.state.qualityScore).toBe(0.92);
      expect(result.current.state.measurementCount).toBe(0);
    });
  });
});
