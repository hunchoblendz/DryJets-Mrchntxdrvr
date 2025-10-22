import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { PromoCodeInput } from '../../components/checkout/PromoCodeInput';
import { TipSelector } from '../../components/checkout/TipSelector';
import { CartItemCard } from '../../components/checkout/CartItemCard';
import { useCartStore, useAuthStore } from '../../lib/store';
import { ordersApi, paymentsApi } from '../../lib/api';
import { calculateTax, formatCurrency } from '../../lib/utils';
import { usePaymentSheet, isStripeConfigured, getStripeConfigError } from '../../lib/stripe';

export default function PaymentScreen() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { items, getSubtotal, clearCart, fulfillmentMode, merchantId } = useCartStore();
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [paymentReady, setPaymentReady] = useState(false);

  const { initializePaymentSheet, openPaymentSheet, loading: paymentLoading } = usePaymentSheet();

  const subtotal = getSubtotal();
  const deliveryFee = 2.5; // Example fee
  const discount = appliedPromo?.discount || 0;
  const tax = calculateTax(subtotal + deliveryFee - discount);
  const total = subtotal + deliveryFee - discount + tax + tip;

  // Show Stripe configuration warning if not configured
  useEffect(() => {
    if (!isStripeConfigured()) {
      const errorMessage = getStripeConfigError();
      console.warn(errorMessage);
    }
  }, []);

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

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      Alert.alert(
        'Payment Not Configured',
        getStripeConfigError() || 'Stripe payment is not configured. Please set up your Stripe publishable key in the .env file.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Stripe configuration required'),
          },
        ],
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order with persisted cart data
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

      // 2. Create payment intent on backend
      const paymentIntentResponse = await paymentsApi.createPaymentIntent({
        orderId,
        customerId: customer.id,
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        paymentMethodTypes: [paymentMethod],
      });

      const { clientSecret, ephemeralKey, customerId: stripeCustomerId } = paymentIntentResponse.data.data;

      // 3. Initialize Stripe payment sheet
      const { error: initError } = await initializePaymentSheet(
        clientSecret,
        ephemeralKey,
        stripeCustomerId,
        'DryJets',
      );

      if (initError) {
        throw new Error('Failed to initialize payment sheet');
      }

      // 4. Present payment sheet
      const { error: paymentError } = await openPaymentSheet();

      if (paymentError) {
        // User cancelled or error occurred
        if (paymentError.message !== 'Canceled') {
          throw paymentError;
        }
        return; // User cancelled, don't proceed
      }

      // 5. Payment successful - clear cart and navigate to confirmation
      clearCart();

      router.push({
        pathname: '/checkout/confirmation',
        params: { orderId },
      });
    } catch (error) {
      console.error('Order creation or payment failed:', error);
      Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
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

          {/* Stripe Configuration Status */}
          {!isStripeConfigured() ? (
            <Card variant="outlined" style={styles.warningCard}>
              <View style={styles.warningContent}>
                <Ionicons name="warning-outline" size={24} color={colors.status.warning} />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Payment Not Configured</Text>
                  <Text style={styles.warningText}>
                    Stripe integration requires setup. Add your publishable key to continue.
                  </Text>
                </View>
              </View>
            </Card>
          ) : (
            <>
              {/* Payment Method Selection */}
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === 'card' && styles.paymentMethodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={paymentMethod === 'card' ? colors.primary[500] : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === 'card' && styles.paymentMethodTextActive,
                    ]}
                  >
                    Card
                  </Text>
                  {paymentMethod === 'card' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodButton,
                      paymentMethod === 'apple_pay' && styles.paymentMethodButtonActive,
                    ]}
                    onPress={() => setPaymentMethod('apple_pay')}
                  >
                    <Ionicons
                      name="logo-apple"
                      size={24}
                      color={paymentMethod === 'apple_pay' ? colors.primary[500] : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === 'apple_pay' && styles.paymentMethodTextActive,
                      ]}
                    >
                      Apple Pay
                    </Text>
                    {paymentMethod === 'apple_pay' && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                    )}
                  </TouchableOpacity>
                )}

                {Platform.OS === 'android' && (
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodButton,
                      paymentMethod === 'google_pay' && styles.paymentMethodButtonActive,
                    ]}
                    onPress={() => setPaymentMethod('google_pay')}
                  >
                    <Ionicons
                      name="logo-google"
                      size={24}
                      color={paymentMethod === 'google_pay' ? colors.primary[500] : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === 'google_pay' && styles.paymentMethodTextActive,
                      ]}
                    >
                      Google Pay
                    </Text>
                    {paymentMethod === 'google_pay' && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Card variant="outlined" style={styles.securePaymentCard}>
                <View style={styles.securePaymentContent}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.secondary[500]} />
                  <Text style={styles.securePaymentText}>
                    Secure payment powered by Stripe
                  </Text>
                </View>
              </Card>
            </>
          )}
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
  warningCard: {
    borderColor: colors.status.warning,
    backgroundColor: colors.warning[50],
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  paymentMethods: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  paymentMethodButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  paymentMethodText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  paymentMethodTextActive: {
    color: colors.primary[700],
  },
  securePaymentCard: {
    borderColor: colors.secondary[200],
    backgroundColor: colors.secondary[50],
  },
  securePaymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  securePaymentText: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[700],
    fontWeight: typography.fontWeight.medium,
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
