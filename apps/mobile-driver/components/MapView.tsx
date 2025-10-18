import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Order {
  id: string;
  orderNumber: string;
  merchantLocation?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  deliveryAddress?: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  distanceKm?: number;
}

interface DriverMapViewProps {
  orders?: Order[];
  showRadius?: boolean;
  radiusKm?: number;
  onMarkerPress?: (order: Order) => void;
  followDriver?: boolean;
}

export default function DriverMapView({
  orders = [],
  showRadius = false,
  radiusKm = 10,
  onMarkerPress,
  followDriver = true,
}: DriverMapViewProps) {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setLocation(coords);
        setLoading(false);

        // Watch location updates if following driver
        if (followDriver) {
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 10000, // Update every 10 seconds
              distanceInterval: 50, // Update every 50 meters
            },
            (newLocation) => {
              const newCoords = {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              };
              setLocation(newCoords);

              // Animate map to new position
              if (mapRef.current && followDriver) {
                mapRef.current.animateToRegion({
                  ...newCoords,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              }
            },
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get location');
        setLoading(false);
      }
    })();
  }, [followDriver]);

  useEffect(() => {
    // Fit map to show all markers when orders change
    if (mapRef.current && location && orders.length > 0) {
      const coordinates = [
        location,
        ...orders
          .map((order) => {
            if (order.merchantLocation) {
              return {
                latitude: order.merchantLocation.latitude,
                longitude: order.merchantLocation.longitude,
              };
            }
            return null;
          })
          .filter((coord): coord is Coordinate => coord !== null),
      ];

      if (coordinates.length > 1) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    }
  }, [orders, location]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Access Required</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.errorHint}>
          Please enable location permissions in your device settings
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Not Available</Text>
        <Text style={styles.errorText}>Unable to get your current location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...location,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={false}
        loadingEnabled={true}
      >
        {/* Driver Location Marker (custom) */}
        <Marker
          coordinate={location}
          title="You are here"
          description="Your current location"
          pinColor="#10b981"
        >
          <View style={styles.driverMarker}>
            <Text style={styles.driverMarkerText}>🚗</Text>
          </View>
        </Marker>

        {/* Radius Circle */}
        {showRadius && (
          <Circle
            center={location}
            radius={radiusKm * 1000} // Convert km to meters
            strokeColor="rgba(16, 185, 129, 0.5)"
            fillColor="rgba(16, 185, 129, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Order Markers */}
        {orders.map((order, index) => {
          if (!order.merchantLocation) return null;

          return (
            <Marker
              key={order.id}
              coordinate={{
                latitude: order.merchantLocation.latitude,
                longitude: order.merchantLocation.longitude,
              }}
              title={order.orderNumber}
              description={`${order.merchantLocation.name} ${
                order.distanceKm ? `(${order.distanceKm.toFixed(1)}km away)` : ''
              }`}
              onPress={() => onMarkerPress && onMarkerPress(order)}
            >
              <View style={styles.orderMarker}>
                <Text style={styles.orderMarkerText}>{index + 1}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Pickup Locations</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#a1a1aa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 280,
  },
  driverMarker: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverMarkerText: {
    fontSize: 20,
  },
  orderMarker: {
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderMarkerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#e4e4e7',
  },
});
