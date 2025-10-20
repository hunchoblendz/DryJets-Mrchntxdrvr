import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../../types';
import { getOrderStatusColor, getOrderProgressPercentage } from '../../lib/utils';
import { spacing, typography, colors, borderRadius } from '../../theme/tokens';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  estimatedTime?: string;
}

const statusSteps: OrderStatus[] = [
  'PAYMENT_CONFIRMED',
  'PICKED_UP',
  'IN_PROCESS',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
  estimatedTime,
}) => {
  const currentIndex = statusSteps.indexOf(status as any);
  const progress = getOrderProgressPercentage(status);

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: getOrderStatusColor(status),
              },
            ]}
          />
        </View>
      </View>

      {/* Status Steps */}
      <View style={styles.stepsContainer}>
        {statusSteps.map((step, index) => (
          <View key={step} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    index <= currentIndex
                      ? getOrderStatusColor(status)
                      : colors.gray[300],
                },
              ]}
            />
            {index < statusSteps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      index < currentIndex
                        ? getOrderStatusColor(status)
                        : colors.gray[300],
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Estimated Time */}
      {estimatedTime && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Estimated Arrival</Text>
          <Text style={styles.timeValue}>{estimatedTime}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 10,
  },
  stepLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    top: 7,
    zIndex: 5,
  },
  timeContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
});
