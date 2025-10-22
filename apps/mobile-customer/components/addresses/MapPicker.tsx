import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Button } from '../ui/Button';
import { SafeMapView as MapView, SafeMarker as Marker, PROVIDER_GOOGLE } from '../maps/SafeMapView';

interface MapPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address?: string) => void;
  onCancel: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapPicker({
  onLocationSelect,
  onCancel,
  initialLocation,
}: MapPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 37.7749, // Default to SF
    longitude: initialLocation?.longitude || -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation || { latitude: 37.7749, longitude: -122.4194 },
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Request location permissions and get current location on mount
  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. You can still manually select a location on the map.',
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMarkerPosition(newPosition);

      mapRef.current?.animateToRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Validation Error', 'Please enter an address to search');
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert(
        'Configuration Error',
        'Google Maps API key is not configured. Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.',
      );
      return;
    }

    try {
      setIsLoadingLocation(true);
      const geocodeResults = await Location.geocodeAsync(searchQuery);

      if (geocodeResults.length === 0) {
        Alert.alert('Not Found', 'Address not found. Please try a different search.');
        return;
      }

      const { latitude, longitude } = geocodeResults[0];
      const newPosition = { latitude, longitude };

      setMarkerPosition(newPosition);
      setRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      mapRef.current?.animateToRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search for address. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirm = async () => {
    try {
      // Reverse geocode to get address string
      const reverseGeocode = await Location.reverseGeocodeAsync(markerPosition);

      let addressString = '';
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        addressString = [addr.street, addr.streetNumber].filter(Boolean).join(' ');
      }

      onLocationSelect(markerPosition.latitude, markerPosition.longitude, addressString);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Still proceed with coordinates even if reverse geocoding fails
      onLocationSelect(markerPosition.latitude, markerPosition.longitude);
    }
  };

  // Show configuration message if API key is missing
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.container}>
        <View style={styles.configContainer}>
          <Ionicons name="map-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.configTitle}>Map Configuration Required</Text>
          <Text style={styles.configDescription}>
            To use the map picker feature, you need to configure Google Maps API:
          </Text>
          <View style={styles.configSteps}>
            <Text style={styles.configStep}>
              1. Get an API key from Google Cloud Console
            </Text>
            <Text style={styles.configStep}>
              2. Enable Maps SDK for Android and iOS
            </Text>
            <Text style={styles.configStep}>
              3. Add to .env: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
            </Text>
            <Text style={styles.configStep}>4. Restart the development server</Text>
          </View>
          <Button
            title="Go Back"
            onPress={onCancel}
            variant="primary"
            size="lg"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an address..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchAddress}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchAddress}
          disabled={isLoadingLocation}
        >
          <Ionicons name="search" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker coordinate={markerPosition} draggable onDragEnd={handleMapPress}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={48} color={colors.primary[500]} />
          </View>
        </Marker>
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
      >
        <Ionicons
          name="locate"
          size={24}
          color={isLoadingLocation ? colors.text.tertiary : colors.primary[500]}
        />
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
        <Text style={styles.infoText}>
          Tap anywhere on the map or drag the marker to select your location
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="ghost"
          size="lg"
        />
        <Button
          title="Confirm Location"
          onPress={handleConfirm}
          variant="primary"
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
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
    zIndex: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body.base,
    color: colors.text.primary,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 180,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  infoText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.md,
  },
  configContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  configTitle: {
    ...typography.heading.h2,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  configDescription: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  configSteps: {
    alignSelf: 'stretch',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  configStep: {
    ...typography.body.base,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
