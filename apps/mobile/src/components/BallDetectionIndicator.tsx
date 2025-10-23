import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BallDetectionResult } from '@/types';

interface BallDetectionIndicatorProps {
  detection: BallDetectionResult;
}

/**
 * Ball Detection Indicator Component
 * Visual feedback for yellow ball detection status
 */
export default function BallDetectionIndicator({ detection }: BallDetectionIndicatorProps) {
  const { detected, confidence, pixelCount } = detection;

  // Determine indicator color based on confidence
  let indicatorColor = '#666666'; // Gray (not detected)
  if (detected) {
    if (confidence >= 80) {
      indicatorColor = '#34C759'; // Green (high confidence)
    } else if (confidence >= 60) {
      indicatorColor = '#FFCC00'; // Yellow (medium confidence)
    } else {
      indicatorColor = '#FF9500'; // Orange (low confidence)
    }
  }

  return (
    <View style={styles.container}>
      {/* Detection indicator dot */}
      <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />

      {/* Detection status */}
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>
          {detected ? 'Ball Detected' : 'No Ball'}
        </Text>

        {detected && (
          <>
            <Text style={styles.detailText}>
              Confidence: {confidence}%
            </Text>
            <Text style={styles.detailText}>
              Pixels: {pixelCount}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
  },
  detailText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  indicator: {
    borderRadius: 8,
    height: 16,
    marginRight: 12,
    width: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
});
