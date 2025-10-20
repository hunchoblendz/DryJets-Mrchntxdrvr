import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography } from '../../theme/tokens';
import { Loading } from '../../components/ui/Loading';
import { ordersApi } from '../../lib/api';
import { useAuthStore, useCartStore } from '../../lib/store';
import { isOrderActive } from '../../lib/utils';
import {
  OrderSearchBar,
  OrderFilterSheet,
  OrderHistoryList,
} from '../../components/orders';
import { Order } from '../../types';
import type { OrderFilters } from '../../components/orders/OrderFilterSheet';

export default function OrdersScreen() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { addItem, setDeliveryAddressId } = useCartStore();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['orders', customer?.id, activeTab, page, filters],
    queryFn: async () => {
      if (!customer?.id) return { data: [], totalCount: 0 };
      const response = await ordersApi.list(customer.id, {
        limit: 20,
        page: page,
        status: filters.status,
      });
      return response.data;
    },
    enabled: !!customer?.id,
  });

  const allOrders = useMemo(() => {
    const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];

    return orders
      .filter((order: Order) => {
        // Tab filter
        if (activeTab === 'active') {
          return isOrderActive(order.status);
        }
        return !isOrderActive(order.status);
      })
      .filter((order: Order) => {
        // Search filter
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(query) ||
          order.merchant?.businessName?.toLowerCase().includes(query)
        );
      })
      .filter((order: Order) => {
        // Amount filter
        if (filters.minAmount !== undefined && order.totalAmount < filters.minAmount) return false;
        if (filters.maxAmount !== undefined && order.totalAmount > filters.maxAmount) return false;
        return true;
      })
      .sort((a: Order, b: Order) => {
        // Sort filter
        if (filters.sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filters.sortBy === 'highest') {
          return b.totalAmount - a.totalAmount;
        }
        if (filters.sortBy === 'lowest') {
          return a.totalAmount - b.totalAmount;
        }
        // Default: most recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [ordersResponse, activeTab, searchQuery, filters]);

  const handleRefresh = async () => {
    setPage(1);
    await refetch();
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleReorder = useCallback(
    (order: Order) => {
      try {
        // Add items to cart
        order.items?.forEach((item: any) => {
          addItem({
            serviceId: item.serviceId || item.id,
            serviceName: item.serviceName || item.name || 'Service',
            unitPrice: item.unitPrice || item.price || 0,
            quantity: item.quantity || 1,
          });
        });

        // Set delivery address if available
        if (order.deliveryAddressId) {
          setDeliveryAddressId(order.deliveryAddressId);
        }

        // Navigate to checkout
        Alert.alert('Success', 'Items added to cart. Proceed to checkout?', [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Checkout',
            onPress: () => router.push('/checkout/fulfillment-mode'),
          },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to reorder. Please try again.');
      }
    },
    [addItem, setDeliveryAddressId, router]
  );

  const handleFilterApply = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (isLoading && allOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab('active');
            setPage(1);
          }}
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'active' && styles.tabLabelActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setActiveTab('completed');
            setPage(1);
          }}
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'completed' && styles.tabLabelActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.toolsBar}>
        <View style={styles.searchContainer}>
          <OrderSearchBar
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        <TouchableOpacity
          onPress={() => setFilterSheetVisible(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <OrderHistoryList
        orders={allOrders}
        isLoading={isLoading}
        isLoadingMore={false}
        onOrderPress={(orderId) => router.push(`/orders/${orderId}`)}
        onReorder={handleReorder}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        refreshing={isLoading}
      />

      {/* Filter Sheet */}
      <OrderFilterSheet
        visible={filterSheetVisible}
        onDismiss={() => setFilterSheetVisible(false)}
        onApply={handleFilterApply}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  tabLabelActive: {
    color: colors.primary[500],
  },
  toolsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterIcon: {
    fontSize: 20,
  },
});
