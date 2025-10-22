import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/tokens';
import { Button } from '../ui/Button';

export default function EmptyCart() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.text.tertiary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Your cart is empty</Text>

        {/* Description */}
        <Text style={styles.description}>
          Browse our merchants and add services to your cart to get started.
        </Text>

        {/* CTA Button */}
        <Button
          title="Browse Merchants"
          onPress={() => router.push('/(tabs)/')}
          variant="primary"
          size="lg"
        />

        {/* Secondary Action */}
        <Button
          title="View Your Orders"
          onPress={() => router.push('/(tabs)/orders')}
          variant="ghost"
          size="md"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
