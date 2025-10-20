import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { FulfillmentMode } from '../../types';
import {
  getFulfillmentModeLabel,
  getFulfillmentModeDescription,
  calculateFulfillmentModeFee,
  calculateFulfillmentModeDiscount,
} from '../../lib/utils';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { spacing, typography, colors, borderRadius } from '../../theme/tokens';

interface FulfillmentModeSelectorProps {
  selectedMode: FulfillmentMode | null;
  onSelect: (mode: FulfillmentMode) => void;
  subtotal: number;
  baseDeliveryFee?: number;
  style?: ViewStyle;
}

const modes: FulfillmentMode[] = [
  FulfillmentMode.FULL_SERVICE,
  FulfillmentMode.CUSTOMER_DROPOFF_PICKUP,
  FulfillmentMode.CUSTOMER_DROPOFF_DRIVER_DELIVERY,
  FulfillmentMode.DRIVER_PICKUP_CUSTOMER_PICKUP,
];

const modeIcons: Record<FulfillmentMode, string> = {
  [FulfillmentMode.FULL_SERVICE]: '🚚',
  [FulfillmentMode.CUSTOMER_DROPOFF_PICKUP]: '🏪',
  [FulfillmentMode.CUSTOMER_DROPOFF_DRIVER_DELIVERY]: '📦',
  [FulfillmentMode.DRIVER_PICKUP_CUSTOMER_PICKUP]: '🤝',
};

export const FulfillmentModeSelector: React.FC<FulfillmentModeSelectorProps> = ({
  selectedMode,
  onSelect,
  subtotal,
  baseDeliveryFee = 5,
  style,
}) => {
  const renderModeCard = (mode: FulfillmentMode) => {
    const isSelected = selectedMode === mode;
    const fee = calculateFulfillmentModeFee(mode, baseDeliveryFee);
    const discount = calculateFulfillmentModeDiscount(mode, subtotal);
    const icon = modeIcons[mode];

    return (
      <TouchableOpacity
        key={mode}
        onPress={() => onSelect(mode)}
        style={[
          styles.modeCard,
          isSelected && styles.modeCardSelected,
        ]}
      >
        <Card
          variant={isSelected ? 'elevated' : 'default'}
          style={[
            styles.cardContent as ViewStyle,
            isSelected && (styles.cardContentSelected as ViewStyle),
          ] as ViewStyle}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>
                {getFulfillmentModeLabel(mode)}
              </Text>
              <Text style={styles.modeDesc}>
                {getFulfillmentModeDescription(mode)}
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View>
              <Text style={styles.feeLabel}>
                {fee === 0 ? 'No delivery fee' : `Fee: ${formatCurrency(fee)}`}
              </Text>
              {discount > 0 && (
                <Badge
                  label={`Save ${formatCurrency(discount)}`}
                  variant="success"
                  size="sm"
                />
              )}
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>
                {formatCurrency(subtotal + fee - discount)}
              </Text>
            </View>
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={style}>
      <Text style={styles.title}>How would you like us to handle your order?</Text>
      <View style={styles.modesContainer}>
        {modes.map(renderModeCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modesContainer: {
    gap: spacing.md,
  },
  modeCard: {
    borderRadius: borderRadius.lg,
  },
  modeCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  cardContent: {
    padding: spacing.md,
  },
  cardContentSelected: {
    backgroundColor: colors.primary[50],
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modeDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  feeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  totalPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
  },
});
