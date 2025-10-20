import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CalibrationMeterProps {
  minHeight?: number;
  maxHeight?: number;
}

const CalibrationMeter: React.FC<CalibrationMeterProps> = ({ 
  minHeight = 2, 
  maxHeight = 6 
}) => {
  const ticks = [];
  const range = maxHeight - minHeight;
  const tickCount = range * 2; // Half-foot increments
  
  for (let i = 0; i <= tickCount; i++) {
    const height = minHeight + (i / tickCount) * range;
    const isFullFoot = height % 1 === 0;
    
    ticks.push(
      <View key={i} style={styles.tickContainer}>
        <View 
          style={[
            styles.tick,
            { width: isFullFoot ? 20 : 12 }
          ]}
        />
        {isFullFoot && (
          <Text style={styles.tickLabel}>
            {height}ft
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.calibrationMeter}>
      <Text style={styles.title}>HEIGHT</Text>
      
      <View style={styles.ticksContainer}>
        {ticks.reverse()}
      </View>
      
      <View style={styles.calibratedIndicator}>
        <Text style={styles.calibratedText}>CALIBRATED</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calibrationMeter: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#555',
  },
  title: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  ticksContainer: {
    flexDirection: 'column',
  },
  tickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    height: 8,
  },
  tick: {
    height: 2,
    backgroundColor: '#fff',
    marginRight: 5,
  },
  tickLabel: {
    color: '#fff',
    fontSize: 10,
    minWidth: 20,
  },
  calibratedIndicator: {
    marginTop: 8,
    padding: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 2,
    alignItems: 'center',
  },
  calibratedText: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default CalibrationMeter;