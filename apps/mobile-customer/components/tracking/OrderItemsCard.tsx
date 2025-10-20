import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, FlatList } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
}

interface OrderItemsCardProps {
  items: OrderItem[];
  orderTotal?: number;
  specialInstructions?: string;
  merchantName?: string;
  onPress?: () => void;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({
  items,
  orderTotal,
  specialInstructions,
  merchantName,
  onPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  const animHeight = new Animated.Value(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animHeight, {
      toValue: expanded ? 0 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const itemsSummary =
    items.length > 1
      ? `${items.length} items`
      : items.length === 1
      ? items[0].name
      : 'No items';

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable style={styles.header} onPress={() => {
        toggleExpand();
        onPress?.();
      }}>
        <View style={styles.headerContent}>
          <View style={styles.itemIconContainer}>
            <Text style={styles.itemIcon}>📦</Text>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{totalQuantity}</Text>
            </View>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.itemsSummary}>{itemsSummary}</Text>
            {merchantName && (
              <Text style={styles.merchantName}>From {merchantName}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          {orderTotal !== undefined && (
            <Text style={styles.orderTotal}>${orderTotal.toFixed(2)}</Text>
          )}
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <Animated.View
          style={[
            styles.expandedContent,
            {
              maxHeight: animHeight,
            },
          ]}
        >
          <View style={styles.divider} />

          {/* Items list */}
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>

                {item.price !== undefined && (
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Special instructions */}
          {specialInstructions && (
            <View style={styles.instructionsContainer}>
              <View style={styles.divider} />
              <Text style={styles.instructionsLabel}>📝 Special Instructions</Text>
              <Text style={styles.instructionsText}>{specialInstructions}</Text>
            </View>
          )}

          {/* Order summary */}
          {orderTotal !== undefined && (
            <View style={styles.summaryContainer}>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${(orderTotal * 0.8).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fees</Text>
                <Text style={styles.summaryValue}>
                  ${(orderTotal * 0.2).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${orderTotal.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  itemIconContainer: {
    position: 'relative',
  },
  itemIcon: {
    fontSize: 28,
  },
  quantityBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primary[500],
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background.primary,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  itemsSummary: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  merchantName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  orderTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  expandIcon: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginVertical: spacing.sm,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemQuantity: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary[500],
    minWidth: 25,
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  instructionsContainer: {
    marginTop: spacing.sm,
  },
  instructionsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginVertical: spacing.xs,
  },
  instructionsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  summaryContainer: {
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.primary[500],
  },
});
