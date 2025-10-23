import { useState, useCallback } from 'react';
import { calibrationService } from '@/services/calibrationService';
import type { CalibrationData } from '@/types';

export interface CalibrationState {
  calibrationData: CalibrationData | null;
  qualityScore: number;
  isCalibrating: boolean;
  measurementCount: number;
}

/**
 * Hook for managing calibration state and operations
 */
export function useCalibration() {
  const [state, setState] = useState<CalibrationState>({
    calibrationData: calibrationService.getCalibration(),
    qualityScore: calibrationService.getQualityScore(),
    isCalibrating: false,
    measurementCount: 0,
  });

  /**
   * Start calibration process
   */
  const startCalibration = useCallback((referenceHeight: number) => {
    calibrationService.startCalibration(referenceHeight);
    setState((prev) => ({
      ...prev,
      isCalibrating: true,
      measurementCount: 0,
    }));
  }, []);

  /**
   * Add a calibration measurement
   */
  const addMeasurement = useCallback((pixelHeight: number) => {
    calibrationService.addMeasurement(pixelHeight);
    setState((prev) => ({
      ...prev,
      measurementCount: prev.measurementCount + 1,
    }));
  }, []);

  /**
   * Finalize calibration
   */
  const finalizeCalibration = useCallback((referenceHeight: number) => {
    try {
      const newCalibration = calibrationService.finalizeCalibration(referenceHeight);
      const newQualityScore = calibrationService.getQualityScore();

      setState({
        calibrationData: newCalibration,
        qualityScore: newQualityScore,
        isCalibrating: false,
        measurementCount: 0,
      });

      return newCalibration;
    } catch (error) {
      console.error('Calibration finalization error:', error);
      setState((prev) => ({
        ...prev,
        isCalibrating: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Reset calibration
   */
  const resetCalibration = useCallback(() => {
    calibrationService.reset();
    setState({
      calibrationData: null,
      qualityScore: 0,
      isCalibrating: false,
      measurementCount: 0,
    });
  }, []);

  /**
   * Check if calibration is valid
   */
  const isValid = useCallback((maxAge?: number): boolean => {
    return calibrationService.isCalibrationValid(maxAge);
  }, []);

  /**
   * Convert pixels to feet using current calibration
   */
  const pixelsToFeet = useCallback((pixels: number): number => {
    return calibrationService.pixelsToFeet(pixels);
  }, []);

  return {
    state,
    startCalibration,
    addMeasurement,
    finalizeCalibration,
    resetCalibration,
    isValid,
    pixelsToFeet,
  };
}
