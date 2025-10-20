import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { colors, typography, spacing } from '../../theme/tokens';
import {
  createPulseAnimation,
  animateMarkerPosition,
  createRotationAnimation,
} from '../../lib/tracking/mapAnimations';
import { formatTimeAMPM } from '../../lib/tracking/etaCalculation';

interface EnhancedDriverMarkerProps {
  latitude: number;
  longitude: number;
  driverId: string;
  driverName: string;
  driverRating: number;
  vehicleNumber: string;
  vehicleMake?: string;
  vehicleModel?: string;
  driverPhoto?: string;
  heading?: number;
  eta?: Date;
  onPress?: () => void;
}

export const EnhancedDriverMarker: React.FC<EnhancedDriverMarkerProps> = ({
  latitude,
  longitude,
  driverId,
  driverName,
  driverRating,
  vehicleNumber,
  vehicleMake,
  vehicleModel,
  driverPhoto,
  heading = 0,
  eta,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(heading)).current;
  const positionAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Start pulse animation on mount
  useEffect(() => {
    const { pulse, startPulse } = createPulseAnimation();
    startPulse();
    // Bind to our ref
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animate heading rotation
  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: heading,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [heading]);

  const rotationInterpolation = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [1, 1.3],
    outputRange: [1, 1.3],
  });

  const ratingColor =
    driverRating >= 4.5
      ? colors.success[500]
      : driverRating >= 4.0
      ? colors.warning[500]
      : colors.error[500];

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={driverName}
      identifier={`driver-${driverId}`}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Pulse ring background */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      {/* Main marker container */}
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [
              { rotate: rotationInterpolation },
            ],
          },
        ]}
      >
        <View style={styles.markerOuter}>
          <View style={[styles.markerInner, { backgroundColor: colors.primary[500] }]}>
            {driverPhoto ? (
              <Image
                source={{ uri: driverPhoto }}
                style={styles.driverPhoto}
              />
            ) : (
              <Text style={styles.markerIcon}>🚗</Text>
            )}
          </View>

          {/* Rating badge */}
          <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
            <Text style={styles.ratingText}>★{driverRating.toFixed(1)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Direction indicator */}
      <View
        style={[
          styles.directionIndicator,
          {
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: colors.primary[500],
          },
        ]}
      />

      {/* Enhanced callout */}
      <Callout>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutHeader}>
            <View style={styles.calloutTitleRow}>
              <Text style={styles.calloutTitle}>{driverName}</Text>
              <View style={[styles.ratingPill, { backgroundColor: ratingColor }]}>
                <Text style={styles.ratingPillText}>★ {driverRating.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.calloutContent}>
            <View style={styles.calloutRow}>
              <Text style={styles.calloutLabel}>Vehicle:</Text>
              <Text style={styles.calloutValue}>
                {vehicleMake ? `${vehicleMake} ${vehicleModel}` : 'Vehicle'}
              </Text>
            </View>

            <View style={styles.calloutRow}>
              <Text style={styles.calloutLabel}>Plate:</Text>
              <Text style={styles.calloutValue}>{vehicleNumber}</Text>
            </View>

            {eta && (
              <View style={styles.calloutRow}>
                <Text style={styles.calloutLabel}>ETA:</Text>
                <Text style={[styles.calloutValue, { color: colors.primary[500], fontWeight: '600' }]}>
                  {formatTimeAMPM(eta)}
                </Text>
              </View>
            )}

            <View style={styles.calloutRow}>
              <Text style={styles.calloutLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.success[100] }]}>
                <View style={[styles.statusDot, { backgroundColor: colors.success[500] }]} />
                <Text style={[styles.statusText, { color: colors.success[700] }]}>
                  En Route
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  pulseRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    position: 'absolute',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  markerOuter: {
    position: 'relative',
  },
  markerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  driverPhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  markerIcon: {
    fontSize: 24,
  },
  ratingBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.background.primary,
  },
  directionIndicator: {
    position: 'absolute',
    top: 36,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
  },
  calloutContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 240,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  calloutHeader: {
    marginBottom: spacing.xs,
  },
  calloutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  calloutTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  ratingPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.background.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginVertical: spacing.xs,
  },
  calloutContent: {
    gap: spacing.xs,
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  calloutLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  calloutValue: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
