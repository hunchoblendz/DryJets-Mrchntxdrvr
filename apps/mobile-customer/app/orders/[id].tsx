import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout, borderRadius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Divider } from '../../components/ui/Divider';
import { OrderStatusTracker } from '../../components/orders/OrderStatusTracker';
import { ordersApi, driversApi } from '../../lib/api';
import {
  formatDateTime,
  formatCurrency,
  getOrderStatusLabel,
  getOrderStatusColor,
  calculateETA,
} from '../../lib/utils';
import { Order, Driver } from '../../types';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('status');

  // Fetch order details
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await ordersApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Fetch driver info if order is out for delivery
  const driverId = (order as any)?.driverId;
  const {
    data: driver,
    isLoading: driverLoading,
  } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      if (!driverId) return null;
      const response = await driversApi.getById(driverId);
      return response.data.data;
    },
    enabled: !!driverId && order?.status === 'OUT_FOR_DELIVERY',
    refetchInterval: 15000, // Poll every 15 seconds for driver updates
  });

  // Fetch driver location if available
  useEffect(() => {
    if (driver?.id && order?.status === 'OUT_FOR_DELIVERY') {
      const pollLocation = async () => {
        try {
          // In real app, would use socket.io for real-time location
          // For now, simulating with API call
          setDriverLocation({
            latitude: (driver as any)?.currentLatitude || 0,
            longitude: (driver as any)?.currentLongitude || 0,
          });
        } catch (error) {
          console.error('Failed to fetch driver location:', error);
        }
      };

      const interval = setInterval(pollLocation, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [driver?.id, order?.status]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchOrder();
    setRefreshing(false);
  }, [refetchOrder]);

  const handleContactDriver = () => {
    if (driver?.phone) {
      Alert.alert(
        'Contact Driver',
        `Call ${driver.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              // In real app, would trigger phone call
              Alert.alert('Calling', `${driver.phone}`);
            },
          },
        ]
      );
    }
  };

  const handleContactMerchant = () => {
    if (!order) return;
    const merchantPhone = (order.merchant as any)?.phone;
    if (merchantPhone) {
      Alert.alert(
        'Contact Merchant',
        `Call ${order.merchant?.businessName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              Alert.alert('Calling', `${merchantPhone}`);
            },
          },
        ]
      );
    }
  };

  if (orderLoading) {
    return <Loading />;
  }

  if (orderError || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load order</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isActive = ['PAYMENT_CONFIRMED', 'PICKED_UP', 'IN_PROCESS', 'OUT_FOR_DELIVERY'].includes(order.status);
  const eta = calculateETA((order as any)?.estimatedCompletionTime || order.createdAt, order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order Number & Status */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
          </View>
          <Badge
            label={getOrderStatusLabel(order.status)}
            variant="primary"
            size="md"
          />
        </View>

        {/* Status Tracker */}
        <Card variant="default" style={styles.statusCard}>
          <OrderStatusTracker status={order.status as any} estimatedTime={eta} />
        </Card>

        {/* Driver Info (if out for delivery) */}
        {order.status === 'OUT_FOR_DELIVERY' && driver && (
          <Card variant="elevated" style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <Text style={styles.sectionTitle}>Driver</Text>
              {driverLoading && <ActivityIndicator size="small" color={colors.primary[500]} />}
            </View>
            <Divider style={styles.divider} />

            <View style={styles.driverInfo}>
              <View style={styles.driverName}>
                <Text style={styles.driverNameText}>{driver.name}</Text>
                <Text style={styles.driverRating}>★ {driver.rating || 4.8}</Text>
              </View>
              <Text style={styles.driverVehicle}>{driver.vehicleNumber}</Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="📞 Call"
                onPress={handleContactDriver}
                variant="secondary"
                size="sm"
                fullWidth
              />
            </View>
          </Card>
        )}

        {/* Order Summary Section */}
        <TouchableOpacity
          onPress={() =>
            setExpandedSection(expandedSection === 'summary' ? null : 'summary')
          }
        >
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === 'summary' ? '▼' : '▶'}
              </Text>
            </View>

            {expandedSection === 'summary' && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.summaryItems}>
                  {order.items?.map((item, index) => (
                    <View key={index} style={styles.summaryItem}>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(((item as any)?.price || 0) * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <Divider style={styles.divider} />

                {/* Pricing Breakdown */}
                <View style={styles.pricingBreakdown}>
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Subtotal</Text>
                    <Text style={styles.pricingValue}>
                      {formatCurrency(order.subtotal || 0)}
                    </Text>
                  </View>
                  {order.deliveryFee && order.deliveryFee > 0 && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Delivery</Text>
                      <Text style={styles.pricingValue}>
                        {formatCurrency(order.deliveryFee)}
                      </Text>
                    </View>
                  )}
                  {order.discount && order.discount > 0 && (
                    <View style={styles.pricingRow}>
                      <Text style={[styles.pricingLabel, styles.discount]}>
                        Discount
                      </Text>
                      <Text style={[styles.pricingValue, styles.discount]}>
                        -{formatCurrency(order.discount)}
                      </Text>
                    </View>
                  )}
                  {order.tax && order.tax > 0 && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Tax</Text>
                      <Text style={styles.pricingValue}>
                        {formatCurrency(order.tax)}
                      </Text>
                    </View>
                  )}
                  {order.tip && order.tip > 0 && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Tip</Text>
                      <Text style={styles.pricingValue}>
                        {formatCurrency(order.tip)}
                      </Text>
                    </View>
                  )}

                  <Divider style={styles.divider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.totalAmount)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Card>
        </TouchableOpacity>

        {/* Merchant Section */}
        <TouchableOpacity
          onPress={() =>
            setExpandedSection(expandedSection === 'merchant' ? null : 'merchant')
          }
        >
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Merchant</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === 'merchant' ? '▼' : '▶'}
              </Text>
            </View>

            {expandedSection === 'merchant' && (
              <>
                <Divider style={styles.divider} />
                <View>
                  <Text style={styles.merchantName}>
                    {order.merchant?.businessName}
                  </Text>
                  <Text style={styles.merchantAddress}>
                    {(order.merchant as any)?.address || 'Address not available'}
                  </Text>
                  {(order.merchant as any)?.phone && (
                    <Button
                      title="📞 Call Merchant"
                      onPress={handleContactMerchant}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      style={styles.contactButton}
                    />
                  )}
                </View>
              </>
            )}
          </Card>
        </TouchableOpacity>

        {/* Delivery Address Section */}
        <TouchableOpacity
          onPress={() =>
            setExpandedSection(expandedSection === 'delivery' ? null : 'delivery')
          }
        >
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === 'delivery' ? '▼' : '▶'}
              </Text>
            </View>

            {expandedSection === 'delivery' && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.addressText}>
                  {order.deliveryAddress?.streetAddress}
                  {order.deliveryAddress?.apartment
                    ? `, ${order.deliveryAddress.apartment}`
                    : ''}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
                  {order.deliveryAddress?.zipCode}
                </Text>
                {order.deliveryAddress?.instructions && (
                  <Text style={styles.specialInstructions}>
                    📝 {order.deliveryAddress.instructions}
                  </Text>
                )}
              </>
            )}
          </Card>
        </TouchableOpacity>

        {/* Action Buttons */}
        {isActive && order.status === 'OUT_FOR_DELIVERY' && (
          <View style={styles.actionContainer}>
            <Button
              title="🗺️ View Map"
              onPress={() => router.push(`/orders/${id}/tracking-map`)}
              variant="primary"
              fullWidth
            />
          </View>
        )}

        {order.status === 'DELIVERED' && (
          <View style={styles.actionContainer}>
            <Button
              title="Reorder"
              onPress={() => router.push('/(tabs)/home')}
              variant="primary"
              fullWidth
            />
            <Button
              title="Leave Review"
              onPress={() => {
                // Navigate to review screen
                Alert.alert('Review', 'Review feature coming soon');
              }}
              variant="secondary"
              fullWidth
              style={styles.secondaryButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  orderNumber: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusCard: {
    marginHorizontal: layout.screenPadding,
    marginVertical: spacing.lg,
  },
  sectionCard: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  expandIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  driverCard: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    marginBottom: spacing.md,
  },
  driverName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  driverNameText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  driverRating: {
    fontSize: typography.fontSize.sm,
    color: colors.warning[500],
    fontWeight: typography.fontWeight.semibold,
  },
  driverVehicle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  actionButtons: {
    gap: spacing.md,
  },
  summaryItems: {
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  itemQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  pricingBreakdown: {
    marginBottom: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  pricingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  pricingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  discount: {
    color: colors.success[500],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  merchantName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  merchantAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  contactButton: {
    marginTop: spacing.md,
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  specialInstructions: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  actionContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});
