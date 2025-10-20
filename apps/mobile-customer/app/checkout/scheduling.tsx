import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useCartStore } from '../../lib/store';

export default function SchedulingScreen() {
  const router = useRouter();
  const { setIsASAP, setScheduledPickupAt } = useCartStore();
  const [pickupType, setPickupType] = useState<'asap' | 'scheduled'>('asap');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleContinue = () => {
    if (pickupType === 'asap') {
      setIsASAP(true);
      setScheduledPickupAt(null);
    } else {
      setIsASAP(false);
      // TODO: When date picker is implemented, use the selected date
      // For now, keep it as null
      setScheduledPickupAt(selectedDate);
    }
    router.push('/checkout/payment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Pickup</Text>
          <Text style={styles.subtitle}>When should we pick up your order?</Text>
        </View>

        {/* Pickup Type Selection */}
        <View style={styles.content}>
          {/* ASAP Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              pickupType === 'asap' && styles.optionCardSelected,
            ]}
            onPress={() => setPickupType('asap')}
          >
            <Card
              variant={pickupType === 'asap' ? 'elevated' : 'default'}
              style={styles.optionContent}
            >
              <View style={styles.optionHeader}>
                <View>
                  <Text style={styles.optionTitle}>ASAP</Text>
                  <Text style={styles.optionSubtitle}>
                    Usually within 1-2 hours
                  </Text>
                </View>
                {pickupType === 'asap' && (
                  <Badge label="Selected" variant="primary" size="sm" />
                )}
              </View>
            </Card>
          </TouchableOpacity>

          {/* Scheduled Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              pickupType === 'scheduled' && styles.optionCardSelected,
            ]}
            onPress={() => setPickupType('scheduled')}
          >
            <Card
              variant={pickupType === 'scheduled' ? 'elevated' : 'default'}
              style={styles.optionContent}
            >
              <View style={styles.optionHeader}>
                <View>
                  <Text style={styles.optionTitle}>Schedule for Later</Text>
                  <Text style={styles.optionSubtitle}>
                    Pick your preferred time
                  </Text>
                </View>
                {pickupType === 'scheduled' && (
                  <Badge label="Selected" variant="primary" size="sm" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Scheduled Details (if selected) */}
        {pickupType === 'scheduled' && (
          <View style={styles.content}>
            <Text style={styles.infoText}>
              📅 Date/time picker coming soon. For now, we'll schedule your pickup ASAP.
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.content}>
          <Card variant="outlined">
            <Text style={styles.infoBoxText}>
              ⏱️ The merchant will confirm availability once you place your order.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="Back"
          variant="outline"
          fullWidth
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Button
          title="Continue to Payment"
          fullWidth
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  optionCard: {
    borderRadius: 12,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  optionContent: {
    paddingVertical: spacing.lg,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  optionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  infoBoxText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
});
