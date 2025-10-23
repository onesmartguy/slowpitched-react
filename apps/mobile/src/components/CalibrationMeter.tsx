import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CalibrationData } from '@/types';

interface CalibrationMeterProps {
  calibrationData: CalibrationData | null;
  qualityScore: number;
}

/**
 * Calibration Quality Meter Component
 * Displays calibration status, uncertainty, and quality score
 */
export default function CalibrationMeter({ calibrationData, qualityScore }: CalibrationMeterProps) {
  if (!calibrationData) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>Not Calibrated</Text>
        <View style={styles.meterContainer}>
          <View style={[styles.meterFill, { width: '0%', backgroundColor: '#666' }]} />
        </View>
        <Text style={styles.instructionText}>Set reference height to calibrate</Text>
      </View>
    );
  }

  const { uncertainty, measurementCount, referenceHeight } = calibrationData;

  // Determine quality color
  let qualityColor = '#FF3B30'; // Red
  if (qualityScore >= 80) {
    qualityColor = '#34C759'; // Green
  } else if (qualityScore >= 60) {
    qualityColor = '#FFCC00'; // Yellow
  } else if (qualityScore >= 40) {
    qualityColor = '#FF9500'; // Orange
  }

  // Quality label
  let qualityLabel = 'Poor';
  if (qualityScore >= 80) {
    qualityLabel = 'Excellent';
  } else if (qualityScore >= 60) {
    qualityLabel = 'Good';
  } else if (qualityScore >= 40) {
    qualityLabel = 'Fair';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Calibrated</Text>

      {/* Quality Meter */}
      <View style={styles.meterContainer}>
        <View style={[styles.meterFill, { width: `${qualityScore}%`, backgroundColor: qualityColor }]} />
      </View>

      {/* Quality Score */}
      <View style={styles.row}>
        <Text style={styles.label}>Quality:</Text>
        <Text style={[styles.value, { color: qualityColor }]}>
          {qualityLabel} ({qualityScore})
        </Text>
      </View>

      {/* Uncertainty */}
      <View style={styles.row}>
        <Text style={styles.label}>Uncertainty:</Text>
        <Text style={styles.value}>±{uncertainty.toFixed(2)} ft</Text>
      </View>

      {/* Reference Height */}
      <View style={styles.row}>
        <Text style={styles.label}>Reference:</Text>
        <Text style={styles.value}>{referenceHeight.toFixed(1)} ft</Text>
      </View>

      {/* Measurement Count */}
      <View style={styles.row}>
        <Text style={styles.label}>Samples:</Text>
        <Text style={styles.value}>{measurementCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    minWidth: 250,
    padding: 16,
  },
  instructionText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  meterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  meterFill: {
    borderRadius: 12,
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
