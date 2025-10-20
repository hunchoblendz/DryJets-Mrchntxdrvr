import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { colors, typography, spacing } from '../../theme/tokens';

interface DriverMarkerProps {
  latitude: number;
  longitude: number;
  driverId: string;
  driverName: string;
  driverRating: number;
  vehicleNumber: string;
  onPress?: () => void;
}

export const DriverMarker: React.FC<DriverMarkerProps> = ({
  latitude,
  longitude,
  driverId,
  driverName,
  driverRating,
  vehicleNumber,
  onPress,
}) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={driverName}
      identifier={`driver-${driverId}`}
      onPress={onPress}
      pinColor={colors.primary[500]}
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerDot}>
          <Text style={styles.markerIcon}>🚗</Text>
        </View>
      </View>

      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{driverName}</Text>
          <View style={styles.calloutRow}>
            <Text style={styles.calloutLabel}>Rating:</Text>
            <Text style={styles.calloutValue}>★ {driverRating.toFixed(1)}</Text>
          </View>
          <View style={styles.calloutRow}>
            <Text style={styles.calloutLabel}>Vehicle:</Text>
            <Text style={styles.calloutValue}>{vehicleNumber}</Text>
          </View>
          <View style={styles.calloutRow}>
            <Text style={styles.calloutLabel}>Status:</Text>
            <Text style={styles.calloutValue}>En Route</Text>
          </View>
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
    backgroundColor: colors.primary[500],
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
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  calloutLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  calloutValue: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
});
