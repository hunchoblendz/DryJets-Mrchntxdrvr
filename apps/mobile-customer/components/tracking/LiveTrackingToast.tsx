import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface LiveTrackingToastProps {
  title: string;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const LiveTrackingToast: React.FC<LiveTrackingToastProps> = ({
  title,
  message,
  icon,
  type = 'info',
  duration = 4000,
  onDismiss,
  action,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (duration > 0 && !action) {
      const timer = setTimeout(() => {
        slideOut();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success[50];
      case 'error':
        return colors.error[50];
      case 'warning':
        return colors.warning[50];
      default:
        return colors.primary[50];
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return colors.success[300];
      case 'error':
        return colors.error[300];
      case 'warning':
        return colors.warning[300];
      default:
        return colors.primary[300];
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return colors.success[900];
      case 'error':
        return colors.error[900];
      case 'warning':
        return colors.warning[900];
      default:
        return colors.primary[900];
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>{icon || getDefaultIcon()}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: getTextColor() }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: getTextColor() }]}>
            {message}
          </Text>
        </View>

        {/* Action button */}
        {action && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
              { borderColor: getTextColor() },
            ]}
            onPress={() => {
              action.onPress();
              slideOut();
            }}
          >
            <Text style={[styles.actionLabel, { color: getTextColor() }]}>
              {action.label}
            </Text>
          </Pressable>
        )}

        {/* Dismiss button */}
        <Pressable
          style={styles.dismissButton}
          onPress={slideOut}
        >
          <Text style={[styles.dismissIcon, { color: getTextColor() }]}>
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  message: {
    fontSize: typography.fontSize.xs,
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dismissIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
});
