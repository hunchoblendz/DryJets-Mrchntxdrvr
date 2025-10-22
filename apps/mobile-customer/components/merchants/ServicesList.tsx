import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ServicesListProps {
  services: Service[];
  onAddToCart: (service: Service) => void;
  onRemoveFromCart: (serviceId: string) => void;
  cartQuantities: Map<string, number>;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'turnaround';

export default function ServicesList({
  services,
  onAddToCart,
  onRemoveFromCart,
  cartQuantities,
}: ServicesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category).filter(Boolean));
    return Array.from(cats);
  }, [services]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'turnaround':
        sorted.sort((a, b) => a.estimatedTurnaround - b.estimatedTurnaround);
        break;
    }

    return sorted;
  }, [services, searchQuery, selectedCategory, sortBy]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'name' && styles.sortButtonTextActive,
              ]}
            >
              Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-low' && styles.sortButtonActive]}
            onPress={() => setSortBy('price-low')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'price-low' && styles.sortButtonTextActive,
              ]}
            >
              Price ↑
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-high' && styles.sortButtonActive]}
            onPress={() => setSortBy('price-high')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'price-high' && styles.sortButtonTextActive,
              ]}
            >
              Price ↓
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'turnaround' && styles.sortButtonActive]}
            onPress={() => setSortBy('turnaround')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'turnaround' && styles.sortButtonTextActive,
              ]}
            >
              Fast
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredAndSortedServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceItem
            service={item}
            quantity={cartQuantities.get(item.id) || 0}
            onAdd={() => onAddToCart(item)}
            onRemove={() => onRemoveFromCart(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function ServiceItem({
  service,
  quantity,
  onAdd,
  onRemove,
}: {
  service: Service;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <Card variant="default" style={styles.serviceCard}>
      <View style={styles.serviceContent}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {service.description && (
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
          )}
          <View style={styles.serviceMetaRow}>
            <Text style={styles.servicePrice}>
              ${service.basePrice.toFixed(2)}/{service.unit || 'item'}
            </Text>
            {service.estimatedTurnaround > 0 && (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.serviceTurnaround}>
                  ~{service.estimatedTurnaround}h
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Add/Quantity Controls */}
        {quantity === 0 ? (
          <Button title="Add" onPress={onAdd} variant="primary" size="sm" />
        ) : (
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={onRemove}>
              <Ionicons name="remove" size={18} color={colors.primary[500]} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={onAdd}>
              <Ionicons name="add" size={18} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body.base,
    color: colors.text.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryChipText: {
    ...typography.body.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.text.inverse,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sortLabel: {
    ...typography.body.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  sortButtonActive: {
    backgroundColor: colors.primary[100],
  },
  sortButtonText: {
    ...typography.body.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
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
  serviceDescription: {
    ...typography.body.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  servicePrice: {
    ...typography.body.sm,
    color: colors.primary[500],
    fontWeight: '700',
  },
  metaDivider: {
    ...typography.body.sm,
    color: colors.text.tertiary,
  },
  serviceTurnaround: {
    ...typography.body.xs,
    color: colors.text.secondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body.lg,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
