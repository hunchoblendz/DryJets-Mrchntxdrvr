import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeMarker as Marker, SafeCallout as Callout } from '../maps/SafeMapView';
import { colors, typography, spacing } from '../../theme/tokens';
import { createBounceAnimation, createFadeInAnimation } from '../../lib/tracking/mapAnimations';

interface InteractivePinProps {
  latitude: number;
  longitude: number;
  id: string;
  title: string;
  subtitle?: string;
  icon: string; // Emoji icon
  pinColor: string;
  onPress?: () => void;
  isActive?: boolean;
  details?: {
    address?: string;
    distance?: string;
    eta?: string;
  };
}

export const InteractivePin: React.FC<InteractivePinProps> = ({
  latitude,
  longitude,
  id,
  title,
  subtitle,
  icon,
  pinColor,
  onPress,
  isActive = false,
  details,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  // Bounce animation when active
  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const containerStyle = {
    width: 40,
    height: 50,
    backgroundColor: pinColor,
  };

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={title}
      identifier={id}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <Animated.View
        style={[
          styles.pinContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Glow effect when active */}
        {isActive && <View style={[styles.glow, { borderColor: pinColor }]} />}

        {/* Main pin */}
        <View style={[styles.pin, { backgroundColor: pinColor }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        {/* Pin pointer */}
        <View
          style={[
            styles.pointer,
            {
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: pinColor,
            },
          ]}
        />
      </Animated.View>

      {/* Enhanced callout with details */}
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutHeader}>
            <Text style={styles.calloutTitle}>{title}</Text>
            {subtitle && <Text style={styles.calloutSubtitle}>{subtitle}</Text>}
          </View>

          {details && (
            <>
              <View style={styles.divider} />
              <View style={styles.calloutDetails}>
                {details.distance && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>{details.distance}</Text>
                  </View>
                )}

                {details.address && (
                  <View style={[styles.detailRow, { marginTop: spacing.xs }]}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={[styles.detailValue, { maxWidth: 150 }]}>
                      {details.address}
                    </Text>
                  </View>
                )}

                {details.eta && (
                  <View style={[styles.detailRow, { marginTop: spacing.xs }]}>
                    <Text style={styles.detailLabel}>ETA:</Text>
                    <Text style={[styles.detailValue, { fontWeight: '600' }]}>
                      {details.eta}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    top: -5,
    left: -5,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  icon: {
    fontSize: 20,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
  },
  calloutContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 220,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  calloutHeader: {
    marginBottom: spacing.xs,
  },
  calloutTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  calloutSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginVertical: spacing.xs,
  },
  calloutDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
