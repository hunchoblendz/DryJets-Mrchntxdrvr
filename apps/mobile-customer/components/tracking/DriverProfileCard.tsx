import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable, Linking, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { colors, typography, spacing } from '../../theme/tokens';
import { formatETA } from '../../lib/tracking/etaCalculation';

interface DriverProfileCardProps {
  driverId: string;
  driverName: string;
  driverRating: number;
  driverPhoto?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleNumber: string;
  eta?: Date;
  distance?: number;
  onCallPress?: () => void;
  onMessagePress?: () => void;
  onPress?: () => void;
  isExpanded?: boolean;
}

export const DriverProfileCard: React.FC<DriverProfileCardProps> = ({
  driverId,
  driverName,
  driverRating,
  driverPhoto,
  vehicleMake,
  vehicleModel,
  vehicleNumber,
  eta,
  distance,
  onCallPress,
  onMessagePress,
  onPress,
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      if (translationY > 50) {
        // Swipe down - collapse
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        setExpanded(false);
      } else {
        // Snap back
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const ratingColor =
    driverRating >= 4.5
      ? colors.success[500]
      : driverRating >= 4.0
      ? colors.warning[500]
      : colors.error[500];

  const handleCallDriver = () => {
    Alert.alert(
      'Call Driver',
      'Would you like to call the driver?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Call',
          onPress: () => {
            if (onCallPress) {
              onCallPress();
            }
          },
        },
      ]
    );
  };

  const handleMessageDriver = () => {
    if (onMessagePress) {
      onMessagePress();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle}>
          <View style={styles.dragIndicator} />
        </View>

        {/* Main profile section */}
        <Pressable
          style={styles.profileSection}
          onPress={() => {
            setExpanded(!expanded);
            onPress?.();
          }}
        >
          <View style={styles.profileHeader}>
            {/* Driver photo */}
            <View style={styles.photoContainer}>
              {driverPhoto ? (
                <Image source={{ uri: driverPhoto }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Text style={styles.photoIcon}>👤</Text>
                </View>
              )}

              {/* Rating badge */}
              <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
                <Text style={styles.ratingText}>★ {driverRating.toFixed(1)}</Text>
              </View>
            </View>

            {/* Driver info */}
            <View style={styles.infoContainer}>
              <Text style={styles.driverName}>{driverName}</Text>
              <Text style={styles.status}>En Route • 4.2 km away</Text>

              {eta && (
                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>{formatETA(eta)}</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.primary[100] }]}
                onPress={handleCallDriver}
              >
                <Text style={styles.actionIcon}>📞</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.primary[100] }]}
                onPress={handleMessageDriver}
              >
                <Text style={styles.actionIcon}>💬</Text>
              </Pressable>
            </View>
          </View>

          {/* Expanded content */}
          {expanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

              {/* Vehicle section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
                <View style={styles.sectionContent}>
                  {vehicleMake && vehicleModel && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Make & Model:</Text>
                      <Text style={styles.value}>
                        {vehicleMake} {vehicleModel}
                      </Text>
                    </View>
                  )}

                  <View style={styles.row}>
                    <Text style={styles.label}>License Plate:</Text>
                    <Text style={styles.licensePlate}>{vehicleNumber}</Text>
                  </View>
                </View>
              </View>

              {/* Trip stats section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Trip Info</Text>
                <View style={styles.statsGrid}>
                  {eta && (
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>ETA</Text>
                      <Text style={styles.statValue}>{formatETA(eta)}</Text>
                    </View>
                  )}

                  {distance !== undefined && (
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Distance</Text>
                      <Text style={styles.statValue}>{distance.toFixed(1)} mi</Text>
                    </View>
                  )}

                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Rating</Text>
                    <Text style={[styles.statValue, { color: ratingColor }]}>
                      ★ {driverRating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Safety tip section */}
              <View style={styles.safetyTip}>
                <Text style={styles.safetyTipIcon}>🛡️</Text>
                <View style={styles.safetyTipContent}>
                  <Text style={styles.safetyTipTitle}>Safety Tip</Text>
                  <Text style={styles.safetyTipText}>
                    Verify driver identity before exchanging items
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background.secondary,
  },
  profileSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  photoPlaceholder: {
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 28,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background.primary,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  status: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  etaBadge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.success[700],
  },
  actionButtons: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  actionIcon: {
    fontSize: 20,
  },
  expandedContent: {
    marginTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  licensePlate: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: '700',
    letterSpacing: 1,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
  },
  safetyTip: {
    backgroundColor: colors.warning[100],
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  safetyTipIcon: {
    fontSize: 24,
  },
  safetyTipContent: {
    flex: 1,
    gap: 4,
  },
  safetyTipTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.warning[900],
  },
  safetyTipText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning[800],
    lineHeight: 16,
  },
});
