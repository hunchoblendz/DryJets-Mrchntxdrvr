'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentsApi, merchantsApi } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// Hardcoded merchant ID for demo - in real app would come from auth context
const MERCHANT_ID = 'cmgvgmqg8000k1asc969fv1l2';
const MERCHANT_EMAIL = 'merchant@dryjets.com';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  createdAt: string;
  processedAt?: string;
  order: {
    id: string;
    orderNumber: string;
    customer: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fetch merchant details to check Stripe Connect status
  const { data: merchantData } = useQuery({
    queryKey: ['merchant', MERCHANT_ID],
    queryFn: async () => {
      const response = await merchantsApi.getById(MERCHANT_ID);
      return response.data;
    },
  });

  // Fetch payments for this merchant
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', MERCHANT_ID, statusFilter, page],
    queryFn: async () => {
      // Note: This would need a backend endpoint that filters by merchantId
      // For now, we'll fetch all and filter client-side as a demo
      const response = await paymentsApi.list({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        limit: 20,
      });
      return response.data;
    },
  });

  const payments: Payment[] = paymentsData?.data || [];
  const meta = paymentsData?.meta;

  // Calculate totals
  const succeededPayments = payments.filter((p) => p.status === 'SUCCEEDED');
  const totalEarnings = succeededPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(
    (p) => p.status === 'PENDING' || p.status === 'PROCESSING',
  );
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  // Stripe Connect onboarding mutation
  const onboardMutation = useMutation({
    mutationFn: async () => {
      const response = await paymentsApi.merchantOnboard({
        merchantId: MERCHANT_ID,
        email: MERCHANT_EMAIL,
        returnUrl: `${window.location.origin}/payouts?onboarding=success`,
        refreshUrl: `${window.location.origin}/payouts?onboarding=refresh`,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Connect onboarding
      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      }
    },
  });

  const hasStripeAccount = merchantData?.stripeConnectAccountId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your earnings and payout information
              </p>
            </div>
            <Link
              href="/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stripe Connect Onboarding Banner */}
        {!hasStripeAccount && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Complete Your Payout Setup
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  To receive payments, you need to connect your bank account with
                  Stripe. This is a one-time setup that takes just a few minutes.
                </p>
                <button
                  onClick={() => onboardMutation.mutate()}
                  disabled={onboardMutation.isPending}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {onboardMutation.isPending ? (
                    'Redirecting...'
                  ) : (
                    <>
                      Complete Setup
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(totalEarnings)}
            subtitle="All time"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrency(pendingAmount)}
            subtitle={`${pendingPayments.length} orders`}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Completed Payments"
            value={succeededPayments.length}
            subtitle="This month"
            icon={CheckCircle}
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['ALL', 'SUCCEEDED', 'PENDING', 'PROCESSING', 'FAILED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.order?.orderNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.order?.customer
                            ? `${payment.order.customer.firstName} ${payment.order.customer.lastName}`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(
                          payment.processedAt || payment.createdAt,
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/orders/${payment.orderId}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {meta.page} of {meta.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border
                           rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= meta.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border
                           rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: 'green' | 'yellow' | 'blue';
}) {
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    SUCCEEDED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}
