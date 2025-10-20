import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing, typography, colors } from '../../theme/tokens';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.container, style]}>
    {icon && <View style={styles.iconContainer}>{icon}</View>}
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && onAction && (
      <Button title={actionLabel} onPress={onAction} style={styles.button} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});
