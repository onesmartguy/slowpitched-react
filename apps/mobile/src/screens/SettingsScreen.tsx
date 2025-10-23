import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

/**
 * Settings Screen (Placeholder for Phase 4)
 * Will contain app configuration and preferences
 */
export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Coming in Phase 4</Text>

        {/* Detection Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detection Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Yellow Detection Threshold</Text>
            <Text style={styles.settingValue}>Default</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Minimum Pixel Count</Text>
            <Text style={styles.settingValue}>50</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Frame Processing Rate</Text>
            <Text style={styles.settingValue}>30 FPS</Text>
          </View>
        </View>

        {/* Calibration Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calibration</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-recalibrate</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Calibration Timeout</Text>
            <Text style={styles.settingValue}>1 hour</Text>
          </View>
        </View>

        {/* Data Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Clear All Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Export All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0 (Phase 2)</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Build</Text>
            <Text style={styles.settingValue}>Development</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    color: '#000',
    fontSize: 16,
  },
  settingValue: {
    color: '#8E8E93',
    fontSize: 16,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 18,
    marginBottom: 24,
  },
  title: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
