import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AddressSelector } from '../../components/checkout/AddressSelector';
import { Loading } from '../../components/ui/Loading';
import { customersApi } from '../../lib/api';
import { useAuthStore, useCartStore } from '../../lib/store';

export default function AddressScreen() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { setDeliveryAddressId, deliveryAddressId } = useCartStore();
  const [selectedDeliveryId, setSelectedDeliveryId] = React.useState<string | null>(deliveryAddressId);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['customer-addresses', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      const response = await customersApi.getAddresses(customer.id);
      return response.data.data || [];
    },
    enabled: !!customer?.id,
  });

  const defaultAddress = addresses.find((a) => a.isDefault);

  React.useEffect(() => {
    if (defaultAddress && !selectedDeliveryId) {
      setSelectedDeliveryId(defaultAddress.id);
    }
  }, [addresses, defaultAddress, selectedDeliveryId]);

  const handleContinue = () => {
    if (!selectedDeliveryId) {
      Alert.alert('Missing Address', 'Please select a delivery address');
      return;
    }
    setDeliveryAddressId(selectedDeliveryId);
    router.push('/checkout/scheduling');
  };

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Addresses</Text>
          <Text style={styles.subtitle}>Select where to deliver your order</Text>
        </View>

        {/* Delivery Address */}
        <View style={styles.content}>
          <AddressSelector
            addresses={addresses}
            selectedAddressId={selectedDeliveryId}
            onSelect={setSelectedDeliveryId}
            onAddNew={() => {
              // In a real app, navigate to add address screen
              Alert.alert('Feature Coming Soon', 'Add new address feature coming soon');
            }}
            label="Delivery Address"
            description="Where should we deliver your order?"
          />
        </View>

        {/* Pickup Address Info */}
        <View style={styles.content}>
          <Text style={styles.infoText}>
            📦 Your items will be picked up from the merchant location and delivered to your address.
          </Text>
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
          title="Continue to Schedule"
          fullWidth
          onPress={handleContinue}
          disabled={!selectedDeliveryId}
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
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
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
