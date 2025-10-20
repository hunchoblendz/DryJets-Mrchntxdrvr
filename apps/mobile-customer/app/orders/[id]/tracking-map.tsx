import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout } from '../../../theme/tokens';
import { OrderTrackingMap } from '../../../components/tracking/OrderTrackingMap';
import { ordersApi, driversApi } from '../../../lib/api';
import { useOrderTracking, useDriverTracking } from '../../../lib/realtime';
import { formatCurrency, calculateDistance } from '../../../lib/utils';
import { Order, Driver } from '../../../types';

export default function OrderTrackingMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await ordersApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    refetchInterval: 15000,
  });

  // Track order in real-time
  useOrderTracking({ orderId: id || '', enabled: !!id });

  const driverId = (order as any)?.driverId;

  // Fetch driver details
  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await driversApi.getById(driverId);
      return response.data.data;
    },
    enabled: !!driverId && order?.status === 'OUT_FOR_DELIVERY',
    refetchInterval: 10000,
  });

  // Track driver in real-time
  useDriverTracking({ driverId, enabled: !!driverId });

  // Update driver location
  useEffect(() => {
    if (driver) {
      const location = {
        latitude: (driver as any)?.currentLatitude || 0,
        longitude: (driver as any)?.currentLongitude || 0,
      };
      setDriverLocation(location);

      // Calculate distance between driver and delivery
      if (order?.deliveryAddress) {
        const dist = calculateDistance(
          location.latitude,
          location.longitude,
          order.deliveryAddress.latitude || 0,
          order.deliveryAddress.longitude || 0
        );
        setDistance(dist);
      }
    }
  }, [driver, order]);

  const handleOpenInMaps = () => {
    if (!driverLocation || !order?.deliveryAddress) return;

    const url = `https://maps.google.com/?saddr=${driverLocation.latitude},${driverLocation.longitude}&daddr=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Maps application');
    });
  };

  const handleContactDriver = () => {
    const driverPhone = (driver as any)?.phone;
    if (driverPhone) {
      Alert.alert(
        'Contact Driver',
        `Call ${(driver as any)?.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              Linking.openURL(`tel:${driverPhone}`).catch((err) => {
                console.error('Failed to make call:', err);
              });
            },
          },
        ]
      );
    }
  };

  const isLoading = orderLoading || driverLoading;

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const merchantLat = (order.merchant as any)?.latitude || 0;
  const merchantLng = (order.merchant as any)?.longitude || 0;
  const deliveryLat = order.deliveryAddress?.latitude || 0;
  const deliveryLng = order.deliveryAddress?.longitude || 0;
  const driverLat = (driver as any)?.currentLatitude || driverLocation?.latitude || 0;
  const driverLng = (driver as any)?.currentLongitude || driverLocation?.longitude || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <OrderTrackingMap
        driverLocation={{ latitude: driverLat, longitude: driverLng }}
        merchantLocation={{ latitude: merchantLat, longitude: merchantLng }}
        deliveryLocation={{ latitude: deliveryLat, longitude: deliveryLng }}
        driverName={(driver as any)?.name || 'Driver'}
        driverRating={(driver as any)?.rating || 4.8}
        vehicleNumber={(driver as any)?.vehicleNumber || 'N/A'}
        merchantName={order.merchant?.businessName || 'Merchant'}
        merchantAddress={(order.merchant as any)?.address || ''}
        deliveryAddress={`${order.deliveryAddress?.streetAddress}, ${order.deliveryAddress?.city}`}
        isLoading={isLoading}
        onDriverPress={handleContactDriver}
      />

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order.orderNumber}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Distance Info */}
          {distance !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distance:</Text>
              <Text style={styles.value}>{distance.toFixed(1)} mi</Text>
            </View>
          )}

          {/* Driver Info */}
          {driver && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Driver:</Text>
                <Text style={styles.value}>{(driver as any)?.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Vehicle:</Text>
                <Text style={styles.value}>{(driver as any)?.vehicleNumber}</Text>
              </View>

              <TouchableOpacity onPress={handleContactDriver} style={styles.callButton}>
                <Text style={styles.callButtonText}>📞 Call Driver</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Open in Maps */}
          <TouchableOpacity onPress={handleOpenInMaps} style={styles.mapsButton}>
            <Text style={styles.mapsButtonText}>🗺️ Open in Maps</Text>
          </TouchableOpacity>

          {/* Order Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background.primary,
    fontWeight: typography.fontWeight.bold,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    maxHeight: '45%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  callButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  callButtonText: {
    color: colors.background.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  mapsButton: {
    backgroundColor: colors.success[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mapsButtonText: {
    color: colors.background.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
});
