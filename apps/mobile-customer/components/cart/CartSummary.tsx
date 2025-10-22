import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '../../lib/store';
import { colors, spacing, typography } from '../../theme/tokens';

export default function CartSummary() {
  const { getSubtotal, fulfillmentMode, promoCode } = useCartStore();

  const subtotal = getSubtotal();

  // Calculate fees based on fulfillment mode
  const fees = useMemo(() => {
    const TAX_RATE = 0.0825; // 8.25% sales tax
    const SERVICE_FEE_RATE = 0.05; // 5% service fee

    // Fulfillment mode pricing adjustments
    let fulfillmentFee = 0;
    let discount = 0;

    if (fulfillmentMode === 'FULL_SERVICE_PICKUP_DELIVERY') {
      fulfillmentFee = 4.99; // Pickup & delivery fee
    } else if (fulfillmentMode === 'PICKUP_ONLY') {
      fulfillmentFee = 2.99; // Pickup only fee
    } else if (fulfillmentMode === 'DELIVERY_ONLY') {
      fulfillmentFee = 2.99; // Delivery only fee
    } else if (fulfillmentMode === 'SELF_SERVICE_DROPOFF_PICKUP') {
      discount = subtotal * 0.15; // 15% discount for self-service
    }

    const serviceFee = subtotal * SERVICE_FEE_RATE;
    const subtotalAfterDiscount = subtotal - discount;
    const tax = subtotalAfterDiscount * TAX_RATE;
    const total = subtotalAfterDiscount + serviceFee + fulfillmentFee + tax;

    return {
      subtotal,
      serviceFee,
      fulfillmentFee,
      discount,
      tax,
      total,
    };
  }, [subtotal, fulfillmentMode]);

  return (
    <View style={styles.container}>
      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>${fees.subtotal.toFixed(2)}</Text>
      </View>

      {/* Discount */}
      {fees.discount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.discountLabel]}>
            Self-Service Discount (15%)
          </Text>
          <Text style={[styles.value, styles.discountValue]}>
            -${fees.discount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Service Fee */}
      <View style={styles.row}>
        <Text style={styles.label}>Service Fee (5%)</Text>
        <Text style={styles.value}>${fees.serviceFee.toFixed(2)}</Text>
      </View>

      {/* Fulfillment Fee */}
      {fees.fulfillmentFee > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Fulfillment Fee</Text>
          <Text style={styles.value}>${fees.fulfillmentFee.toFixed(2)}</Text>
        </View>
      )}

      {/* Tax */}
      <View style={styles.row}>
        <Text style={styles.label}>Tax (8.25%)</Text>
        <Text style={styles.value}>${fees.tax.toFixed(2)}</Text>
      </View>

      {/* Promo Code Applied */}
      {promoCode && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.promoLabel]}>
            Promo: {promoCode}
          </Text>
          <Text style={[styles.value, styles.promoValue]}>Applied</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${fees.total.toFixed(2)}</Text>
      </View>

      {/* Savings Message */}
      {fees.discount > 0 && (
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsText}>
            🎉 You're saving ${fees.discount.toFixed(2)} with self-service!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body.base,
    color: colors.text.secondary,
  },
  value: {
    ...typography.body.base,
    color: colors.text.primary,
    fontWeight: '600',
  },
  discountLabel: {
    color: colors.secondary[500],
    fontWeight: '500',
  },
  discountValue: {
    color: colors.secondary[500],
  },
  promoLabel: {
    color: colors.primary[500],
    fontWeight: '500',
  },
  promoValue: {
    color: colors.primary[500],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  totalValue: {
    ...typography.heading.h3,
    color: colors.primary[500],
    fontWeight: '700',
  },
  savingsContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary[500],
  },
  savingsText: {
    ...typography.body.sm,
    color: colors.secondary[700],
    fontWeight: '600',
    textAlign: 'center',
  },
});
