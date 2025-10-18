import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { driverApi } from '../../lib/api';

// Hardcoded driver ID for demo
const DRIVER_ID = 'driver-123';

interface ActiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer: {
    firstName: string;
    lastName: string;
  };
  merchantLocation?: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function ActiveOrdersScreen() {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    try {
      const response = await driverApi.getActiveOrders(DRIVER_ID);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading active orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveOrders();
    setRefreshing(false);
  };

  const openNavigation = (order: ActiveOrder) => {
    const address =
      order.status === 'ASSIGNED_TO_DRIVER'
        ? order.merchantLocation
        : order.deliveryAddress;

    if (!address) {
      Alert.alert('Error', 'Address not available');
      return;
    }

    const destination = `${address.latitude},${address.longitude}`;
    const label =
      order.status === 'ASSIGNED_TO_DRIVER'
        ? order.merchantLocation?.name
        : 'Customer Address';

    const url = Platform.select({
      ios: `maps://app?daddr=${destination}&q=${encodeURIComponent(label || '')}`,
      android: `google.navigation:q=${destination}&mode=d`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const markPickedUp = async (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Confirm Pickup',
      `Confirm you have picked up order ${orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(orderId);
            try {
              await driverApi.markPickedUp(DRIVER_ID, orderId);
              Alert.alert('Success', 'Order marked as picked up!');
              await loadActiveOrders();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update order',
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const markDelivered = async (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Confirm Delivery',
      `Confirm you have delivered order ${orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(orderId);
            try {
              await driverApi.markDelivered(DRIVER_ID, orderId);
              Alert.alert('Success', 'Order delivered! Earnings recorded.');
              await loadActiveOrders();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update order',
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ASSIGNED_TO_DRIVER: { label: 'Go to Pickup', color: '#3b82f6' },
      PICKED_UP: { label: 'Deliver Now', color: '#10b981' },
      OUT_FOR_DELIVERY: { label: 'Deliver Now', color: '#10b981' },
    };
    return statusMap[status] || { label: status, color: '#71717a' };
  };

  const renderOrderCard = (order: ActiveOrder) => {
    const statusDisplay = getStatusDisplay(order.status);
    const isPickupPhase = order.status === 'ASSIGNED_TO_DRIVER';
    const isDeliveryPhase =
      order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY';
    const isLoading = actionLoading === order.id;

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusDisplay.color + '20' },
              ]}
            >
              <Text
                style={[styles.statusText, { color: statusDisplay.color }]}
              >
                {statusDisplay.label}
              </Text>
            </View>
          </View>
          <Text style={styles.orderAmount}>
            ${order.totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionLabel}>CUSTOMER</Text>
          <Text style={styles.customerName}>
            {order.customer.firstName} {order.customer.lastName}
          </Text>
        </View>

        {/* Pickup Location */}
        {order.merchantLocation && (
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionLabel}>
                {isPickupPhase ? '📍 PICKUP LOCATION' : '✓ PICKED UP FROM'}
              </Text>
            </View>
            <Text style={styles.locationName}>
              {order.merchantLocation.name}
            </Text>
            <Text style={styles.locationAddress}>
              {order.merchantLocation.address}, {order.merchantLocation.city}
            </Text>
          </View>
        )}

        {/* Delivery Location */}
        {order.deliveryAddress && (
          <View style={styles.locationSection}>
            <Text style={styles.sectionLabel}>
              {isDeliveryPhase ? '🏠 DELIVER TO' : '🏠 DELIVERY ADDRESS'}
            </Text>
            <Text style={styles.locationAddress}>
              {order.deliveryAddress.address}
            </Text>
            <Text style={styles.locationAddress}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
              {order.deliveryAddress.zipCode}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => openNavigation(order)}
          >
            <Text style={styles.navigationButtonText}>
              🗺️ Navigate
            </Text>
          </TouchableOpacity>

          {isPickupPhase && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#3b82f6' },
                isLoading && styles.actionButtonDisabled,
              ]}
              onPress={() => markPickedUp(order.id, order.orderNumber)}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Processing...' : 'Mark Picked Up'}
              </Text>
            </TouchableOpacity>
          )}

          {isDeliveryPhase && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: '#10b981' },
                isLoading && styles.actionButtonDisabled,
              ]}
              onPress={() => markDelivered(order.id, order.orderNumber)}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Processing...' : 'Mark Delivered'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Deliveries</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Active Orders</Text>
            <Text style={styles.emptyText}>
              Accept orders from the Orders tab to see them here
            </Text>
          </View>
        ) : (
          orders.map(renderOrderCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  customerSection: {
    marginBottom: 20,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e4e4e7',
  },
  locationSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navigationButton: {
    flex: 1,
    backgroundColor: '#27272a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navigationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
