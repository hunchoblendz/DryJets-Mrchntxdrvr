import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { driverApi } from '../../lib/api';
import { socketService } from '../../lib/socket';
import { pushNotificationService, PushNotification } from '../../lib/pushNotifications';
import * as Notifications from 'expo-notifications';

// Hardcoded driver ID for demo - in real app would come from auth
const DRIVER_ID = 'driver-123';

interface DriverStats {
  totalTrips: number;
  totalEarnings: number;
  rating: number;
  todayTrips: number;
  todayEarnings: number;
}

interface ActiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  merchantLocation?: {
    name: string;
    address: string;
  };
  deliveryAddress?: {
    address: string;
    city: string;
  };
}

export default function HomeScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    loadData();
    initializeSocket();
    initializePushNotifications();

    return () => {
      // Cleanup on unmount
      if (locationSubscription) {
        locationSubscription.remove();
      }
      socketService.disconnect();
      pushNotificationService.removeNotificationListeners();
    };
  }, []);

  const initializeSocket = async () => {
    try {
      await socketService.connect(DRIVER_ID);
      console.log('Socket connected successfully');

      // Listen for new orders
      const unsubscribeOrderAssigned = socketService.on('order:assigned', (data) => {
        Alert.alert(
          'New Order!',
          `You have been assigned order ${data.orderNumber}`,
          [{ text: 'View', onPress: () => loadData() }]
        );
      });

      // Listen for order updates
      const unsubscribeStatusChanged = socketService.on('order:statusChanged', (data) => {
        console.log('Order status changed:', data);
        loadData(); // Refresh data
      });

      // Listen for notifications
      const unsubscribeNotification = socketService.on('notification', (data) => {
        Alert.alert(data.title, data.message);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  };

  const initializePushNotifications = async () => {
    try {
      // Register for push notifications
      const token = await pushNotificationService.registerForPushNotifications(DRIVER_ID);
      if (token) {
        console.log('Push notifications enabled:', token);
      }

      // Set up notification listeners
      pushNotificationService.setupNotificationListeners(
        // When notification received (foreground)
        (notification: PushNotification) => {
          console.log('Notification received:', notification);
          // Optionally show an in-app alert
        },
        // When notification tapped (user interaction)
        (response: Notifications.NotificationResponse) => {
          console.log('Notification tapped:', response);
          const data = response.notification.request.content.data;

          // Navigate based on notification type
          if (data.orderId) {
            // Navigate to order details or refresh active orders
            loadData();
          }
        }
      );
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const loadData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        driverApi.getStats(DRIVER_ID),
        driverApi.getActiveOrders(DRIVER_ID),
      ]);
      setStats(statsResponse.data);
      setActiveOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startLocationBroadcasting = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to broadcast your location');
        return;
      }

      // Start watching location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // Update every 15 seconds
          distanceInterval: 100, // Or when driver moves 100 meters
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          console.log('Broadcasting location:', latitude, longitude);

          // Update backend
          driverApi.updateLocation(DRIVER_ID, latitude, longitude).catch(console.error);

          // Broadcast via socket
          if (socketService.isConnected()) {
            // Find active order ID if any
            const activeOrderId = activeOrders.length > 0 ? activeOrders[0].id : undefined;
            socketService.sendLocationUpdate(DRIVER_ID, latitude, longitude, activeOrderId);
          }
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location broadcasting:', error);
    }
  };

  const stopLocationBroadcasting = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const toggleAvailability = async () => {
    if (activeOrders.length > 0 && isAvailable) {
      Alert.alert(
        'Active Orders',
        'You have active orders. Please complete them before going offline.',
        [{ text: 'OK' }],
      );
      return;
    }

    setIsLoading(true);
    try {
      await driverApi.updateAvailability(DRIVER_ID, !isAvailable);
      const newAvailability = !isAvailable;
      setIsAvailable(newAvailability);

      // Start or stop location broadcasting based on availability
      if (newAvailability) {
        await startLocationBroadcasting();
      } else {
        stopLocationBroadcasting();
      }

      Alert.alert(
        'Success',
        newAvailability
          ? "You're now available to receive orders"
          : "You're now offline",
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update availability',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subGreeting}>Ready to earn today?</Text>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.availabilityTitle}>Availability Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isAvailable ? '#10b981' : '#ef4444',
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isAvailable ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {isAvailable
                ? "You're accepting orders"
                : "You're not accepting orders"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              disabled={isLoading}
              trackColor={{ false: '#3f3f46', true: '#10b981' }}
              thumbColor={isAvailable ? '#fff' : '#f4f4f5'}
            />
          </View>

          {!isAvailable && (
            <Text style={styles.availabilityHint}>
              Turn on to start receiving order requests
            </Text>
          )}
        </View>

        {/* Today's Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Today's Performance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.todayTrips || 0}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  ${(stats.todayEarnings || 0).toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stats.rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            {activeOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => {
                  // Navigate to order details
                  Alert.alert('Order Details', `Order ${order.orderNumber}`);
                }}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.customerName}>
                  {order.customer.firstName} {order.customer.lastName}
                </Text>
                {order.merchantLocation && (
                  <Text style={styles.orderLocation}>
                    📍 Pickup: {order.merchantLocation.name}
                  </Text>
                )}
                {order.deliveryAddress && (
                  <Text style={styles.orderLocation}>
                    🏠 Deliver: {order.deliveryAddress.address},{' '}
                    {order.deliveryAddress.city}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All-Time Stats */}
        {stats && (
          <View style={styles.allTimeStats}>
            <Text style={styles.sectionTitle}>All-Time Stats</Text>
            <View style={styles.allTimeGrid}>
              <View style={styles.allTimeStat}>
                <Text style={styles.allTimeValue}>{stats.totalTrips}</Text>
                <Text style={styles.allTimeLabel}>Total Deliveries</Text>
              </View>
              <View style={styles.allTimeStat}>
                <Text style={styles.allTimeValue}>
                  ${stats.totalEarnings.toFixed(2)}
                </Text>
                <Text style={styles.allTimeLabel}>Total Earnings</Text>
              </View>
            </View>
          </View>
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
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  availabilityCard: {
    backgroundColor: '#18181b',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#e4e4e7',
  },
  availabilityHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#71717a',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 4,
  },
  ordersContainer: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  customerName: {
    fontSize: 14,
    color: '#e4e4e7',
    marginBottom: 8,
  },
  orderLocation: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  allTimeStats: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  allTimeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allTimeStat: {
    flex: 1,
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  allTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  allTimeLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 4,
  },
});
