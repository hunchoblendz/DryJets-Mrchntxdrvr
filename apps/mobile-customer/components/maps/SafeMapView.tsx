/**
 * SafeMapView - Expo Go Compatible Map Wrapper
 *
 * This component wraps react-native-maps to provide graceful degradation
 * when running in Expo Go (which doesn't support native map modules).
 *
 * In Development Build: Full MapView functionality
 * In Expo Go: Shows fallback UI with instructions
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

/**
 * Check if running in Expo Go
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * Check if Maps SDK is available
 * Always returns false since react-native-maps is not installed for Expo Go
 * When you need maps, reinstall the package and create a development build
 */
export const isMapsAvailable = (): boolean => {
  // Package is not installed to avoid Expo Go compatibility issues
  return false;
};

// Fallback component shown in Expo Go
function MapFallback({ style, children }: any) {
  return (
    <View style={[styles.fallbackContainer, style]}>
      <View style={styles.fallbackContent}>
        <Ionicons name="map-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.fallbackTitle}>Map View Requires Development Build</Text>
        <Text style={styles.fallbackDescription}>
          Interactive maps use native modules not available in Expo Go.
        </Text>
        <View style={styles.fallbackSteps}>
          <Text style={styles.fallbackStep}>To use maps:</Text>
          <Text style={styles.fallbackStep}>1. Create a development build:</Text>
          <Text style={styles.fallbackStepCode}>   npx expo prebuild</Text>
          <Text style={styles.fallbackStepCode}>   npx expo run:ios</Text>
          <Text style={styles.fallbackStep}>
            2. For now, you can test other features in Expo Go!
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

// Type definitions for map components
export type MapViewProps = any;
export type MarkerProps = any;
export type PolylineProps = any;
export type CalloutProps = any;

/**
 * Safe MapView that works in both Expo Go and Development Builds
 */
export const SafeMapView = React.forwardRef((props: MapViewProps, ref: any) => {
  // Always show fallback since react-native-maps is not installed
  return <MapFallback style={props.style}>{props.children}</MapFallback>;
});

/**
 * Safe Marker component
 */
export function SafeMarker(props: MarkerProps) {
  // Always return null since react-native-maps is not installed
  return null;
}

/**
 * Safe Polyline component
 */
export function SafePolyline(props: PolylineProps) {
  // Always return null since react-native-maps is not installed
  return null;
}

/**
 * Safe Callout component
 */
export function SafeCallout(props: CalloutProps) {
  // Always return null since react-native-maps is not installed
  return null;
}

/**
 * Export PROVIDER_GOOGLE constant
 * Just use the string value - react-native-maps uses 'google' internally
 */
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    padding: spacing.xl,
    maxWidth: 400,
  },
  fallbackTitle: {
    ...typography.heading.h3,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  fallbackDescription: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  fallbackSteps: {
    alignSelf: 'stretch',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  fallbackStep: {
    ...typography.body.sm,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  fallbackStepCode: {
    ...typography.body.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
});
