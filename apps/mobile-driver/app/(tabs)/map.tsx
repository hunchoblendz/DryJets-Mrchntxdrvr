import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DriverMapView from '../../components/MapView';
import { driverApi } from '../../lib/api';

const DRIVER_ID = 'driver-123';

interface AvailableOrder {
  id: string;
  orderNumber: string;
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
    latitude: number;
    longitude: number;
  };
  deliveryAddress?: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function MapScreen() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AvailableOrder | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [radiusKm]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await driverApi.getAvailableOrders(DRIVER_ID, radiusKm);
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (error.response?.status !== 400) {
        Alert.alert('Error', 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (order: AvailableOrder) => {
    setSelectedOrder(order);
  };

  const handleAcceptOrder = async (order: AvailableOrder) => {
    Alert.alert(
      'Accept Order',
      `Accept order ${order.orderNumber} from ${order.merchantLocation?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await driverApi.acceptOrder(DRIVER_ID, order.id);
              Alert.alert('Success', 'Order accepted! Check Active tab.');
              setSelectedOrder(null);
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Map */}
      <View style={styles.mapContainer}>
        <DriverMapView
          orders={orders}
          showRadius={true}
          radiusKm={radiusKm}
          onMarkerPress={handleMarkerPress}
          followDriver={true}
        />

        {/* Radius Control */}
        <View style={styles.radiusControl}>
          <Text style={styles.radiusLabel}>Search Radius</Text>
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

        {/* Orders Count */}
        <View style={styles.ordersCount}>
          <Text style={styles.ordersCountText}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} nearby
          </Text>
        </View>
      </View>

      {/* Selected Order Details */}
      {selectedOrder && (
        <View style={styles.orderDetails}>
          <ScrollView>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>{selectedOrder.orderNumber}</Text>
                <Text style={styles.orderDistance}>
                  {selectedOrder.distanceKm.toFixed(1)} km away
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedOrder(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoValue}>
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Total</Text>
                <Text style={[styles.infoValue, { color: '#10b981' }]}>
                  ${selectedOrder.totalAmount.toFixed(2)}
                </Text>
              </View>

              {selectedOrder.merchantLocation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pickup From</Text>
                  <View>
                    <Text style={styles.infoValue}>
                      {selectedOrder.merchantLocation.name}
                    </Text>
                    <Text style={styles.infoSubvalue}>
                      {selectedOrder.merchantLocation.address}
                    </Text>
                    <Text style={styles.infoSubvalue}>
                      {selectedOrder.merchantLocation.city}
                    </Text>
                  </View>
                </View>
              )}

              {selectedOrder.deliveryAddress && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Deliver To</Text>
                  <View>
                    <Text style={styles.infoValue}>
                      {selectedOrder.deliveryAddress.address}
                    </Text>
                    <Text style={styles.infoSubvalue}>
                      {selectedOrder.deliveryAddress.city}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAcceptOrder(selectedOrder)}
            >
              <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  mapContainer: {
    flex: 1,
  },
  radiusControl: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  radiusLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 8,
    fontWeight: '600',
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  radiusButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  ordersCount: {
    position: 'absolute',
    top: 140,
    left: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  ordersCountText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  orderDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.5,
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  orderDistance: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#a1a1aa',
  },
  orderInfo: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#e4e4e7',
    fontWeight: '500',
  },
  infoSubvalue: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  acceptButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
