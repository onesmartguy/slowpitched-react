import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Switch } from 'react-native';

interface ControlsPanelProps {
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onExportData: () => void;
  pitchCount: number;
  style?: ViewStyle;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isTracking,
  onStartTracking,
  onStopTracking,
  onExportData,
  pitchCount,
  style
}) => {
  const [yellowSensitivity, setYellowSensitivity] = useState(75);
  const [motionThreshold, setMotionThreshold] = useState(50);
  const [autoCalibrate, setAutoCalibrate] = useState(true);

  const handleReset = () => {
    // In React Native, we'd need to restart the app or reset state manually
    // For now, we'll just reset the local state
    setYellowSensitivity(75);
    setMotionThreshold(50);
    setAutoCalibrate(true);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Pitch Tracker Controls</Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status: </Text>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isTracking ? '#22c55e' : '#ef4444' }
          ]} />
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking Active' : 'Standby'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pitches Detected: </Text>
          <Text style={styles.pitchCount}>{pitchCount}</Text>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        {!isTracking ? (
          <TouchableOpacity style={styles.startButton} onPress={onStartTracking}>
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={onStopTracking}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { opacity: pitchCount === 0 ? 0.5 : 1 }]}
          onPress={onExportData}
          disabled={pitchCount === 0}
        >
          <Text style={styles.buttonText}>
            Export CSV ({pitchCount} records)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset Session</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Yellow Sensitivity</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{Math.round(yellowSensitivity)}%</Text>
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Motion Threshold</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{Math.round(motionThreshold)}%</Text>
          </View>
        </View>
        
        <View style={styles.checkboxContainer}>
          <Switch
            value={autoCalibrate}
            onValueChange={setAutoCalibrate}
            trackColor={{ false: '#767577', true: '#646cff' }}
            thumbColor={autoCalibrate ? '#fff' : '#f4f3f4'}
          />
          <Text style={styles.checkboxLabel}>Auto-calibrate</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  statusText: {
    color: '#ccc',
    fontSize: 14,
  },
  pitchCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#646cff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 16,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderContainer: {
    backgroundColor: '#444',
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sliderValue: {
    color: '#646cff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default ControlsPanel;