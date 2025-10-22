import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useAddressesStore } from '../../lib/store';
import { customersApi } from '../../lib/api';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import AddressCard from '../../components/addresses/AddressCard';
import type { Address } from '../../types';

export default function AddressesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customerId } = useAuthStore();
  const { setAddresses, deleteAddress: deleteAddressFromStore } = useAddressesStore();

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('No customer ID');
      const response = await customersApi.getAddresses(customerId);
      const fetchedAddresses = response.data.data || [];
      setAddresses(fetchedAddresses);
      return fetchedAddresses;
    },
    enabled: !!customerId,
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!customerId) throw new Error('No customer ID');
      await customersApi.deleteAddress(customerId, addressId);
    },
    onSuccess: (_, addressId) => {
      deleteAddressFromStore(addressId);
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to delete address. Please try again.');
      console.error('Delete address error:', error);
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      if (!customerId) throw new Error('No customer ID');
      const address = addresses.find((a: Address) => a.id === addressId);
      if (!address) throw new Error('Address not found');

      await customersApi.updateAddress(customerId, addressId, {
        ...address,
        isDefault: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to set default address. Please try again.');
      console.error('Set default address error:', error);
    },
  });

  const handleAddAddress = () => {
    router.push('/addresses/add');
  };

  const handleEditAddress = (addressId: string) => {
    router.push(`/addresses/${addressId}/edit`);
  };

  const handleDeleteAddress = (addressId: string, label: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddressMutation.mutate(addressId),
        },
      ],
    );
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (addresses.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="location-outline"
          title="No addresses saved"
          description="Add your first address to make ordering easier"
          onAction={handleAddAddress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => handleEditAddress(item.id)}
            onDelete={() => handleDeleteAddress(item.id, item.label)}
            onSetDefault={() => handleSetDefault(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </Text>
          </View>
        )}
      />

      {/* Add Address Button */}
      <View style={styles.footer}>
        <Button
          title="Add New Address"
          onPress={handleAddAddress}
          icon={<Ionicons name="add" size={20} color={colors.text.inverse} />}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body.base,
    color: colors.text.secondary,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    ...shadows.md,
  },
});
