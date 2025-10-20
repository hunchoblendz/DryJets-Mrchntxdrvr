import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CartItem } from '../../lib/store';
import { Card } from '../ui/Card';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { formatCurrency } from '../../lib/utils';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const totalPrice = item.unitPrice * item.quantity;

  return (
    <Card variant="default" style={styles.container}>
      <View style={styles.content}>
        {/* Item Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.serviceName}
          </Text>
          {item.specialInstructions && (
            <Text style={styles.instructions} numberOfLines={1}>
              📝 {item.specialInstructions}
            </Text>
          )}
          <Text style={styles.unitPrice}>
            {formatCurrency(item.unitPrice)} each
          </Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Total Price */}
        <Text style={styles.totalPrice}>{formatCurrency(totalPrice)}</Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  instructions: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  unitPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  quantity: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    minWidth: 80,
    textAlign: 'right',
  },
  removeButton: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    fontWeight: typography.fontWeight.semibold,
  },
});
