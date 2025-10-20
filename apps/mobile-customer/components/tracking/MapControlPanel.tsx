import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface MapControlPanelProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  onToggleTraffic?: () => void;
  onToggleSatellite?: () => void;
  trafficEnabled?: boolean;
  satelliteEnabled?: boolean;
}

export const MapControlPanel: React.FC<MapControlPanelProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onToggleTraffic,
  onToggleSatellite,
  trafficEnabled = false,
  satelliteEnabled = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuAnim = new Animated.Value(0);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    Animated.timing(menuAnim, {
      toValue: showMenu ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={styles.container}>
      {/* Menu items (shown when expanded) */}
      {showMenu && (
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: menuOpacity,
              transform: [{ scale: menuScale }],
            },
          ]}
        >
          <Pressable style={styles.menuItem} onPress={() => {
            onToggleTraffic?.();
            setShowMenu(false);
          }}>
            <Text style={styles.menuItemIcon}>{trafficEnabled ? '🛣️' : '🛣️'}</Text>
            <Text style={styles.menuItemLabel}>
              {trafficEnabled ? 'Hide Traffic' : 'Show Traffic'}
            </Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => {
            onToggleSatellite?.();
            setShowMenu(false);
          }}>
            <Text style={styles.menuItemIcon}>{satelliteEnabled ? '🛰️' : '🗺️'}</Text>
            <Text style={styles.menuItemLabel}>
              {satelliteEnabled ? 'Map View' : 'Satellite'}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Control buttons */}
      <View style={styles.controls}>
        {/* Zoom in */}
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
          onPress={onZoomIn}
        >
          <Text style={styles.controlIcon}>➕</Text>
        </Pressable>

        {/* Zoom out */}
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
          onPress={onZoomOut}
        >
          <Text style={styles.controlIcon}>➖</Text>
        </Pressable>

        {/* Center/Recenter */}
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.controlButtonPressed,
          ]}
          onPress={onCenter}
        >
          <Text style={styles.controlIcon}>📍</Text>
        </Pressable>

        {/* Menu button */}
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            styles.menuButton,
            pressed && styles.controlButtonPressed,
            showMenu && styles.menuButtonActive,
          ]}
          onPress={toggleMenu}
        >
          <Text style={styles.controlIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Info tooltip */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>Tap controls to navigate the map</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg,
    gap: spacing.md,
  },
  menu: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  controls: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.background.secondary,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  controlButtonPressed: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  controlIcon: {
    fontSize: 20,
  },
  menuButton: {
    marginTop: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.background.secondary,
    paddingTop: spacing.sm,
  },
  menuButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    minWidth: 180,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    flex: 1,
  },
});
