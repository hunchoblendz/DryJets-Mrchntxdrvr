import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';
import { formatETA, getETAColor, calculateETAProgress } from '../../lib/tracking/etaCalculation';
import { createProgressAnimation } from '../../lib/tracking/mapAnimations';

interface ETABannerProps {
  eta: Date;
  distance: number;
  originalDistance: number;
  currentDistance: number;
  distanceUnit?: 'mi' | 'km';
  onDismiss?: () => void;
}

export const ETABanner: React.FC<ETABannerProps> = ({
  eta,
  distance,
  originalDistance,
  currentDistance,
  distanceUnit = 'mi',
  onDismiss,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [color, setColor] = useState<string>(colors.primary[500]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress
  const progress = calculateETAProgress(eta, originalDistance, currentDistance);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Update time left every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diffMs = eta.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      setTimeLeft(formatETA(eta));

      // Update color based on urgency
      const etaColor = getETAColor(diffMins, {
        good: colors.success[500],
        warning: colors.warning[500],
        urgent: colors.error[500],
      });
      setColor(etaColor);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [eta]);

  // Slide in animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const estimatedMinutes = Math.round((eta.getTime() - new Date().getTime()) / 60000);
  const urgency = estimatedMinutes < 5 ? 'urgent' : estimatedMinutes < 10 ? 'warning' : 'good';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideTransform }],
        },
      ]}
    >
      {/* Top section with ETA info */}
      <View style={[styles.header, { borderBottomColor: color }]}>
        <View style={styles.etaContent}>
          <View style={styles.etaLeft}>
            <Text style={styles.etaLabel}>Estimated Arrival</Text>
            <Text style={[styles.etaTime, { color }]}>{timeLeft}</Text>
          </View>

          <View style={styles.etaRight}>
            <View style={[styles.urgencyBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.urgencyText, { color }]}>
                {urgency === 'urgent'
                  ? '⏰ Arriving soon!'
                  : urgency === 'warning'
                  ? '⏱️ Getting close'
                  : '✓ On track'}
              </Text>
            </View>
          </View>
        </View>

        {/* Dismiss button */}
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              width: progressWidth,
            },
          ]}
        />
      </View>

      {/* Distance and journey info */}
      <View style={styles.footer}>
        <View style={styles.distanceInfo}>
          <Text style={styles.distanceLabel}>Distance</Text>
          <Text style={styles.distanceValue}>
            {distance.toFixed(1)} {distanceUnit}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.speedInfo}>
          <Text style={styles.speedLabel}>Avg Speed</Text>
          <Text style={styles.speedValue}>
            {Math.round((originalDistance - currentDistance) / (eta.getTime() - new Date().getTime()) * 3600000)} {distanceUnit}/h
          </Text>
        </View>
      </View>

      {/* Delivery instructions hint */}
      <View style={styles.hint}>
        <Text style={styles.hintIcon}>👀</Text>
        <Text style={styles.hintText}>Your order is on its way. Driver will call when arriving.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    overflow: 'hidden',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
  },
  etaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  etaLeft: {
    gap: 4,
  },
  etaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  etaRight: {
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  dismissIcon: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.background.secondary,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  distanceInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  distanceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  distanceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
  },
  progressInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.primary[500],
  },
  speedInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  speedLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  speedValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.background.secondary,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  hintIcon: {
    fontSize: 16,
  },
  hintText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    flex: 1,
  },
});
