'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, driversApi } from '@/lib/api';
import { Order, OrderStatus, Driver } from '@/types';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusLabel,
  getNextOrderStatuses,
} from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Truck,
  Clock,
  DollarSign,
  Phone,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [showDriverAssign, setShowDriverAssign] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await ordersApi.getById(orderId);
      return response.data as Order;
    },
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: async () => {
      const response = await driversApi.list({ status: 'AVAILABLE', limit: 10 });
      return response.data;
    },
    enabled: showDriverAssign,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: OrderStatus; notes?: string }) => {
      return ordersApi.updateStatus(orderId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setNotes('');
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ driverId, notes }: { driverId: string; notes?: string }) => {
      return ordersApi.assignDriver(orderId, driverId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setShowDriverAssign(false);
      setNotes('');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  const nextStatuses = getNextOrderStatuses(order.status);
  const drivers: Driver[] = driversData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Created {formatDateTime(order.createdAt)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-medium ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-base font-medium">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                  </div>
                  {order.customer?.user?.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        href={`tel:${order.customer.user.phone}`}
                        className="text-base font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {order.customer.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Addresses
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Pickup Address</p>
                  {order.pickupAddress && (
                    <p className="text-gray-600">
                      {order.pickupAddress.street}
                      {order.pickupAddress.apartment && `, ${order.pickupAddress.apartment}`}
                      <br />
                      {order.pickupAddress.city}, {order.pickupAddress.state}{' '}
                      {order.pickupAddress.zipCode}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                  {order.deliveryAddress && (
                    <p className="text-gray-600">
                      {order.deliveryAddress.street}
                      {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                      <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                      {order.deliveryAddress.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                        {item.service && (
                          <p className="text-sm text-gray-500 mt-1">{item.service.name}</p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-sm text-orange-600 mt-1 flex items-start">
                            <MessageSquare className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                            {item.specialInstructions}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">{formatCurrency(order.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                    </div>
                    {order.tip > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tip</span>
                        <span className="font-medium">{formatCurrency(order.tip)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Special Instructions
                </h3>
                <p className="text-orange-800">{order.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            {nextStatuses.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="space-y-3">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (confirm(`Update order status to ${getOrderStatusLabel(status)}?`)) {
                          updateStatusMutation.mutate({ status, notes });
                        }
                      }}
                      disabled={updateStatusMutation.isPending}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Mark as {getOrderStatusLabel(status)}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes about this status update..."
                  />
                </div>
              </div>
            )}

            {/* Driver Info */}
            {(order.pickupDriver || order.deliveryDriver) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Driver Information
                </h3>
                {order.pickupDriver && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Pickup Driver</p>
                    <p className="text-base font-medium">
                      {order.pickupDriver.firstName} {order.pickupDriver.lastName}
                    </p>
                  </div>
                )}
                {order.deliveryDriver && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Driver</p>
                    <p className="text-base font-medium">
                      {order.deliveryDriver.firstName} {order.deliveryDriver.lastName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Timeline
                </h3>
                <div className="space-y-4">
                  {order.statusHistory
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .map((history, index) => (
                      <div key={history.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          />
                        </div>
                        <div className="flex-1 pb-4 border-b last:border-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getOrderStatusLabel(history.status)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(history.createdAt)}
                          </p>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
