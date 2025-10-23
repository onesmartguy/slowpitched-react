import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';
import ROIComponent from '@/components/ROIComponent';
import CalibrationMeter from '@/components/CalibrationMeter';
import BallDetectionIndicator from '@/components/BallDetectionIndicator';
import CoachOverlay from '@/components/CoachOverlay';
import { calibrationService } from '@/services/calibrationService';
import type { ROI, BallDetectionResult } from '@/types';

/**
 * Main Tracking Screen
 * Displays camera feed with ROI, calibration, and tracking overlays
 */
export default function TrackingScreen() {
  const { hasPermission, requestPermission } = useCameraPermissions();
  const device = useCameraDevice('back');

  const [_roi, setROI] = useState<ROI | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [referenceHeight, setReferenceHeight] = useState('4.0');
  const [calibrationData, setCalibrationData] = useState(calibrationService.getCalibration());
  const [qualityScore, setQualityScore] = useState(0);
  const [detection, _setDetection] = useState<BallDetectionResult>({
    detected: false,
    x: 0,
    y: 0,
    confidence: 0,
    pixelCount: 0,
  });
  const [coachMessage, setCoachMessage] = useState('');
  const [coachType, setCoachType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    // Update quality score when calibration changes
    if (calibrationData) {
      setQualityScore(calibrationService.getQualityScore());
    }
  }, [calibrationData]);

  const handleStartCalibration = () => {
    const refHeight = parseFloat(referenceHeight);
    if (isNaN(refHeight) || refHeight <= 0) {
      Alert.alert('Invalid Height', 'Please enter a valid reference height');
      return;
    }

    setIsCalibrating(true);
    calibrationService.startCalibration(refHeight);
    showCoachMessage('Point camera at reference object and hold steady', 'info');

    // Simulate calibration measurements (in production, this would come from actual frames)
    // For now, we'll just finalize after a delay
    setTimeout(() => {
      // Add some mock measurements
      const mockPixelHeight = 200 + Math.random() * 20;
      for (let i = 0; i < 5; i++) {
        calibrationService.addMeasurement(mockPixelHeight + (Math.random() - 0.5) * 10);
      }

      const newCalibration = calibrationService.finalizeCalibration(refHeight);
      setCalibrationData(newCalibration);
      setIsCalibrating(false);
      showCoachMessage('Calibration complete!', 'success');
    }, 3000);
  };

  const handleResetCalibration = () => {
    calibrationService.reset();
    setCalibrationData(null);
    setQualityScore(0);
    showCoachMessage('Calibration reset', 'info');
  };

  const showCoachMessage = (message: string, type: 'info' | 'warning' | 'success' | 'error') => {
    setCoachMessage(message);
    setCoachType(type);
    setShowCoach(true);
    setTimeout(() => setShowCoach(false), 3000);
  };

  const handleROIChange = (newROI: ROI) => {
    setROI(newROI);
  };

  // Show permission request screen
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading if device not ready
  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Feed */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={false}
        video={false}
      />

      {/* ROI Overlay */}
      <ROIComponent onROIChange={handleROIChange} />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <CalibrationMeter calibrationData={calibrationData} qualityScore={qualityScore} />
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <BallDetectionIndicator detection={detection} />

        {/* Calibration Controls */}
        <View style={styles.calibrationControls}>
          <TextInput
            style={styles.input}
            value={referenceHeight}
            onChangeText={setReferenceHeight}
            keyboardType="decimal-pad"
            placeholder="Reference height (ft)"
            placeholderTextColor="#666"
          />

          <TouchableOpacity
            style={[styles.button, isCalibrating && styles.buttonDisabled]}
            onPress={handleStartCalibration}
            disabled={isCalibrating}
          >
            <Text style={styles.buttonText}>
              {isCalibrating ? 'Calibrating...' : 'Calibrate'}
            </Text>
          </TouchableOpacity>

          {calibrationData && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleResetCalibration}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Coach Overlay */}
      <CoachOverlay message={coachMessage} type={coachType} show={showCoach} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomControls: {
    bottom: 40,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSecondary: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calibrationControls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  topControls: {
    left: 16,
    position: 'absolute',
    right: 16,
    top: 60,
  },
});
