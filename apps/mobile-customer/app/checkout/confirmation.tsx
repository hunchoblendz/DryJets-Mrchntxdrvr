import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { ordersApi } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await ordersApi.getById(orderId);
      return response.data.data;
    },
    enabled: !!orderId,
  });

  if (isLoading || !order) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed successfully
          </Text>
        </View>

        {/* Order Number */}
        <View style={styles.section}>
          <Card variant="elevated">
            <View style={styles.orderNumberContainer}>
              <Text style={styles.orderNumberLabel}>Order Number</Text>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            </View>
          </Card>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Text style={styles.detailValue}>
                {order.merchant?.businessName}
              </Text>
            </View>
          </Card>

          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fulfillment</Text>
              <Text style={styles.detailValue}>
                {order.fulfillmentMode?.replace(/_/g, ' ')}
              </Text>
            </View>
          </Card>

          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(order.createdAt)}
              </Text>
            </View>
          </Card>

          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={[styles.detailValue, styles.amountText]}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any, index: number) => (
            <Card key={index} variant="outlined" style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.totalPrice)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Card variant="default" style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
            <Text style={styles.nextStepsText}>
              ✓ Your order is confirmed{'\n'}
              ✓ A driver will pick up your items{'\n'}
              ✓ Track your order in real-time{'\n'}
              ✓ Receive notifications on status updates
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="Track Order"
          fullWidth
          onPress={() => {
            router.replace({
              pathname: '/(tabs)/orders',
              params: { highlightOrderId: order.id },
            });
          }}
          style={styles.trackButton}
        />
        <Button
          title="Continue Shopping"
          variant="outline"
          fullWidth
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success[500],
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  orderNumberContainer: {
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  orderNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    fontFamily: 'Courier New',
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  amountText: {
    color: colors.primary[500],
    fontSize: typography.fontSize.lg,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  itemQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    marginLeft: spacing.md,
  },
  nextStepsCard: {
    backgroundColor: colors.success[50],
    borderRadius: 12,
  },
  nextStepsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.success[500],
    marginBottom: spacing.md,
  },
  nextStepsText: {
    fontSize: typography.fontSize.base,
    color: colors.success[700],
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  trackButton: {
    marginBottom: spacing.sm,
  },
});
