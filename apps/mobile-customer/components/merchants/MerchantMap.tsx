import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeMapView as MapView, SafeMarker as Marker, PROVIDER_GOOGLE } from '../maps/SafeMapView';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface MerchantMapProps {
  latitude: number;
  longitude: number;
  merchantName: string;
  address: string;
}

export default function MerchantMap({
  latitude,
  longitude,
  merchantName,
  address,
}: MerchantMapProps) {
  const [mapError, setMapError] = useState(false);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleOpenInMaps = () => {
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = merchantName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleGetDirections = () => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  // Show configuration message if API key is missing
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.container}>
        <View style={styles.configContainer}>
          <Ionicons name="map-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.configTitle}>Map Unavailable</Text>
          <Text style={styles.configDescription}>
            Google Maps API key not configured. To enable maps:
          </Text>
          <View style={styles.configSteps}>
            <Text style={styles.configStep}>
              1. Get an API key from Google Cloud Console
            </Text>
            <Text style={styles.configStep}>
              2. Add to .env: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
            </Text>
            <Text style={styles.configStep}>3. Restart the development server</Text>
          </View>

          {/* Address Fallback */}
          <View style={styles.addressFallback}>
            <Ionicons name="location" size={20} color={colors.primary[500]} />
            <Text style={styles.addressText}>{address}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleOpenInMaps}>
              <Ionicons name="navigate" size={20} color={colors.primary[500]} />
              <Text style={styles.buttonText}>Open in Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleGetDirections}>
              <Ionicons name="compass" size={20} color={colors.primary[500]} />
              <Text style={styles.buttonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Show error fallback if map fails to load
  if (mapError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.warning} />
          <Text style={styles.errorTitle}>Unable to Load Map</Text>
          <Text style={styles.errorDescription}>
            There was an issue loading the map. You can still get directions.
          </Text>

          {/* Address */}
          <View style={styles.addressFallback}>
            <Ionicons name="location" size={20} color={colors.primary[500]} />
            <Text style={styles.addressText}>{address}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleOpenInMaps}>
              <Ionicons name="navigate" size={20} color={colors.primary[500]} />
              <Text style={styles.buttonText}>Open in Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleGetDirections}>
              <Ionicons name="compass" size={20} color={colors.primary[500]} />
              <Text style={styles.buttonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onError={() => setMapError(true)}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={merchantName}
          description={address}
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={40} color={colors.primary[500]} />
          </View>
        </Marker>
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleOpenInMaps}>
          <Ionicons name="navigate" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleGetDirections}>
          <Ionicons name="compass" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Address Bar */}
      <View style={styles.addressBar}>
        <Ionicons name="location" size={20} color={colors.primary[500]} />
        <Text style={styles.addressBarText} numberOfLines={1}>
          {address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    ...shadows.md,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  addressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addressBarText: {
    ...typography.body.sm,
    color: colors.text.primary,
    flex: 1,
  },
  configContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  configTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  configDescription: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  configSteps: {
    alignSelf: 'stretch',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  configStep: {
    ...typography.body.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  errorDescription: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  addressFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  addressText: {
    ...typography.body.base,
    color: colors.text.primary,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  buttonText: {
    ...typography.body.sm,
    color: colors.primary[700],
    fontWeight: '600',
  },
});
