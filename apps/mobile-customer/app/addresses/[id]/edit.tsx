import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useAddressesStore } from '../../../lib/store';
import { customersApi } from '../../../lib/api';
import { colors, spacing, typography } from '../../../theme/tokens';
import { Loading } from '../../../components/ui/Loading';
import { Button } from '../../../components/ui/Button';
import AddressForm from '../../../components/addresses/AddressForm';
import MapPicker from '../../../components/addresses/MapPicker';
import type { Address } from '../../../types';

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { customerId } = useAuthStore();
  const { updateAddress } = useAddressesStore();

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

  // Fetch address
  const { data: address, isLoading } = useQuery({
    queryKey: ['address', customerId, id],
    queryFn: async () => {
      if (!customerId || !id) throw new Error('Missing required parameters');
      const response = await customersApi.getAddresses(customerId);
      const addresses = response.data.data || [];
      return addresses.find((a: Address) => a.id === id);
    },
    enabled: !!customerId && !!id,
  });

  // Initialize form with address data
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        streetAddress: address.streetAddress,
        apartment: address.apartment || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        latitude: address.latitude,
        longitude: address.longitude,
        instructions: address.instructions || '',
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (data: Partial<Address>) => {
      if (!customerId || !id) throw new Error('Missing required parameters');
      const response = await customersApi.updateAddress(customerId, id, data);
      return response.data.data;
    },
    onSuccess: (updatedAddress) => {
      updateAddress(updatedAddress);
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
      Alert.alert('Success', 'Address updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update address. Please try again.');
      console.error('Update address error:', error);
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

    updateAddressMutation.mutate(formData);
  };

  const handleLocationSelect = (latitude: number, longitude: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      ...(address && { streetAddress: address }),
    }));
    setShowMap(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!address) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Address not found</Text>
      </View>
    );
  }

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
            <Text style={styles.sectionTitle}>Edit Address</Text>

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
              title="Save Changes"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              loading={updateAddressMutation.isPending}
              disabled={updateAddressMutation.isPending}
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
  errorText: {
    ...typography.body.base,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: spacing.xl,
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
