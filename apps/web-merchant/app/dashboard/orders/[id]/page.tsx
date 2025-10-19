'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useOrderById, useUpdateOrderStatus } from '@/lib/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700', next: ['CONFIRMED', 'CANCELLED'] },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-700', next: ['PICKED_UP', 'CANCELLED'] },
  PICKED_UP: { label: 'Picked Up', color: 'bg-purple-500/10 text-purple-700', next: ['IN_PROGRESS'] },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-500/10 text-indigo-700', next: ['READY_FOR_PICKUP', 'READY_FOR_DELIVERY'] },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'bg-green-500/10 text-green-700', next: ['COMPLETED'] },
  READY_FOR_DELIVERY: { label: 'Ready for Delivery', color: 'bg-green-500/10 text-green-700', next: ['OUT_FOR_DELIVERY'] },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-cyan-500/10 text-cyan-700', next: ['DELIVERED'] },
  DELIVERED: { label: 'Delivered', color: 'bg-teal-500/10 text-teal-700', next: ['COMPLETED'] },
  COMPLETED: { label: 'Completed', color: 'bg-gray-500/10 text-gray-700', next: [] },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/10 text-red-700', next: [] },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();

  // Fetch order data from API
  const { data: order, isLoading, isError, error } = useOrderById(id);
  const updateOrderMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId: id,
        status: newStatus,
        note: `Status updated to ${newStatus}`,
      });

      toast({
        title: 'Status Updated',
        description: `Order status updated to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Order</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Order not found'}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold">{order.orderNumber}</h1>
            <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
            {order.fulfillmentMode === 'CUSTOMER_DROPOFF_PICKUP' && (
              <Badge variant="outline">Self-Service</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Placed {format(order.createdAt, 'MMMM dd, yyyy at h:mm a')}
          </p>
        </div>
        <Button variant="outline" onClick={handlePrintReceipt}>
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}

                {/* Pricing Summary */}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>${order.pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${order.pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${order.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Scheduled Pickup</p>
                  <p className="text-sm text-muted-foreground">
                    {format(order.schedule.pickupScheduled, 'MMMM dd, yyyy at h:mm a')}
                  </p>
                  {order.schedule.pickupActual && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Picked up at {format(order.schedule.pickupActual, 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Scheduled Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {format(order.schedule.deliveryScheduled, 'MMMM dd, yyyy at h:mm a')}
                  </p>
                  {order.schedule.deliveryActual && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Delivered at {format(order.schedule.deliveryActual, 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-brand-gradient" />
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{statusConfig[entry.status as keyof typeof statusConfig]?.label || entry.status}</p>
                      <p className="text-sm text-muted-foreground">{entry.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(entry.timestamp, 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status Update Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentStatus.next.length > 0 ? (
                currentStatus.next.map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    className="w-full bg-brand-gradient"
                    onClick={() => handleStatusUpdate(nextStatus)}
                  >
                    Mark as {statusConfig[nextStatus as keyof typeof statusConfig]?.label}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No status updates available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${order.customer.phone}`} className="text-sm hover:underline">
                  {order.customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${order.customer.email}`} className="text-sm hover:underline">
                  {order.customer.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Pickup Address</p>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>{order.addresses.pickup.street}</p>
                    <p>{order.addresses.pickup.city}, {order.addresses.pickup.state} {order.addresses.pickup.zip}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Delivery Address</p>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>{order.addresses.delivery.street}</p>
                    <p>{order.addresses.delivery.city}, {order.addresses.delivery.state} {order.addresses.delivery.zip}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}