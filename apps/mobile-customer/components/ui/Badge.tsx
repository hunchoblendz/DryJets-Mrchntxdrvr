import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
}

const variantStyles = {
  primary: {
    backgroundColor: colors.primary[100],
    color: colors.primary[700],
  },
  success: {
    backgroundColor: colors.success[100],
    color: colors.success[700],
  },
  warning: {
    backgroundColor: colors.warning[100],
    color: colors.warning[700],
  },
  error: {
    backgroundColor: colors.error[100],
    color: colors.error[700],
  },
  gray: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'gray', size = 'md' }) => {
  const style = variantStyles[variant];
  const sizeStyle = size === 'sm' ? styles.sm : styles.md;

  return (
    <View style={[styles.badge, sizeStyle, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, sizeStyle, { color: style.color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
});
