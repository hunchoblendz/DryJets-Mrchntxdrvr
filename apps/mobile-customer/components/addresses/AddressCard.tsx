import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Address } from '../../types';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
}: AddressCardProps) {
  const handleCardPress = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={selectable ? 0.7 : 1}
      onPress={handleCardPress}
      disabled={!selectable}
    >
      <Card
        variant={selected ? 'elevated' : 'default'}
        style={[
          styles.container,
          selected && styles.containerSelected,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.labelRow}>
            <Ionicons
              name={getLabelIcon(address.label)}
              size={20}
              color={colors.primary[500]}
            />
            <Text style={styles.label}>{address.label}</Text>
            {address.isDefault && (
              <Badge label="Default" variant="primary" size="sm" />
            )}
            {selected && selectable && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
            )}
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.content}>
          <Text style={styles.streetAddress}>{address.streetAddress}</Text>
          {address.apartment && (
            <Text style={styles.apartment}>{address.apartment}</Text>
          )}
          <Text style={styles.cityState}>
            {address.city}, {address.state} {address.zipCode}
          </Text>

          {address.instructions && (
            <View style={styles.instructionsContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.instructions} numberOfLines={2}>
                {address.instructions}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!selectable && (
          <View style={styles.actions}>
            {!address.isDefault && (
              <TouchableOpacity style={styles.actionButton} onPress={onSetDefault}>
                <Ionicons name="star-outline" size={18} color={colors.text.secondary} />
                <Text style={styles.actionText}>Set as Default</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.status.error} />
              <Text style={[styles.actionText, styles.actionTextDanger]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function getLabelIcon(label: string): any {
  const labelLower = label.toLowerCase();
  if (labelLower.includes('home')) return 'home';
  if (labelLower.includes('work') || labelLower.includes('office')) return 'briefcase';
  if (labelLower.includes('gym') || labelLower.includes('fitness')) return 'fitness';
  if (labelLower.includes('school') || labelLower.includes('university')) return 'school';
  return 'location';
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  header: {
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.body.lg,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  content: {
    marginBottom: spacing.md,
  },
  streetAddress: {
    ...typography.body.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  apartment: {
    ...typography.body.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cityState: {
    ...typography.body.base,
    color: colors.text.secondary,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  instructions: {
    ...typography.body.sm,
    color: colors.text.secondary,
    flex: 1,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: colors.primary[500],
  },
  actionTextDanger: {
    color: colors.status.error,
  },
});
