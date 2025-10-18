import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { driverApi } from '../../lib/api';

// Hardcoded driver ID for demo
const DRIVER_ID = 'driver-123';

interface EarningSummary {
  totalEarnings: number;
  pendingEarnings: number;
  totalTrips: number;
}

interface Earning {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    status: string;
  };
}

export default function EarningsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<EarningSummary>({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalTrips: 0,
  });
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  useEffect(() => {
    loadEarnings();
  }, [filter]);

  const loadEarnings = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : undefined;
      const response = await driverApi.getEarnings(DRIVER_ID, params);
      setEarnings(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarnings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'PROCESSING':
        return '#3b82f6';
      default:
        return '#71717a';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEarningItem = ({ item }: { item: Earning }) => (
    <View style={styles.earningCard}>
      <View style={styles.earningHeader}>
        <View style={styles.earningInfo}>
          <Text style={styles.earningDescription}>{item.description}</Text>
          {item.order && (
            <Text style={styles.orderNumber}>{item.order.orderNumber}</Text>
          )}
        </View>
        <View style={styles.earningAmountContainer}>
          <Text style={styles.earningAmount}>
            +${item.amount.toFixed(2)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.earningDate}>{formatDate(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Track your income</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryValue}>
              ${summary.totalEarnings.toFixed(2)}
            </Text>
            <Text style={styles.summarySubtext}>All time</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
              ${summary.pendingEarnings.toFixed(2)}
            </Text>
            <Text style={styles.summarySubtext}>Being processed</Text>
          </View>
        </View>

        {/* Trips Summary */}
        <View style={styles.tripsCard}>
          <Text style={styles.tripsValue}>{summary.totalTrips}</Text>
          <Text style={styles.tripsLabel}>Total Deliveries Completed</Text>
        </View>

        {/* Payout Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💰</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Weekly Payouts</Text>
            <Text style={styles.infoText}>
              Earnings are paid out every Monday. Pending earnings will be
              processed in your next payout cycle.
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['ALL', 'PENDING', 'PAID'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                filter === tab && styles.filterTabActive,
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earnings List */}
        <View style={styles.earningsListContainer}>
          <Text style={styles.sectionTitle}>Earnings History</Text>
          {earnings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>No Earnings Yet</Text>
              <Text style={styles.emptyText}>
                Complete deliveries to start earning!
              </Text>
            </View>
          ) : (
            <FlatList
              data={earnings}
              renderItem={renderEarningItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 11,
    color: '#71717a',
  },
  tripsCard: {
    backgroundColor: '#18181b',
    margin: 20,
    marginTop: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tripsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  tripsLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  filterTabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  earningsListContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  earningCard: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  earningInfo: {
    flex: 1,
  },
  earningDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 12,
    color: '#71717a',
  },
  earningAmountContainer: {
    alignItems: 'flex-end',
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  earningDate: {
    fontSize: 12,
    color: '#71717a',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
  },
});
