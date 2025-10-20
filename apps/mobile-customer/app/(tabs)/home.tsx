import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput as RNTextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { MerchantCard } from '../../components/merchants/MerchantCard';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { merchantsApi } from '../../lib/api';
import { useAuthStore, useFavoritesStore } from '../../lib/store';
import { calculateDistance } from '../../lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { homeStore } = useFavoritesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch merchants
  const {
    data: merchantsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['merchants', searchQuery, selectedCategory],
    queryFn: async () => {
      const response = await merchantsApi.list({
        query: searchQuery,
        limit: 50,
      });
      return response.data;
    },
  });

  const merchants = merchantsResponse?.data?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const categories = [
    { id: 'dry-clean', label: 'Dry Clean', icon: '👔' },
    { id: 'laundry', label: 'Laundry', icon: '👕' },
    { id: 'alterations', label: 'Alterations', icon: '✂️' },
    { id: 'shoe-repair', label: 'Shoe Repair', icon: '👞' },
  ];

  const renderHeader = () => (
    <>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          Welcome back, {customer?.firstName || 'there'}!
        </Text>
        <Text style={styles.greetingSubtitle}>
          Find and order from local laundromats & dry cleaners
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search by name or service..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.quickActionsContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id
            )}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
            ]}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Home Store Shortcut */}
      {homeStore && (
        <TouchableOpacity
          onPress={() =>
            router.push(`/merchants/${homeStore.merchantId}`)
          }
          style={styles.homeStoreContainer}
        >
          <Card>
            <View style={styles.homeStoreContent}>
              <View>
                <Text style={styles.homeStoreLabel}>Your Home Store</Text>
                <Text style={styles.homeStoreName}>
                  {homeStore.merchant?.businessName}
                </Text>
              </View>
              <Text style={styles.homeStoreArrow}>→</Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>
        {selectedCategory ? 'Filtered Results' : 'Nearby Merchants'}
      </Text>
    </>
  );

  if (isLoading && merchants.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {merchants.length === 0 && !isLoading ? (
        <EmptyState
          title="No merchants found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <FlatList
          data={merchants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MerchantCard
              merchant={item}
              onPress={() => router.push(`/merchants/${item.id}`)}
              style={styles.merchantCard}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  greetingContainer: {
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  greetingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  quickActionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryLabelSelected: {
    color: colors.text.inverse,
  },
  homeStoreContainer: {
    marginBottom: spacing.lg,
  },
  homeStoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeStoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
  },
  homeStoreName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
    marginTop: spacing.xs,
  },
  homeStoreArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  merchantCard: {
    marginBottom: spacing.md,
  },
});
