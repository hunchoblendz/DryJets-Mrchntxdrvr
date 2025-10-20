import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, TextInput } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface DeliveryInstructionsProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (instructions: string) => void;
  initialInstructions?: string;
  deliveryAddress?: string;
  contactNumber?: string;
}

export const DeliveryInstructions: React.FC<DeliveryInstructionsProps> = ({
  visible,
  onDismiss,
  onSave,
  initialInstructions = '',
  deliveryAddress,
  contactNumber,
}) => {
  const [instructions, setInstructions] = useState(initialInstructions);
  const scaleAnim = new Animated.Value(0.9);
  const opacityAnim = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleSave = () => {
    onSave(instructions);
    onDismiss();
  };

  const suggestedInstructions = [
    'Leave at door',
    'Call upon arrival',
    'Ring doorbell only',
    'Use side entrance',
    'Leave with neighbor',
    'Signature required',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
      />

      {/* Modal content */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📝 Delivery Instructions</Text>
            <Pressable style={styles.closeButton} onPress={onDismiss}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Address display */}
          {deliveryAddress && (
            <View style={styles.addressBox}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Delivery Address</Text>
                <Text style={styles.addressText}>{deliveryAddress}</Text>
              </View>
            </View>
          )}

          {/* Contact number */}
          {contactNumber && (
            <View style={styles.contactBox}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Driver will call</Text>
                <Text style={styles.contactText}>{contactNumber}</Text>
              </View>
            </View>
          )}

          {/* Instructions input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Special Instructions</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Ring doorbell twice, leave with neighbor, etc."
              placeholderTextColor={colors.text.secondary}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {instructions.length}/200
            </Text>
          </View>

          {/* Suggested instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Suggested</Text>
            <View style={styles.suggestedGrid}>
              {suggestedInstructions.map((suggestion, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && styles.suggestionChipPressed,
                    instructions.includes(suggestion) && styles.suggestionChipActive,
                  ]}
                  onPress={() => {
                    if (instructions.includes(suggestion)) {
                      setInstructions(instructions.replace(suggestion, '').trim());
                    } else {
                      setInstructions(
                        instructions
                          ? `${instructions}, ${suggestion}`
                          : suggestion
                      );
                    }
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tips section */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsIcon}>💡</Text>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Pro Tips</Text>
              <Text style={styles.tipsText}>
                • Be specific about door location{'\n'}
                • Mention any access restrictions{'\n'}
                • Include preferred contact method
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Instructions</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    paddingVertical: spacing.lg,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  addressBox: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 12,
  },
  addressIcon: {
    fontSize: 20,
  },
  addressContent: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  contactBox: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  contactIcon: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: '500',
  },
  contactText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[900],
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 100,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.primary,
  },
  suggestionChipPressed: {
    opacity: 0.7,
  },
  suggestionChipActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  suggestionText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: '500',
  },
  tipsBox: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.warning[50],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  tipsIcon: {
    fontSize: 18,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.warning[900],
    marginBottom: 4,
  },
  tipsText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning[800],
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.background.primary,
  },
});
