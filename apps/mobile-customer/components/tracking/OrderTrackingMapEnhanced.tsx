import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../../theme/tokens';
import { EnhancedDriverMarker } from './EnhancedDriverMarker';
import { InteractivePin } from './InteractivePin';
import { DriverProfileCard } from './DriverProfileCard';
import { OrderItemsCard } from './OrderItemsCard';
import { ETABanner } from './ETABanner';
import { StatusTimeline } from './StatusTimeline';
import { MapControlPanel } from './MapControlPanel';
import { DeliveryInstructions } from './DeliveryInstructions';
import { calculateDistance } from '../../lib/tracking/etaCalculation';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  photo?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleNumber: string;
  currentLatitude: number;
  currentLongitude: number;
  heading?: number;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface OrderTrackingMapEnhancedProps {
  driver: Driver;
  merchantLocation: { latitude: number; longitude: number; name: string; address: string };
  deliveryLocation: { latitude: number; longitude: number; name: string; address: string };
  customerLocation?: { latitude: number; longitude: number };
  eta: Date;
  orderItems: OrderItem[];
  orderTotal: number;
  merchantName: string;
  phoneNumber?: string;
  instructions?: string;
  timeline: TimelineEvent[];
  onCallDriver?: () => void;
  onMessageDriver?: () => void;
  onSaveInstructions?: (instructions: string) => void;
  onRefresh?: () => void;
}

export const OrderTrackingMapEnhanced: React.FC<OrderTrackingMapEnhancedProps> = ({
  driver,
  merchantLocation,
  deliveryLocation,
  customerLocation,
  eta,
  orderItems,
  orderTotal,
  merchantName,
  phoneNumber,
  instructions: initialInstructions = '',
  timeline,
  onCallDriver,
  onMessageDriver,
  onSaveInstructions,
  onRefresh,
}) => {
  const mapRef = useRef<MapView>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [satelliteEnabled, setSatelliteEnabled] = useState(false);

  // Calculate distance
  const distance = calculateDistance(
    { latitude: driver.currentLatitude, longitude: driver.currentLongitude },
    { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude }
  );

  // Original distance (driver to delivery at start)
  const originalDistance = calculateDistance(
    { latitude: driver.currentLatitude, longitude: driver.currentLongitude },
    { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude }
  ).miles;

  // Zoom to fit all markers
  const fitToMarkers = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: driver.currentLatitude, longitude: driver.currentLongitude },
          { latitude: merchantLocation.latitude, longitude: merchantLocation.longitude },
          { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
        ],
        {
          edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
          animated: true,
        }
      );
    }
  };

  useEffect(() => {
    fitToMarkers();
  }, []);

  const handleZoomIn = () => {
    // Implementation would use camera
  };

  const handleZoomOut = () => {
    // Implementation would use camera
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: (driver.currentLatitude + deliveryLocation.latitude) / 2,
          longitude: (driver.currentLongitude + deliveryLocation.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsTraffic={trafficEnabled}
        mapType={satelliteEnabled ? 'satellite' : 'standard'}
      >
        {/* Driver marker with animations */}
        <EnhancedDriverMarker
          latitude={driver.currentLatitude}
          longitude={driver.currentLongitude}
          driverId={driver.id}
          driverName={driver.name}
          driverRating={driver.rating}
          driverPhoto={driver.photo}
          vehicleMake={driver.vehicleMake}
          vehicleModel={driver.vehicleModel}
          vehicleNumber={driver.vehicleNumber}
          heading={driver.heading}
          eta={eta}
        />

        {/* Merchant location marker */}
        <InteractivePin
          latitude={merchantLocation.latitude}
          longitude={merchantLocation.longitude}
          id="merchant"
          title={merchantName}
          subtitle="Pickup location"
          icon="🏪"
          pinColor={colors.warning[500]}
          details={{
            address: merchantLocation.address,
          }}
        />

        {/* Delivery location marker */}
        <InteractivePin
          latitude={deliveryLocation.latitude}
          longitude={deliveryLocation.longitude}
          id="delivery"
          title={deliveryLocation.name}
          subtitle="Your delivery address"
          icon="📍"
          pinColor={colors.success[500]}
          isActive={true}
          details={{
            address: deliveryLocation.address,
            eta: 'Soon',
          }}
        />
      </MapView>

      {/* Map control panel */}
      <MapControlPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={fitToMarkers}
        onToggleTraffic={() => setTrafficEnabled(!trafficEnabled)}
        onToggleSatellite={() => setSatelliteEnabled(!satelliteEnabled)}
        trafficEnabled={trafficEnabled}
        satelliteEnabled={satelliteEnabled}
      />

      {/* ETA Banner */}
      <ETABanner
        eta={eta}
        distance={distance.miles}
        originalDistance={originalDistance}
        currentDistance={distance.miles}
        onDismiss={() => {}}
      />

      {/* Order items card */}
      <View style={styles.cardContainer}>
        <OrderItemsCard
          items={orderItems}
          orderTotal={orderTotal}
          merchantName={merchantName}
        />
      </View>

      {/* Status timeline */}
      <View style={styles.cardContainer}>
        <StatusTimeline
          events={timeline}
          currentEventId={timeline[timeline.length - 1]?.id}
        />
      </View>

      {/* Driver profile card (bottom) */}
      <View style={styles.driverCardContainer}>
        <DriverProfileCard
          driverId={driver.id}
          driverName={driver.name}
          driverRating={driver.rating}
          driverPhoto={driver.photo}
          vehicleMake={driver.vehicleMake}
          vehicleModel={driver.vehicleModel}
          vehicleNumber={driver.vehicleNumber}
          eta={eta}
          distance={distance.miles}
          onCallPress={onCallDriver}
          onMessagePress={onMessageDriver}
        />
      </View>

      {/* Delivery instructions modal */}
      <DeliveryInstructions
        visible={showInstructions}
        onDismiss={() => setShowInstructions(false)}
        onSave={(newInstructions) => {
          onSaveInstructions?.(newInstructions);
        }}
        initialInstructions={initialInstructions}
        deliveryAddress={deliveryLocation.address}
        contactNumber={phoneNumber}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  map: {
    flex: 1,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
  },
  driverCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
