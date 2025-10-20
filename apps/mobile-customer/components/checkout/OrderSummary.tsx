import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { colors, spacing, typography } from '../../theme/tokens';
import { formatCurrency, calculateTax, calculateDiscount } from '../../lib/utils';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  tip: number;
  promoCode?: { code: string; discount: number } | null;
  taxRate?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  deliveryFee,
  tip,
  promoCode,
  taxRate = 0.08,
}) => {
  const discount = promoCode?.discount || 0;
  const taxableAmount = subtotal + deliveryFee - discount;
  const tax = calculateTax(taxableAmount, taxRate);
  const total = subtotal + deliveryFee - discount + tax + tip;

  return (
    <Card variant="outlined">
      <View style={styles.container}>
        {/* Subtotal */}
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
        </View>

        {/* Delivery Fee */}
        {deliveryFee > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee</Text>
            <Text style={styles.value}>{formatCurrency(deliveryFee)}</Text>
          </View>
        )}

        {/* Discount */}
        {discount > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.discount]}>
              Discount {promoCode?.code ? `(${promoCode.code})` : ''}
            </Text>
            <Text style={[styles.value, styles.discount]}>
              −{formatCurrency(discount)}
            </Text>
          </View>
        )}

        {/* Tax */}
        {tax > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tax ({(taxRate * 100).toFixed(0)}%)</Text>
            <Text style={styles.value}>{formatCurrency(tax)}</Text>
          </View>
        )}

        {/* Tip */}
        {tip > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tip</Text>
            <Text style={styles.value}>{formatCurrency(tip)}</Text>
          </View>
        )}

        {/* Divider */}
        <Divider style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  value: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  discount: {
    color: colors.success[500],
  },
  divider: {
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
});
