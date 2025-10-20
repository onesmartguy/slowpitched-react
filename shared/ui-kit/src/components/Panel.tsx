import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

const Panel: React.FC<PanelProps> = ({ children, title, style }) => {
  return (
    <View style={[styles.panel, style]}>
      {title && (
        <Text style={styles.title}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#fff',
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
});

export default Panel;