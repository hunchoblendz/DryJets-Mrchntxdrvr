import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeMarker as Marker, SafeCallout as Callout } from '../maps/SafeMapView';
import { colors, typography, spacing } from '../../theme/tokens';

interface DeliveryMarkerProps {
  latitude: number;
  longitude: number;
  addressLabel: string;
  address: string;
  onPress?: () => void;
}

export const DeliveryMarker: React.FC<DeliveryMarkerProps> = ({
  latitude,
  longitude,
  addressLabel,
  address,
  onPress,
}) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={addressLabel}
      identifier="delivery-location"
      onPress={onPress}
      pinColor={colors.success[500]}
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerDot}>
          <Text style={styles.markerIcon}>📍</Text>
        </View>
      </View>

      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{addressLabel}</Text>
          <Text style={styles.calloutAddress} numberOfLines={2}>
            {address}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success[500],
    borderWidth: 3,
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  calloutContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: spacing.md,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  calloutAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
