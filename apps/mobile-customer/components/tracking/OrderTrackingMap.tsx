import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../../theme/tokens';
import { DriverMarker } from './DriverMarker';
import { DeliveryMarker } from './DeliveryMarker';
import { MerchantMarker } from './MerchantMarker';

interface Location {
  latitude: number;
  longitude: number;
}

interface OrderTrackingMapProps {
  driverLocation: Location;
  merchantLocation: Location;
  deliveryLocation: Location;
  driverName: string;
  driverRating: number;
  vehicleNumber: string;
  merchantName: string;
  merchantAddress: string;
  deliveryAddress: string;
  isLoading?: boolean;
  onDriverPress?: () => void;
  onMerchantPress?: () => void;
  onDeliveryPress?: () => void;
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  driverLocation,
  merchantLocation,
  deliveryLocation,
  driverName,
  driverRating,
  vehicleNumber,
  merchantName,
  merchantAddress,
  deliveryAddress,
  isLoading = false,
  onDriverPress,
  onMerchantPress,
  onDeliveryPress,
}) => {
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]);

  // Generate route between driver and delivery location
  useEffect(() => {
    if (driverLocation && deliveryLocation) {
      // Create a simple route (in production, use Google Directions API)
      const route: Location[] = [
        driverLocation,
        {
          latitude: (driverLocation.latitude + deliveryLocation.latitude) / 2,
          longitude: (driverLocation.longitude + deliveryLocation.longitude) / 2,
        },
        deliveryLocation,
      ];
      setRouteCoordinates(route);
    }
  }, [driverLocation, deliveryLocation]);

  // Auto-fit map to show all markers
  useEffect(() => {
    if (mapRef.current && driverLocation && deliveryLocation && merchantLocation) {
      setTimeout(() => {
        mapRef.current?.fitToSuppliedMarkers(
          ['driver-tracking', 'merchant-location', 'delivery-location'],
          {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [driverLocation, deliveryLocation, merchantLocation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
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
          latitude: driverLocation?.latitude || 0,
          longitude: driverLocation?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
      >
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary[500]}
            strokeWidth={3}
            lineDashPhase={0}
          />
        )}

        {/* Merchant marker */}
        {merchantLocation && (
          <MerchantMarker
            latitude={merchantLocation.latitude}
            longitude={merchantLocation.longitude}
            merchantName={merchantName}
            merchantAddress={merchantAddress}
            onPress={onMerchantPress}
          />
        )}

        {/* Driver marker */}
        {driverLocation && (
          <DriverMarker
            latitude={driverLocation.latitude}
            longitude={driverLocation.longitude}
            driverId="current-driver"
            driverName={driverName}
            driverRating={driverRating}
            vehicleNumber={vehicleNumber}
            onPress={onDriverPress}
          />
        )}

        {/* Delivery marker */}
        {deliveryLocation && (
          <DeliveryMarker
            latitude={deliveryLocation.latitude}
            longitude={deliveryLocation.longitude}
            addressLabel="Delivery Location"
            address={deliveryAddress}
            onPress={onDeliveryPress}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
});
