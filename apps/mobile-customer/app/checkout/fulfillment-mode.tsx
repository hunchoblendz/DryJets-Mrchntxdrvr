import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FulfillmentModeSelector } from '../../components/orders/FulfillmentModeSelector';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { FulfillmentMode } from '../../types';
import { useCartStore } from '../../lib/store';
import { calculateFulfillmentModeFee, calculateFulfillmentModeDiscount, calculateTax } from '../../lib/utils';

export default function FulfillmentModeScreen() {
  const router = useRouter();
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();
  const { items, setFulfillmentMode, getSubtotal } = useCartStore();
  const [selectedMode, setSelectedMode] = useState<FulfillmentMode | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = selectedMode ? calculateFulfillmentModeFee(selectedMode) : 0;
  const discount = selectedMode ? calculateFulfillmentModeDiscount(selectedMode, subtotal) : 0;

  const handleContinue = () => {
    if (!selectedMode) return;
    setFulfillmentMode(selectedMode);
    router.push('/checkout/address');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Fulfillment</Text>
          <Text style={styles.subtitle}>Choose how you'd like your order delivered</Text>
        </View>

        {/* Fulfillment Mode Selector */}
        <View style={styles.content}>
          <FulfillmentModeSelector
            selectedMode={selectedMode}
            onSelect={setSelectedMode}
            subtotal={subtotal}
          />
        </View>

        {/* Order Summary */}
        {selectedMode && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tip={0}
              promoCode={null}
            />
          </View>
        )}

        {/* Items Count */}
        <View style={styles.content}>
          <Card variant="outlined">
            <Text style={styles.itemsText}>
              {items.length} service{items.length !== 1 ? 's' : ''} selected
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
        />
        <Button
          title="Continue to Address"
          fullWidth
          onPress={handleContinue}
          disabled={!selectedMode}
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
  content: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  itemsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
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
