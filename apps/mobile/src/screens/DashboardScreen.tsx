import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * Dashboard Screen (Placeholder for Phase 4)
 * Will display session list and statistics
 */
export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Coming in Phase 4</Text>

        <View style={styles.placeholderCard}>
          <Text style={styles.cardTitle}>Recent Sessions</Text>
          <Text style={styles.cardText}>
            Session history and statistics will be displayed here once the data layer is
            implemented.
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <Text style={styles.cardText}>
            • Average pitch height{'\n'}• Min/Max heights{'\n'}• Variance and uncertainty{'\n'}•
            Pitch count per session
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.cardTitle}>Export</Text>
          <Text style={styles.cardText}>
            CSV export functionality will be available to share pitch data with coaching staff.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },
  cardTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  container: {
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
