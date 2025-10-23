/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, GestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { ROI } from '@/types';

interface ROIComponentProps {
  onROIChange?: (roi: ROI) => void;
  initialROI?: ROI;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Draggable Region of Interest (ROI) overlay component
 * Allows users to define the tracking area on the camera feed
 */
export default function ROIComponent({ onROIChange, initialROI }: ROIComponentProps) {
  const DEFAULT_WIDTH = SCREEN_WIDTH * 0.6;
  const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.4;

  const [roi, setROI] = useState<ROI>(
    initialROI || {
      x: (SCREEN_WIDTH - DEFAULT_WIDTH) / 2,
      y: (SCREEN_HEIGHT - DEFAULT_HEIGHT) / 2,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    }
  );

  // Animated values for smooth dragging
  const translateX = useSharedValue(roi.x);
  const translateY = useSharedValue(roi.y);

  const gestureHandler = useAnimatedGestureHandler<
    GestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event: any, context) => {
      // Calculate new position
      let newX = context.startX + event.translationX;
      let newY = context.startY + event.translationY;

      // Constrain within screen bounds
      newX = Math.max(0, Math.min(SCREEN_WIDTH - roi.width, newX));
      newY = Math.max(0, Math.min(SCREEN_HEIGHT - roi.height, newY));

      translateX.value = newX;
      translateY.value = newY;
    },
    onEnd: () => {
      // Smooth spring animation on release
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);

      // Update ROI state
      const newROI: ROI = {
        x: translateX.value,
        y: translateY.value,
        width: roi.width,
        height: roi.height,
      };
      setROI(newROI);
      onROIChange?.(newROI);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.roi, animatedStyle, { width: roi.width, height: roi.height }]}>
        {/* Corner indicators */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Center crosshair */}
        <View style={styles.crosshair}>
          <View style={styles.crosshairHorizontal} />
          <View style={styles.crosshairVertical} />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  bottomLeft: {
    borderRightWidth: 0,
    borderTopWidth: 0,
    bottom: -2,
    left: -2,
  },
  bottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    bottom: -2,
    right: -2,
  },
  corner: {
    borderColor: '#00FF00',
    borderWidth: 3,
    height: 20,
    position: 'absolute',
    width: 20,
  },
  crosshair: {
    height: 40,
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    position: 'absolute',
    top: '50%',
    width: 40,
  },
  crosshairHorizontal: {
    backgroundColor: '#00FF00',
    height: 2,
    left: 0,
    marginTop: -1,
    position: 'absolute',
    right: 0,
    top: '50%',
  },
  crosshairVertical: {
    backgroundColor: '#00FF00',
    bottom: 0,
    left: '50%',
    marginLeft: -1,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  roi: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: '#00FF00',
    borderStyle: 'dashed',
    borderWidth: 2,
    position: 'absolute',
  },
  topLeft: {
    borderBottomWidth: 0,
    borderRightWidth: 0,
    left: -2,
    top: -2,
  },
  topRight: {
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    right: -2,
    top: -2,
  },
});
