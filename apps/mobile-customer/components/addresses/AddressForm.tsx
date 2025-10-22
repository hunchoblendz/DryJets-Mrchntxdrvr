import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { TextInput } from '../ui/TextInput';

interface AddressFormData {
  label: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  instructions: string;
  isDefault: boolean;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (data: AddressFormData) => void;
  onOpenMap: () => void;
}

const LABEL_PRESETS = ['Home', 'Work', 'Gym', 'Other'];

export default function AddressForm({ formData, onChange, onOpenMap }: AddressFormProps) {
  const updateField = (field: keyof AddressFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const hasLocation = formData.latitude !== 0 && formData.longitude !== 0;

  return (
    <View style={styles.container}>
      {/* Label Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Address Label</Text>
        <View style={styles.presetButtons}>
          {LABEL_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                formData.label === preset && styles.presetButtonActive,
              ]}
              onPress={() => updateField('label', preset)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  formData.label === preset && styles.presetButtonTextActive,
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {formData.label === 'Other' && (
          <TextInput
            placeholder="Enter custom label"
            value={formData.label !== 'Other' ? formData.label : ''}
            onChangeText={(value) => updateField('label', value)}
            style={styles.customLabelInput}
          />
        )}
      </View>

      {/* Location Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Location</Text>
        <TouchableOpacity style={styles.mapButton} onPress={onOpenMap}>
          <View style={styles.mapButtonContent}>
            <Ionicons
              name={hasLocation ? 'location' : 'location-outline'}
              size={24}
              color={hasLocation ? colors.primary[500] : colors.text.secondary}
            />
            <View style={styles.mapButtonText}>
              <Text style={styles.mapButtonTitle}>
                {hasLocation ? 'Location Selected' : 'Pick Location on Map'}
              </Text>
              {hasLocation && (
                <Text style={styles.mapButtonSubtitle}>
                  Tap to change location
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Street Address */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Street Address *</Text>
        <TextInput
          placeholder="123 Main Street"
          value={formData.streetAddress}
          onChangeText={(value) => updateField('streetAddress', value)}
          autoCapitalize="words"
        />
      </View>

      {/* Apartment/Unit */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Apartment, Suite, Unit (Optional)</Text>
        <TextInput
          placeholder="Apt 4B, Floor 2, etc."
          value={formData.apartment}
          onChangeText={(value) => updateField('apartment', value)}
          autoCapitalize="words"
        />
      </View>

      {/* City */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>City *</Text>
        <TextInput
          placeholder="San Francisco"
          value={formData.city}
          onChangeText={(value) => updateField('city', value)}
          autoCapitalize="words"
        />
      </View>

      {/* State and Zip Code */}
      <View style={styles.row}>
        <View style={[styles.section, styles.flex1]}>
          <Text style={styles.sectionLabel}>State *</Text>
          <TextInput
            placeholder="CA"
            value={formData.state}
            onChangeText={(value) => updateField('state', value)}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
        <View style={[styles.section, styles.flex1]}>
          <Text style={styles.sectionLabel}>Zip Code *</Text>
          <TextInput
            placeholder="94102"
            value={formData.zipCode}
            onChangeText={(value) => updateField('zipCode', value)}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </View>

      {/* Delivery Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Delivery Instructions (Optional)</Text>
        <TextInput
          placeholder="e.g., Ring doorbell, Leave at door, Call on arrival..."
          value={formData.instructions}
          onChangeText={(value) => updateField('instructions', value)}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />
      </View>

      {/* Set as Default */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Set as Default Address</Text>
            <Text style={styles.switchSubtitle}>
              Use this address for all future orders
            </Text>
          </View>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => updateField('isDefault', value)}
            trackColor={{ false: colors.gray[300], true: colors.primary[300] }}
            thumbColor={formData.isDefault ? colors.primary[500] : colors.gray[100]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  presetButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  presetButtonText: {
    ...typography.body.base,
    color: colors.text.primary,
    fontWeight: '600',
  },
  presetButtonTextActive: {
    color: colors.text.inverse,
  },
  customLabelInput: {
    marginTop: spacing.sm,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  mapButtonText: {
    flex: 1,
  },
  mapButtonTitle: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mapButtonSubtitle: {
    ...typography.body.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  switchLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  switchSubtitle: {
    ...typography.body.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
