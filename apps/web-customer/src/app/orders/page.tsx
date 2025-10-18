'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/lib/utils';
import { Package, Clock, DollarSign, User } from 'lucide-react';
import Link from 'next/link';

// Hardcoded customer ID for demo - in real app would come from auth context
const CUSTOMER_ID = 'cmgvgmqfe00021asc08qavn10';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', CUSTOMER_ID, statusFilter, page],
    queryFn: async () => {
      const response = await ordersApi.list({
        customerId: CUSTOMER_ID,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        limit: 20,
      });
      return response.data;
    },
  });

  const orders: Order[] = data?.data || [];
  const meta = data?.meta;

  const statusCounts = {
    ALL: meta?.total || 0,
    RECEIVED_BY_MERCHANT: 0,
    IN_PROCESS: 0,
    READY_FOR_DELIVERY: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your laundry orders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Orders"
            value={meta?.total || 0}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="New Orders"
            value={statusCounts.RECEIVED_BY_MERCHANT}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="In Process"
            value={statusCounts.IN_PROCESS}
            icon={Package}
            color="purple"
          />
          <StatCard
            title="Ready"
            value={statusCounts.READY_FOR_DELIVERY}
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'RECEIVED_BY_MERCHANT', 'IN_PROCESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Orders' : getOrderStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading orders...
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-red-600">
                Error loading orders. Please try again.
              </div>
            ) : orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, meta.total)} of {meta.total} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {order.orderNumber}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                {order.customer?.firstName} {order.customer?.lastName}
              </span>
              {order.customer?.user?.phone && (
                <span className="text-gray-400">
                  • {order.customer.user.phone}
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
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </p>
          {order.specialInstructions && (
            <p className="mt-1 text-xs text-gray-500">Has special instructions</p>
          )}
        </div>
      </div>
    </Link>
  );
}
