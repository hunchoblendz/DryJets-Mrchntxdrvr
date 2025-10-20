import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, shadows, colors, borderRadius } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const variantStyle = {
    default: {
      backgroundColor: colors.background.primary,
      ...shadows.sm,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      ...shadows.lg,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyle[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
});
