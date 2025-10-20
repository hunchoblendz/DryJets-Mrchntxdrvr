import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Badge } from '../../components/ui/Badge';

export default function StoresScreen() {
  const router = useRouter();
  const { favorites } = useFavoritesStore();

  const renderStoreCard = (favorite: any) => (
    <TouchableOpacity
      key={favorite.id}
      onPress={() => router.push(`/merchants/${favorite.merchantId}`)}
    >
      <Card variant="elevated" style={styles.storeCard}>
        <View style={styles.storeHeader}>
          <View>
            <Text style={styles.storeName}>{favorite.merchant?.businessName}</Text>
            {favorite.nickname && (
              <Text style={styles.nickname}>{favorite.nickname}</Text>
            )}
            {favorite.isHomeStore && (
              <Badge label="Home Store" variant="success" size="sm" />
            )}
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statValue}>{favorite.orderCount}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>${favorite.totalSpent.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <EmptyState
          title="No favorite stores yet"
          description="Add stores as favorites to quick access them"
          actionLabel="Browse Stores"
          onAction={() => router.push('/(tabs)/home')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderStoreCard(item)}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
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
    paddingVertical: spacing.md,
  },
  storeCard: {
    marginBottom: spacing.md,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  nickname: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
});
