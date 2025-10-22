import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeMarker as Marker, SafeCallout as Callout } from '../maps/SafeMapView';
import { colors, typography, spacing } from '../../theme/tokens';

interface MerchantMarkerProps {
  latitude: number;
  longitude: number;
  merchantName: string;
  merchantAddress: string;
  onPress?: () => void;
}

export const MerchantMarker: React.FC<MerchantMarkerProps> = ({
  latitude,
  longitude,
  merchantName,
  merchantAddress,
  onPress,
}) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={merchantName}
      identifier="merchant-location"
      onPress={onPress}
      pinColor={colors.warning[500]}
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerDot}>
          <Text style={styles.markerIcon}>🏪</Text>
        </View>
      </View>

      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{merchantName}</Text>
          <Text style={styles.calloutAddress} numberOfLines={2}>
            {merchantAddress}
          </Text>
          <Text style={styles.calloutStatus}>Pickup Location</Text>
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
    backgroundColor: colors.warning[500],
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
    marginBottom: spacing.xs,
  },
  calloutStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.warning[500],
    fontWeight: typography.fontWeight.semibold,
  },
});
