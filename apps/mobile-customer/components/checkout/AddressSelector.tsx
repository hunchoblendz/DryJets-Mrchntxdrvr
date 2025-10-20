import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Address } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
  onAddNew: () => void;
  label: string;
  description?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
  label,
  description,
}) => {
  const renderAddressCard = ({ item }: { item: Address }) => {
    const isSelected = selectedAddressId === item.id;
    const fullAddress = `${item.streetAddress}${
      item.apartment ? `, ${item.apartment}` : ''
    }, ${item.city}, ${item.state} ${item.zipCode}`;

    return (
      <TouchableOpacity
        onPress={() => onSelect(item.id)}
        style={[
          styles.addressCard,
          isSelected && styles.addressCardSelected,
        ]}
      >
        <Card
          variant={isSelected ? 'elevated' : 'default'}
          style={styles.cardContent}
        >
          <View style={styles.addressHeader}>
            <View style={styles.addressInfo}>
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>{item.label}</Text>
              </View>
              {isSelected && (
                <Badge label="Selected" variant="primary" size="sm" />
              )}
            </View>
          </View>

          <Text style={styles.addressText} numberOfLines={2}>
            {fullAddress}
          </Text>

          {item.instructions && (
            <Text style={styles.instructionsText} numberOfLines={1}>
              📝 {item.instructions}
            </Text>
          )}

          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No addresses saved</Text>
          <Button
            title="Add an Address"
            onPress={onAddNew}
            variant="secondary"
            style={styles.addButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={renderAddressCard}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          />

          <Button
            title="Add Another Address"
            variant="ghost"
            onPress={onAddNew}
            fullWidth
            style={styles.addNewButton}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  addressCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  addressCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  cardContent: {
    position: 'relative',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  labelBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  addNewButton: {
    marginTop: spacing.md,
  },
});
