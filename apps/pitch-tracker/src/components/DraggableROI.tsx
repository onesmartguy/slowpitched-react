import React, { useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ROIPosition } from '../types';

interface DraggableROIProps {
  roi: ROIPosition;
  onROIChange: (roi: ROIPosition) => void;
  containerWidth: number;
  containerHeight: number;
}

const DraggableROI: React.FC<DraggableROIProps> = ({
  roi,
  onROIChange,
  containerWidth,
  containerHeight
}) => {
  const translateX = useSharedValue(roi.x);
  const translateY = useSharedValue(roi.y);

  const updateROI = useCallback((newX: number, newY: number) => {
    const clampedX = Math.max(0, Math.min(newX, containerWidth - roi.width));
    const clampedY = Math.max(0, Math.min(newY, containerHeight - roi.height));
    
    onROIChange({
      ...roi,
      x: clampedX,
      y: clampedY
    });
  }, [roi, onROIChange, containerWidth, containerHeight]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = roi.x + event.translationX;
      translateY.value = roi.y + event.translationY;
    })
    .onEnd((event) => {
      const newX = roi.x + event.translationX;
      const newY = roi.y + event.translationY;
      runOnJS(updateROI)(newX, newY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Reset animation values when roi changes externally
  React.useEffect(() => {
    translateX.value = roi.x;
    translateY.value = roi.y;
  }, [roi.x, roi.y]);

  const handleResize = useCallback((corner: string, deltaX: number, deltaY: number) => {
    let newRoi = { ...roi };
    
    switch (corner) {
      case 'se': // Southeast corner
        newRoi.width = Math.max(50, Math.min(roi.width + deltaX, containerWidth - roi.x));
        newRoi.height = Math.max(50, Math.min(roi.height + deltaY, containerHeight - roi.y));
        break;
      case 'sw': // Southwest corner
        const newWidth = Math.max(50, roi.width - deltaX);
        const newX = Math.max(0, roi.x + (roi.width - newWidth));
        newRoi.x = newX;
        newRoi.width = newWidth;
        newRoi.height = Math.max(50, Math.min(roi.height + deltaY, containerHeight - roi.y));
        break;
    }
    
    onROIChange(newRoi);
  }, [roi, onROIChange, containerWidth, containerHeight]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.roiOverlay,
          {
            position: 'absolute',
            left: 0,
            top: 0,
            width: roi.width,
            height: roi.height,
          },
          animatedStyle,
        ]}
      >
        {/* Corner resize handles */}
        <View style={[styles.resizeHandle, styles.seHandle]} />
        <View style={[styles.resizeHandle, styles.swHandle]} />
        
        {/* ROI Info Label */}
        <View style={styles.roiLabel}>
          <Text style={styles.roiLabelText}>
            ROI: {Math.round(roi.width)}×{Math.round(roi.height)}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  roiOverlay: {
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  resizeHandle: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#22c55e',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 2,
  },
  seHandle: {
    bottom: -6,
    right: -6,
  },
  swHandle: {
    bottom: -6,
    left: -6,
  },
  roiLabel: {
    position: 'absolute',
    top: -30,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  roiLabelText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DraggableROI;