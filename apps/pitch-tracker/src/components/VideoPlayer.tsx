import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { Camera } from 'expo-camera';
import DraggableROI from './DraggableROI';
import CalibrationMeter from './CalibrationMeter';
import { ROIPosition, PitchData } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  roi: ROIPosition;
  onROIChange: (roi: ROIPosition) => void;
  isTracking: boolean;
  onPitchDetected: (data: PitchData) => void;
  style?: ViewStyle;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  roi,
  onROIChange,
  isTracking,
  onPitchDetected,
  style
}) => {
  const cameraRef = useRef<Camera>(null);
  
  // Responsive video dimensions
  const VIDEO_WIDTH = style?.width ? Number(style.width) : screenWidth - 40;
  const VIDEO_HEIGHT = (VIDEO_WIDTH * 3) / 4; // 4:3 aspect ratio

  // Yellow ball detection configuration
  const YELLOW_DETECTION_CONFIG = {
    RED_THRESHOLD: 150,
    GREEN_THRESHOLD: 150, 
    BLUE_THRESHOLD: 100,
    INTENSITY_RATIO: 2.5
  };

  const simulatePitchDetection = useCallback(() => {
    if (!isTracking) return;
    
    // Simulate occasional pitch detection for demo
    if (Math.random() > 0.95) {
      const mockX = roi.x + Math.random() * roi.width;
      const mockY = roi.y + Math.random() * roi.height;
      
      // Mock pitch data calculation
      const height = 6 - ((mockY - roi.y) / roi.height) * 4; // 2-6 feet range
      const velocity = 45 + Math.random() * 20; // 45-65 mph
      
      const pitchData: PitchData = {
        timestamp: new Date().toISOString(),
        height,
        velocity,
        x: mockX,
        y: mockY
      };
      
      onPitchDetected(pitchData);
    }
  }, [isTracking, roi, onPitchDetected]);

  useEffect(() => {
    if (!isTracking) return;
    
    const interval = setInterval(simulatePitchDetection, 100); // Process at 10fps
    return () => clearInterval(interval);
  }, [isTracking, simulatePitchDetection]);

  return (
    <View style={[styles.container, { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }, style]}>
      {/* Camera view for real implementation */}
      <View style={styles.videoFeed}>
        <Text style={styles.videoFeedText}>Live Video Feed</Text>
        <Text style={styles.videoSubtext}>Camera integration ready</Text>
      </View>
      
      <DraggableROI
        roi={roi}
        onROIChange={onROIChange}
        containerWidth={VIDEO_WIDTH}
        containerHeight={VIDEO_HEIGHT}
      />
      
      <CalibrationMeter />
      
      {isTracking && (
        <View style={styles.trackingIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.trackingText}>TRACKING ACTIVE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoFeed: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    // Checkered pattern background simulation
    borderWidth: 1,
    borderColor: '#444',
  },
  videoFeedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoSubtext: {
    color: '#ccc',
    fontSize: 12,
  },
  trackingIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  trackingText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default VideoPlayer;