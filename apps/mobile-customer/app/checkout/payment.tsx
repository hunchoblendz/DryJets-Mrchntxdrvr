import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { PromoCodeInput } from '../../components/checkout/PromoCodeInput';
import { TipSelector } from '../../components/checkout/TipSelector';
import { CartItemCard } from '../../components/checkout/CartItemCard';
import { useCartStore, useAuthStore } from '../../lib/store';
import { ordersApi } from '../../lib/api';
import { calculateTax, formatCurrency } from '../../lib/utils';

export default function PaymentScreen() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { items, getSubtotal, clearCart, fulfillmentMode, merchantId } = useCartStore();
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple-pay' | 'google-pay'>('card');

  const subtotal = getSubtotal();
  const deliveryFee = 2.5; // Example fee
  const discount = appliedPromo?.discount || 0;
  const tax = calculateTax(subtotal + deliveryFee - discount);
  const total = subtotal + deliveryFee - discount + tax + tip;

  const handlePlaceOrder = async () => {
    if (!customer?.id || !merchantId || !fulfillmentMode) {
      Alert.alert('Missing Information', 'Missing required information');
      return;
    }

    const { merchantLocationId, pickupAddressId, deliveryAddressId, isASAP, scheduledPickupAt } = useCartStore.getState();

    if (!merchantLocationId || !deliveryAddressId) {
      Alert.alert('Incomplete Checkout', 'Please complete all checkout steps');
      return;
    }

    setLoading(true);
    try {
      // Create the order with persisted cart data
      const orderResponse = await ordersApi.create({
        customerId: customer.id,
        merchantId: merchantId,
        merchantLocationId: merchantLocationId,
        type: 'ON_DEMAND' as any,
        fulfillmentMode: fulfillmentMode as any,
        pickupAddressId: pickupAddressId,
        deliveryAddressId: deliveryAddressId,
        scheduledPickupAt: isASAP ? null : scheduledPickupAt,
        specialInstructions: null,
        items: items.map((item) => ({
          serviceId: item.serviceId,
          itemName: item.serviceName,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        promoCode: appliedPromo?.code,
      });

      const orderId = orderResponse.data.data.id;

      // TODO: Integrate Stripe payment processing here
      // For now, just navigate to confirmation
      clearCart();

      router.push({
        pathname: '/checkout/confirmation',
        params: { orderId },
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      Alert.alert('Order Failed', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Review and confirm your order</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          {items.map((item) => (
            <CartItemCard
              key={item.serviceId}
              item={item}
              onUpdateQuantity={() => {}}
              onRemove={() => {}}
            />
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <PromoCodeInput
            appliedCode={appliedPromo}
            subtotal={subtotal}
            onApply={setAppliedPromo}
            onRemove={() => setAppliedPromo(null)}
          />
        </View>

        {/* Tip Selector */}
        <View style={styles.section}>
          <TipSelector
            amount={tip}
            total={subtotal + deliveryFee - discount + tax}
            onSelect={setTip}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <OrderSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            tip={tip}
            promoCode={appliedPromo}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Card variant="outlined">
            <Text style={styles.paymentText}>
              💳 Card ending in 4242
            </Text>
            <Text style={styles.paymentSubtext}>
              Payment processing integrated with Stripe
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="Back"
          variant="outline"
          fullWidth
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={loading}
        />
        <Button
          title={`Place Order · ${formatCurrency(total)}`}
          fullWidth
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
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
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
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
  paymentText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  paymentSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
});
