import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

interface VariantStyle {
  backgroundColor: string;
  borderWidth?: number;
  borderColor?: string;
  color: string;
}

const variantStyles: Record<string, VariantStyle> = {
  primary: {
    backgroundColor: colors.primary[500],
    color: colors.text.inverse,
  },
  secondary: {
    backgroundColor: colors.secondary[500],
    color: colors.text.inverse,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    color: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.primary[500],
  },
  danger: {
    backgroundColor: colors.error[500],
    color: colors.text.inverse,
  },
};

const sizeStyles = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.md,
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderWidth: variantStyle.borderWidth || 0,
          borderColor: variantStyle.borderColor || 'transparent',
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        },
        sizeStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.color} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: variantStyle.color,
              fontSize: sizeStyle.fontSize,
              fontWeight: typography.fontWeight.semibold,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    textAlign: 'center',
  },
});
