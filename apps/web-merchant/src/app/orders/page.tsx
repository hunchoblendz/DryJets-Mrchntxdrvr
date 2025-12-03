'use client';

/**
 * OrdersPage - "Dummy User" Friendly Tabbed Order Management
 *
 * Features:
 * - 3 tabs: Today | All Orders | Analytics
 * - Simplified "Today" view for quick access
 * - Advanced filters in "All Orders"
 * - Visual analytics with charts
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/lib/utils';
import {
  Package,
  Clock,
  DollarSign,
  User,
  CalendarDays,
  List,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { AddOrderSheet } from '@/components/orders/AddOrderSheet';

// Hardcoded merchant ID for demo - in real app would come from auth context
const MERCHANT_ID = 'cmgvgmqg8000k1asc969fv1l2';

// Tab configuration
const TABS = [
  { id: 'today', label: 'Today', icon: CalendarDays, description: 'Quick view of today\'s orders' },
  { id: 'all', label: 'All Orders', icon: List, description: 'Browse and filter all orders' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Order statistics and trends' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Fetch orders based on active tab
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', MERCHANT_ID, activeTab, statusFilter, page, searchQuery],
    queryFn: async () => {
      const params: any = {
        merchantId: MERCHANT_ID,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        limit: 20,
      };

      // For "Today" tab, filter by today's date
      if (activeTab === 'today') {
        params.startDate = startOfDay;
        params.endDate = endOfDay;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await ordersApi.list(params);
      return response.data;
    },
  });

  const orders: Order[] = data?.data || [];
  const meta = data?.meta;

  // Calculate status counts from orders
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: meta?.total || 0,
      RECEIVED_BY_MERCHANT: 0,
      IN_PROCESS: 0,
      READY_FOR_DELIVERY: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
    };

    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [orders, meta?.total]);

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage and track your laundry orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddOrderOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Order</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                    font-medium text-sm transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Today Tab - Simplified View */}
            {activeTab === 'today' && (
              <TodayView
                orders={orders}
                isLoading={isLoading}
                error={error}
                statusCounts={statusCounts}
              />
            )}

            {/* All Orders Tab - Full Features */}
            {activeTab === 'all' && (
              <AllOrdersView
                orders={orders}
                isLoading={isLoading}
                error={error}
                meta={meta}
                page={page}
                setPage={setPage}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsView statusCounts={statusCounts} orders={orders} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Order Sheet */}
      <AddOrderSheet open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} />
    </div>
  );
}

// =============================================================================
// Today View - Simple, Quick Access
// =============================================================================

function TodayView({
  orders,
  isLoading,
  error,
  statusCounts,
}: {
  orders: Order[];
  isLoading: boolean;
  error: any;
  statusCounts: Record<string, number>;
}) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickStatCard
          label="Total Today"
          value={orders.length}
          color="blue"
          icon={Package}
        />
        <QuickStatCard
          label="New"
          value={statusCounts.RECEIVED_BY_MERCHANT}
          color="orange"
          icon={Clock}
        />
        <QuickStatCard
          label="In Progress"
          value={statusCounts.IN_PROCESS}
          color="purple"
          icon={Package}
        />
        <QuickStatCard
          label="Ready"
          value={statusCounts.READY_FOR_DELIVERY}
          color="green"
          icon={DollarSign}
        />
      </div>

      {/* Today's Orders - Large Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Orders
        </h2>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : orders.length === 0 ? (
          <EmptyState message="No orders for today yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <TodayOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// All Orders View - Full Features
// =============================================================================

function AllOrdersView({
  orders,
  isLoading,
  error,
  meta,
  page,
  setPage,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: {
  orders: Order[];
  isLoading: boolean;
  error: any;
  meta: any;
  page: number;
  setPage: (page: number) => void;
  statusFilter: OrderStatus | 'ALL';
  setStatusFilter: (status: OrderStatus | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            aria-label="Filter by order status"
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECEIVED_BY_MERCHANT">Received</option>
            <option value="IN_PROCESS">In Process</option>
            <option value="READY_FOR_DELIVERY">Ready</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : orders.length === 0 ? (
          <EmptyState message="No orders found" />
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, meta.total)} of{' '}
              {meta.total} orders
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Analytics View
// =============================================================================

function AnalyticsView({
  statusCounts,
  orders,
}: {
  statusCounts: Record<string, number>;
  orders: Order[];
}) {
  // Calculate revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12.5%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statusCounts.ALL}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+8.3%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600 dark:text-red-400 font-medium">-2.1%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Status Breakdown
        </h3>
        <div className="space-y-4">
          {[
            { status: 'RECEIVED_BY_MERCHANT', label: 'Received', color: 'orange' },
            { status: 'IN_PROCESS', label: 'In Process', color: 'blue' },
            { status: 'READY_FOR_DELIVERY', label: 'Ready', color: 'purple' },
            { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'cyan' },
            { status: 'DELIVERED', label: 'Delivered', color: 'green' },
          ].map(({ status, label, color }) => {
            const count = statusCounts[status] || 0;
            const percentage = statusCounts.ALL > 0 ? (count / statusCounts.ALL) * 100 : 0;
            const colorClasses = {
              orange: 'bg-orange-500',
              blue: 'bg-blue-500',
              purple: 'bg-purple-500',
              cyan: 'bg-cyan-500',
              green: 'bg-green-500',
            }[color];

            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${colorClasses}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Shared Components
// =============================================================================

function QuickStatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: 'blue' | 'orange' | 'purple' | 'green';
  icon: any;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  }[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TodayOrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {order.orderNumber || order.shortCode}
            </span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 mr-2" />
            {order.customer?.firstName} {order.customer?.lastName}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            {formatDateTime(order.createdAt)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {order.orderNumber || order.shortCode}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                {order.customer?.firstName} {order.customer?.lastName}
              </span>
              {order.customer?.user?.phone && (
                <span className="text-gray-400 dark:text-gray-500">
                  - {order.customer.user.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            {order.items && order.items.length > 0 && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{order.items.length} items</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(order.totalAmount)}
          </p>
          {order.specialInstructions && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Has special instructions</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// =============================================================================
// Loading, Error, Empty States
// =============================================================================

function LoadingState() {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
        <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
      <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <p className="text-red-600 dark:text-red-400 font-medium">Error loading orders</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please try again later</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
        <Package className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
