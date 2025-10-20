import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';
import { colors, typography, spacing } from '../../theme/tokens';
import { getSpeedCategory } from '../../lib/tracking/etaCalculation';

interface RouteSegment {
  latitude: number;
  longitude: number;
  speed: number; // mph
}

interface AnimatedRouteProps {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  waypoints?: RouteSegment[];
  driverLocation?: { latitude: number; longitude: number };
  showTraffic?: boolean;
  strokeWidth?: number;
  onSegmentPress?: (segment: RouteSegment, index: number) => void;
}

export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({
  origin,
  destination,
  waypoints = [],
  driverLocation,
  showTraffic = true,
  strokeWidth = 4,
}) => {
  // Build complete route coordinates
  const routeCoordinates = useMemo(() => {
    return [origin, ...(waypoints || []), destination];
  }, [origin, destination, waypoints]);

  // Color segments based on traffic conditions
  const segments = useMemo(() => {
    const result: Array<{
      coords: Array<{ latitude: number; longitude: number }>;
      color: string;
      strokeWidth: number;
    }> = [];

    if (!showTraffic || waypoints.length === 0) {
      // Simple single route
      result.push({
        coords: routeCoordinates,
        color: colors.primary[500],
        strokeWidth,
      });
    } else {
      // Multiple segments with traffic colors
      for (let i = 0; i < waypoints.length; i++) {
        const start = i === 0 ? origin : waypoints[i - 1];
        const end = waypoints[i];
        const nextStart = i === waypoints.length - 1 ? destination : waypoints[i + 1];

        const currentSpeed = waypoints[i].speed || 25;
        const speedCategory = getSpeedCategory(currentSpeed);

        let segmentColor = colors.primary[500]; // Good/free-flowing
        if (speedCategory === 'medium') {
          segmentColor = colors.warning[500]; // Moderate traffic
        } else if (speedCategory === 'high') {
          segmentColor = colors.error[500]; // Heavy traffic
        }

        result.push({
          coords: [start, end, nextStart],
          color: segmentColor,
          strokeWidth,
        });
      }
    }

    return result;
  }, [routeCoordinates, showTraffic, waypoints, strokeWidth, origin, destination]);

  return (
    <>
      {segments.map((segment, index) => (
        <Polyline
          key={`route-segment-${index}`}
          coordinates={segment.coords}
          strokeColor={segment.color}
          strokeWidth={segment.strokeWidth}
          lineDashPattern={[1]}
          geodesic
          tappable={false}
        />
      ))}

      {/* Alternative: Simple polyline without segments */}
      {!showTraffic && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={colors.primary[500]}
          strokeWidth={strokeWidth}
          lineDashPattern={[1]}
          geodesic
        />
      )}

      {/* Traffic legend overlay */}
      {showTraffic && waypoints.length > 0 && (
        <View style={styles.trafficLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary[500] }]} />
            <Text style={styles.legendLabel}>Free-flowing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.warning[500] }]} />
            <Text style={styles.legendLabel}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.error[500] }]} />
            <Text style={styles.legendLabel}>Heavy</Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  trafficLegend: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
