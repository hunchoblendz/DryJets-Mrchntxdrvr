import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useAddressesStore } from '../../lib/store';
import { customersApi } from '../../lib/api';
import { colors, spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import AddressForm from '../../components/addresses/AddressForm';
import MapPicker from '../../components/addresses/MapPicker';
import type { Address } from '../../types';

export default function AddAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customerId } = useAuthStore();
  const { addAddress } = useAddressesStore();

  const [formData, setFormData] = useState({
    label: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    instructions: '',
    isDefault: false,
  });

  const [showMap, setShowMap] = useState(false);

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'customerId'>) => {
      if (!customerId) throw new Error('No customer ID');
      const response = await customersApi.createAddress(customerId, {
        ...data,
        customerId,
      });
      return response.data.data;
    },
    onSuccess: (newAddress) => {
      addAddress(newAddress);
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
      Alert.alert('Success', 'Address added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to add address. Please try again.');
      console.error('Create address error:', error);
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.label.trim()) {
      Alert.alert('Validation Error', 'Please enter an address label (e.g., Home, Work)');
      return;
    }
    if (!formData.streetAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter a street address');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validation Error', 'Please enter a city');
      return;
    }
    if (!formData.state.trim()) {
      Alert.alert('Validation Error', 'Please enter a state');
      return;
    }
    if (!formData.zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter a zip code');
      return;
    }
    if (formData.latitude === 0 || formData.longitude === 0) {
      Alert.alert(
        'Location Required',
        'Please pick a location on the map to ensure accurate delivery',
      );
      return;
    }

    createAddressMutation.mutate(formData);
  };

  const handleLocationSelect = (latitude: number, longitude: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      ...(address && !prev.streetAddress && { streetAddress: address }),
    }));
    setShowMap(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showMap ? (
        <MapPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowMap(false)}
          initialLocation={
            formData.latitude !== 0 && formData.longitude !== 0
              ? { latitude: formData.latitude, longitude: formData.longitude }
              : undefined
          }
        />
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>Address Details</Text>

            <AddressForm
              formData={formData}
              onChange={setFormData}
              onOpenMap={() => setShowMap(true)}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="ghost"
              size="lg"
            />
            <Button
              title="Save Address"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              loading={createAddressMutation.isPending}
              disabled={createAddressMutation.isPending}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.heading.h3,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
});
