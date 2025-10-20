import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

export interface OrderFilters {
  status?: string;
  sortBy?: 'recent' | 'oldest' | 'highest' | 'lowest';
  minAmount?: number;
  maxAmount?: number;
  dateRange?: 'week' | 'month' | '3months' | 'all';
}

interface OrderFilterSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: OrderFilters) => void;
  currentFilters?: OrderFilters;
}

export const OrderFilterSheet: React.FC<OrderFilterSheetProps> = ({
  visible,
  onDismiss,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<OrderFilters>(currentFilters || {});
  const [minPrice, setMinPrice] = useState(currentFilters?.minAmount || 0);
  const [maxPrice, setMaxPrice] = useState(currentFilters?.maxAmount || 500);
  const slideAnim = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const statuses = ['All', 'Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'];
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Price' },
    { value: 'lowest', label: 'Lowest Price' },
  ];
  const dateRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' },
  ];

  const handleApply = () => {
    setFilters({
      ...filters,
      minAmount: minPrice,
      maxAmount: maxPrice,
    });
    onApply({
      ...filters,
      minAmount: minPrice,
      maxAmount: maxPrice,
    });
    onDismiss();
  };

  const handleReset = () => {
    setFilters({});
    setMinPrice(0);
    setMaxPrice(500);
  };

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

      {/* Filter Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideTransform }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={onDismiss} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.optionsGrid}>
              {statuses.map((status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.filterOption,
                    filters.status === status && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, status })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.status === status && styles.filterOptionTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Date Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.optionsColumn}>
              {dateRanges.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.radioOption,
                    filters.dateRange === option.value && styles.radioOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, dateRange: option.value as any })}
                >
                  <View
                    style={[
                      styles.radio,
                      filters.dateRange === option.value && styles.radioActive,
                    ]}
                  />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceText}>
                ${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}
              </Text>
            </View>

            <View style={styles.priceRangeRow}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Min</Text>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputText}>${minPrice.toFixed(0)}</Text>
                </View>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Max</Text>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputText}>${maxPrice.toFixed(0)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceOptionsGrid}>
              {[{ label: '$0-$50', min: 0, max: 50 },
                { label: '$50-$150', min: 50, max: 150 },
                { label: '$150-$300', min: 150, max: 300 },
                { label: '$300+', min: 300, max: 500 }].map((range) => (
                <Pressable
                  key={range.label}
                  style={[
                    styles.priceOption,
                    minPrice === range.min && maxPrice === range.max && styles.priceOptionActive,
                  ]}
                  onPress={() => {
                    setMinPrice(range.min);
                    setMaxPrice(range.max);
                  }}
                >
                  <Text
                    style={[
                      styles.priceOptionText,
                      minPrice === range.min && maxPrice === range.max && styles.priceOptionTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Sort By Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsColumn}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.radioOption,
                    filters.sortBy === option.value && styles.radioOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, sortBy: option.value as any })}
                >
                  <View
                    style={[
                      styles.radio,
                      filters.sortBy === option.value && styles.radioActive,
                    ]}
                  />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  filterOptionActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  filterOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  optionsColumn: {
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  radioOptionActive: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  radioActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  radioLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: '500',
  },
  priceDisplay: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  priceText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.primary[500],
    textAlign: 'center',
  },
  priceRangeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceInputBox: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  priceInputText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary[500],
  },
  priceOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priceOption: {
    flex: 1,
    minWidth: '48%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  priceOptionActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  priceOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  priceOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  applyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.background.primary,
  },
});
