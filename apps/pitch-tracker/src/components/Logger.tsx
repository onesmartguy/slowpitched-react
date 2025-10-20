import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';

interface LoggerProps {
  logs: string[];
  style?: ViewStyle;
}

const Logger: React.FC<LoggerProps> = ({ logs, style }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollViewRef.current && logs.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Activity Log</Text>
      <View style={styles.logContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No activity logged yet...</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 150,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  logText: {
    color: '#22c55e',
    fontFamily: 'Courier',
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 16,
  },
  emptyText: {
    color: '#666',
    fontFamily: 'Courier',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default Logger;