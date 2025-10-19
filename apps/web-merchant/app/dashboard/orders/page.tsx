'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  User,
  DollarSign,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useOrders } from '@/lib/hooks/useOrders';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Ready',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'driver' | 'customer'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Replace with actual merchant ID from auth
  const merchantId = 'merchant-1';

  // Fetch orders from API
  const { data: orders, isLoading, isError, error } = useOrders({ merchantId });

  // Transform API data to match component structure
  const displayOrders = useMemo(() => {
    if (!orders) return [];

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: '', // TODO: Add phone to API response
      status: order.status,
      fulfillmentMode: order.fulfillmentMode,
      items: [], // Will display itemCount instead
      itemCount: order.itemCount,
      totalAmount: order.totalAmount,
      scheduledPickupAt: order.pickupScheduled,
      scheduledDeliveryAt: order.deliveryScheduled,
      pickupAddress: '', // TODO: Add to API response
      deliveryAddress: '',
      createdAt: order.createdAt,
    }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return displayOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'driver') {
        return matchesSearch && ['FULL_SERVICE', 'CUSTOMER_DROPOFF_DRIVER_DELIVERY', 'DRIVER_PICKUP_CUSTOMER_PICKUP'].includes(order.fulfillmentMode);
      }
      if (filter === 'customer') {
        return matchesSearch && ['CUSTOMER_DROPOFF_PICKUP'].includes(order.fulfillmentMode);
      }
      return matchesSearch;
    });
  }, [displayOrders, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: displayOrders.length,
    pending: displayOrders.filter(o => o.status === 'PENDING').length,
    inProgress: displayOrders.filter(o => o.status === 'IN_PROGRESS').length,
    readyForPickup: displayOrders.filter(o => o.status === 'READY_FOR_PICKUP').length,
  }), [displayOrders]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching orders'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-brand-gradient bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and track all your orders in one place
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold mt-2">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ready</p>
              <p className="text-3xl font-bold mt-2">{stats.readyForPickup}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-brand-gradient' : ''}
          >
            All Orders ({displayOrders.length})
          </Button>
          <Button
            variant={filter === 'driver' ? 'default' : 'outline'}
            onClick={() => setFilter('driver')}
            className={filter === 'driver' ? 'bg-brand-gradient' : ''}
          >
            <Truck className="h-4 w-4 mr-2" />
            Driver Deliveries
          </Button>
          <Button
            variant={filter === 'customer' ? 'default' : 'outline'}
            onClick={() => setFilter('customer')}
            className={filter === 'customer' ? 'bg-brand-gradient' : ''}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Customer Pickups
          </Button>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold">{order.orderNumber}</h3>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    {order.fulfillmentMode === 'CUSTOMER_DROPOFF_PICKUP' && (
                      <Badge variant="outline" className="text-xs">
                        Self-Service
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{order.customerName}</span>
                      <span className="text-xs">• {order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Placed {format(order.createdAt, 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end">
                  <div className="text-right text-sm text-muted-foreground">
                    {order.scheduledDeliveryAt && (
                      <div>
                        <span className="text-xs">Delivery</span>
                        <p className="font-medium">
                          {format(order.scheduledDeliveryAt, 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'No orders match your search criteria'
                : 'No orders to display in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}