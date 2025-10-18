'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ordersApi, paymentsApi } from '@/lib/api';
import PaymentForm from '@/components/PaymentForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await ordersApi.getById(orderId);
      return response.data;
    },
  });

  // Create payment intent
  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error('Order not found');

      const response = await paymentsApi.createIntent({
        orderId: order.id,
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: 'usd',
        customerId: order.customerId,
        description: `Payment for Order ${order.orderNumber}`,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  // Trigger payment intent creation when order is loaded
  useQuery({
    queryKey: ['payment-intent', orderId],
    queryFn: () => createPaymentIntent.mutateAsync(),
    enabled: !!order && !clientSecret && order.status === 'PENDING_PAYMENT',
  });

  const handlePaymentSuccess = () => {
    router.push(`/orders/${orderId}?payment=success`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (order.status !== 'PENDING_PAYMENT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Not Required
          </h1>
          <p className="text-gray-600 mb-4">
            This order has already been paid for or is in a different status.
          </p>
          <Link
            href={`/orders/${orderId}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Order Details
          </Link>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-1">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-medium">
                ${order.subtotal?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="text-gray-900 font-medium">
                ${order.serviceFee?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900 font-medium">
                ${order.deliveryFee?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900 font-medium">
                ${order.taxAmount?.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <PaymentForm
              orderId={orderId}
              amount={Math.round(order.totalAmount * 100)}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Preparing payment...</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Secure Payment:</strong> All payments are processed securely through Stripe.
            Your payment information is encrypted and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
