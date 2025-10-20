import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { Order } from '../../types';
import { formatDateTime, formatCurrency, getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface OrderHistoryListProps {
  orders: Order[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onOrderPress: (orderId: string) => void;
  onReorder: (order: Order) => void;
  onLoadMore: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  isLoading,
  isLoadingMore,
  onOrderPress,
  onReorder,
  onLoadMore,
  onRefresh,
  refreshing,
}) => {
  const canReorder = (order: Order) => {
    return order.status === 'COMPLETED' || order.status === 'CANCELLED';
  };

  const handleEndReached = () => {
    if (!isLoadingMore && orders.length > 0) {
      onLoadMore();
    }
  };

  const renderOrderCard = ({ item: order }: { item: Order }) => (
    <Pressable
      onPress={() => onOrderPress(order.id)}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardContainerPressed,
      ]}
    >
      <Card variant="elevated">
        {/* Main order info */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
          </View>
          <Badge
            label={getOrderStatusLabel(order.status)}
            variant="primary"
            size="md"
          />
        </View>

        {/* Merchant and items */}
        <View style={styles.merchantSection}>
          <Text style={styles.merchantName}>{order.merchant?.businessName || 'Unknown Merchant'}</Text>
          <Text style={styles.itemCount}>
            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Footer with total and reorder button */}
        <View style={styles.cardFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.total}>{formatCurrency(order.totalAmount)}</Text>
          </View>

          {canReorder(order) && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onReorder(order);
              }}
              style={({ pressed }) => [
                styles.reorderButton,
                pressed && styles.reorderButtonPressed,
              ]}
            >
              <Text style={styles.reorderIcon}>🔄</Text>
              <Text style={styles.reorderLabel}>Reorder</Text>
            </Pressable>
          )}
        </View>
      </Card>
    </Pressable>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
        <Text style={styles.footerLoaderText}>Loading more orders...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📦</Text>
        <Text style={styles.emptyStateTitle}>No Orders Found</Text>
        <Text style={styles.emptyStateText}>
          Try adjusting your filters or search criteria
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderCard}
      contentContainerStyle={styles.listContent}
      scrollIndicatorInsets={{ right: 1 }}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyState}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardContainer: {
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContainerPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  orderNumber: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  merchantSection: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  merchantName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    flex: 1,
  },
  total: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.success[100],
    borderWidth: 1,
    borderColor: colors.success[300],
  },
  reorderButtonPressed: {
    opacity: 0.7,
  },
  reorderIcon: {
    fontSize: 14,
  },
  reorderLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.success[700],
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  footerLoaderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
