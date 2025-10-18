import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';
import { Order } from '../types';
import { StatusBar } from 'expo-status-bar';

// Hardcoded customer ID for demo
const CUSTOMER_ID = 'cmgvgmqfe00021asc08qavn10';

export default function OrdersScreen() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', CUSTOMER_ID],
    queryFn: async () => {
      const response = await ordersApi.list(CUSTOMER_ID, { limit: 50 });
      return response.data;
    },
  });

  const orders: Order[] = data?.data || [];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity
          style={styles.newOrderButton}
          onPress={() => {
            // In a real app, navigate to new order flow
            alert('New order flow would start here');
          }}
        >
          <Text style={styles.newOrderButtonText}>+ New Order</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Create your first order to get started</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: '#F59E0B',
      PAYMENT_CONFIRMED: '#3B82F6',
      DRIVER_ASSIGNED: '#8B5CF6',
      PICKED_UP: '#8B5CF6',
      IN_PROCESS: '#F97316',
      READY_FOR_DELIVERY: '#06B6D4',
      OUT_FOR_DELIVERY: '#14B8A6',
      DELIVERED: '#10B981',
      CANCELLED: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => alert(`Order details for ${order.orderNumber}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        {order.merchant && (
          <Text style={styles.merchantName}>{order.merchant.businessName}</Text>
        )}
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        {order.items && (
          <Text style={styles.itemCount}>{order.items.length} items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  newOrderButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  list: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewDetails: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});
