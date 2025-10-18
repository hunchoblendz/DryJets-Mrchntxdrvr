import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { driverApi } from '../../lib/api';

// Hardcoded driver ID for demo
const DRIVER_ID = 'driver-123';

interface AvailableOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  distanceKm: number;
  customer: {
    firstName: string;
    lastName: string;
  };
  merchantLocation?: {
    name: string;
    address: string;
    city: string;
  };
  deliveryAddress?: {
    address: string;
    city: string;
  };
  createdAt: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(10);

  useEffect(() => {
    loadOrders();
  }, [radiusKm]);

  const loadOrders = async () => {
    try {
      const response = await driverApi.getAvailableOrders(DRIVER_ID, radiusKm);
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (error.response?.status !== 400) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to load orders',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const acceptOrder = async (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Accept Order',
      `Do you want to accept order ${orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await driverApi.acceptOrder(DRIVER_ID, orderId);
              Alert.alert('Success', 'Order accepted! Check Active Orders tab.');
              // Reload orders list
              await loadOrders();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to accept order',
              );
            }
          },
        },
      ],
    );
  };

  const renderOrderCard = ({ item }: { item: AvailableOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => acceptOrder(item.id, item.orderNumber)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.distanceBadge}>{item.distanceKm.toFixed(1)} km away</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.totalAmount.toFixed(2)}</Text>
          <Text style={styles.amountLabel}>Order Total</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>
          👤 {item.customer.firstName} {item.customer.lastName}
        </Text>
      </View>

      {item.merchantLocation && (
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationAddress}>
              {item.merchantLocation.name}
            </Text>
            <Text style={styles.locationCity}>
              {item.merchantLocation.address}, {item.merchantLocation.city}
            </Text>
          </View>
        </View>
      )}

      {item.deliveryAddress && (
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>🏠</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Delivery</Text>
            <Text style={styles.locationAddress}>
              {item.deliveryAddress.address}
            </Text>
            <Text style={styles.locationCity}>{item.deliveryAddress.city}</Text>
          </View>
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.timeAgo}>
          Posted {getTimeAgo(item.createdAt)}
        </Text>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptOrder(item.id, item.orderNumber)}
        >
          <Text style={styles.acceptButtonText}>Accept Order</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading available orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>

      {/* Radius Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Search Radius:</Text>
        <View style={styles.radiusButtons}>
          {[5, 10, 15, 20].map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                radiusKm === radius && styles.radiusButtonActive,
              ]}
              onPress={() => setRadiusKm(radius)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  radiusKm === radius && styles.radiusButtonTextActive,
                ]}
              >
                {radius}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Orders Available</Text>
            <Text style={styles.emptyText}>
              New orders will appear here when they're ready for pickup
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#a1a1aa',
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  radiusButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  radiusButtonText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  distanceBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  amountLabel: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 15,
    color: '#e4e4e7',
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#e4e4e7',
    fontWeight: '500',
  },
  locationCity: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  timeAgo: {
    fontSize: 12,
    color: '#71717a',
  },
  acceptButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  refreshButton: {
    marginTop: 24,
    backgroundColor: '#18181b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  refreshButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});
