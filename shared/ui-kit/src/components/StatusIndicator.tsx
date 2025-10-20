import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning';
  label?: string;
  style?: ViewStyle;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, style }) => {
  const colors = {
    active: '#22c55e', // More accessible green
    inactive: '#ef4444', // More accessible red
    warning: '#f59e0b'  // More accessible amber
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive', 
    warning: 'Warning'
  };

  return (
    <View style={[styles.container, style]} accessibilityLabel={`Status: ${statusLabels[status]}`}>
      <View 
        style={[
          styles.indicator,
          { backgroundColor: colors[status] }
        ]}
      />
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
});

export default StatusIndicator;