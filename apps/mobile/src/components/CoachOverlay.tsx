import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface CoachOverlayProps {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  show: boolean;
}

/**
 * Animated Coach Overlay Component
 * Provides visual guidance during calibration and tracking
 */
export default function CoachOverlay({ message, type, show }: CoachOverlayProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (show) {
      // Fade in and scale up
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 100 })
      );

      // Subtle pulse animation
      scale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Determine colors based on type
  let backgroundColor = 'rgba(0, 122, 255, 0.9)'; // Blue (info)
  let iconColor = '#FFFFFF';

  switch (type) {
    case 'warning':
      backgroundColor = 'rgba(255, 204, 0, 0.9)'; // Yellow
      iconColor = '#000000';
      break;
    case 'success':
      backgroundColor = 'rgba(52, 199, 89, 0.9)'; // Green
      break;
    case 'error':
      backgroundColor = 'rgba(255, 59, 48, 0.9)'; // Red
      break;
  }

  if (!show) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Text style={[styles.icon, { color: backgroundColor }]}>
            {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i'}
          </Text>
        </View>

        {/* Message */}
        <Text style={[styles.message, { color: type === 'warning' ? '#000000' : '#FFFFFF' }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 8,
    left: '10%',
    padding: 20,
    position: 'absolute',
    right: '10%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    top: '20%',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
