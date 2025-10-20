import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography, layout } from '../../theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, customer, logout } = useAuthStore();

  const handleLogout = async () => {
    logout();
    router.replace('/auth/phone-login');
  };

  const menuItems = [
    { label: 'Edit Profile', icon: '✏️', route: '/settings/profile' },
    { label: 'Addresses', icon: '📍', route: '/settings/addresses' },
    { label: 'Payment Methods', icon: '💳', route: '/settings/payments' },
    { label: 'Subscriptions', icon: '🔁', route: '/settings/subscriptions' },
    { label: 'Wardrobe', icon: '👗', route: '/settings/wardrobe' },
    { label: 'Loyalty Points', icon: '⭐', route: '/settings/loyalty' },
    { label: 'Notifications', icon: '🔔', route: '/settings/notifications' },
    { label: 'Help & Support', icon: '❓', route: '/settings/support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card variant="elevated" style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer?.firstName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.name}>
                {customer?.firstName} {customer?.lastName}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsValue}>{customer?.loyaltyPoints || 0}</Text>
              <Text style={styles.pointsLabel}>Loyalty Points</Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItem}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  profileHeader: {
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  email: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  phone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsBox: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  pointsLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  menuContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  menuArrow: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
});
