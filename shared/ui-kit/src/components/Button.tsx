import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onPress, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  style
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: '#1a1a1a',
        borderColor: '#646cff',
      },
      secondary: {
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
      },
      danger: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
      }
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 20,
      }
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '500',
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: '#ffffff' },
      secondary: { color: '#1a1a1a' },
      danger: { color: '#ffffff' }
    };

    const sizeTextStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 }
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...sizeTextStyles[size],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;