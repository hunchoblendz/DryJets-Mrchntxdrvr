import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, type CartItem as CartItemType } from '../../lib/store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme/tokens';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCartStore();
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState(item.specialInstructions || '');

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeItem(item.serviceId),
          },
        ],
      );
      return;
    }

    updateItem(item.serviceId, { quantity: newQuantity });
  };

  const handleSaveInstructions = () => {
    updateItem(item.serviceId, { specialInstructions: instructions });
    setShowInstructions(false);
  };

  const totalPrice = item.unitPrice * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.unitPrice}>${item.unitPrice.toFixed(2)} each</Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.quantity - 1)}
          >
            <Ionicons name="remove" size={20} color={colors.primary[500]} />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Total Price */}
        <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeItem(item.serviceId)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.status.error} />
        </TouchableOpacity>
      </View>

      {/* Special Instructions */}
      {item.specialInstructions && !showInstructions && (
        <TouchableOpacity
          style={styles.instructionsPreview}
          onPress={() => setShowInstructions(true)}
        >
          <Ionicons name="chatbox-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.instructionsPreviewText} numberOfLines={1}>
            {item.specialInstructions}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add/Edit Instructions Toggle */}
      {!showInstructions && (
        <TouchableOpacity
          style={styles.addInstructionsButton}
          onPress={() => setShowInstructions(true)}
        >
          <Ionicons name="chatbox-outline" size={16} color={colors.primary[500]} />
          <Text style={styles.addInstructionsText}>
            {item.specialInstructions ? 'Edit instructions' : 'Add special instructions'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Instructions Input */}
      {showInstructions && (
        <View style={styles.instructionsContainer}>
          <TextInput
            style={styles.instructionsInput}
            placeholder="e.g., Extra starch, no fabric softener, light fold..."
            placeholderTextColor={colors.text.tertiary}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            maxLength={200}
          />
          <View style={styles.instructionsButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setInstructions(item.specialInstructions || '');
                setShowInstructions(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveInstructions}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unitPrice: {
    ...typography.body.sm,
    color: colors.text.secondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  totalPrice: {
    ...typography.body.lg,
    fontWeight: '700',
    color: colors.text.primary,
    minWidth: 72,
    textAlign: 'right',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  instructionsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  instructionsPreviewText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    flex: 1,
    fontStyle: 'italic',
  },
  addInstructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addInstructionsText: {
    ...typography.body.sm,
    color: colors.primary[500],
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  instructionsInput: {
    ...typography.body.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  instructionsButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[500],
  },
  saveButtonText: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
