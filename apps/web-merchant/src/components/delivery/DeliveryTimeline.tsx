'use client';

/**
 * DeliveryTimeline Component
 *
 * Visual timeline showing delivery progress for "dummy users"
 * Clear, simple status tracking with animations
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  UserCheck,
  Truck,
  Navigation,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

interface TimelineEvent {
  status: DeliveryStatus;
  label: string;
  description?: string;
  timestamp?: Date;
  icon: React.ComponentType<{ className?: string }>;
}

interface DeliveryTimelineProps {
  currentStatus: DeliveryStatus;
  events?: Array<{
    status: DeliveryStatus;
    timestamp: Date;
    note?: string;
  }>;
  estimatedDelivery?: Date;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showTime?: boolean;
}

// Status definitions with icons
const statusDefinitions: Record<DeliveryStatus, TimelineEvent> = {
  pending: {
    status: 'pending',
    label: 'Order Placed',
    description: 'Waiting for confirmation',
    icon: ShoppingBag,
  },
  confirmed: {
    status: 'confirmed',
    label: 'Confirmed',
    description: 'Order accepted',
    icon: CheckCircle2,
  },
  assigned: {
    status: 'assigned',
    label: 'Driver Assigned',
    description: 'Driver on the way to pickup',
    icon: UserCheck,
  },
  picked_up: {
    status: 'picked_up',
    label: 'Picked Up',
    description: 'Items collected',
    icon: Package,
  },
  in_transit: {
    status: 'in_transit',
    label: 'In Transit',
    description: 'On the way to you',
    icon: Truck,
  },
  arriving: {
    status: 'arriving',
    label: 'Arriving Soon',
    description: 'Almost there!',
    icon: Navigation,
  },
  delivered: {
    status: 'delivered',
    label: 'Delivered',
    description: 'Order complete',
    icon: CheckCircle2,
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    description: 'Order was cancelled',
    icon: AlertCircle,
  },
};

// Standard delivery flow order
const standardFlow: DeliveryStatus[] = [
  'pending',
  'confirmed',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
];

export function DeliveryTimeline({
  currentStatus,
  events = [],
  estimatedDelivery,
  className,
  variant = 'horizontal',
  showTime = true,
}: DeliveryTimelineProps) {
  // Get the index of current status in the flow
  const currentIndex = standardFlow.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  // Build timeline items
  const timelineItems = standardFlow.map((status, index) => {
    const definition = statusDefinitions[status];
    const event = events.find((e) => e.status === status);
    const isComplete = index < currentIndex;
    const isCurrent = index === currentIndex;
    const isPending = index > currentIndex;

    return {
      ...definition,
      timestamp: event?.timestamp,
      note: event?.note,
      isComplete,
      isCurrent,
      isPending,
    };
  });

  if (variant === 'vertical') {
    return (
      <VerticalTimeline
        items={timelineItems}
        isCancelled={isCancelled}
        estimatedDelivery={estimatedDelivery}
        showTime={showTime}
        className={className}
      />
    );
  }

  return (
    <HorizontalTimeline
      items={timelineItems}
      isCancelled={isCancelled}
      estimatedDelivery={estimatedDelivery}
      showTime={showTime}
      className={className}
    />
  );
}

// Horizontal Timeline (for wide screens / dashboards)
function HorizontalTimeline({
  items,
  isCancelled,
  estimatedDelivery,
  showTime,
  className,
}: {
  items: Array<TimelineEvent & { isComplete: boolean; isCurrent: boolean; isPending: boolean; note?: string }>;
  isCancelled: boolean;
  estimatedDelivery?: Date;
  showTime: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress Line */}
      <div className="relative flex items-center justify-between mb-4">
        {/* Background line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-border-subtle dark:bg-[#2A2A2D] rounded-full" />

        {/* Progress line */}
        <motion.div
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full',
            isCancelled ? 'bg-error-500' : 'bg-primary-500'
          )}
          initial={{ width: '0%' }}
          animate={{
            width: `${(items.filter((i) => i.isComplete || i.isCurrent).length / items.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Steps */}
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.status} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'transition-all duration-300',
                  item.isComplete && 'bg-primary-500 text-white',
                  item.isCurrent && !isCancelled && 'bg-primary-500 text-white ring-4 ring-primary-500/20',
                  item.isCurrent && isCancelled && 'bg-error-500 text-white ring-4 ring-error-500/20',
                  item.isPending && 'bg-background-subtle dark:bg-[#1A1A1D] text-foreground-tertiary'
                )}
              >
                {item.isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className={cn('h-5 w-5', item.isCurrent && 'animate-pulse')} />
                )}
              </motion.div>

              {/* Label below */}
              <div className="absolute top-12 text-center w-20">
                <p
                  className={cn(
                    'text-xs font-medium',
                    (item.isComplete || item.isCurrent) && 'text-foreground-DEFAULT dark:text-[#FAFAFA]',
                    item.isPending && 'text-foreground-tertiary dark:text-[#636366]'
                  )}
                >
                  {item.label}
                </p>
                {showTime && item.timestamp && (
                  <p className="text-xs text-foreground-tertiary dark:text-[#636366] mt-0.5">
                    {formatTime(item.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ETA Banner */}
      {estimatedDelivery && !isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800"
        >
          <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm text-primary-700 dark:text-primary-300">
            Estimated delivery: <strong>{formatDateTime(estimatedDelivery)}</strong>
          </span>
        </motion.div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex items-center justify-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800"
        >
          <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400" />
          <span className="text-sm text-error-700 dark:text-error-300">
            This order has been cancelled
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Vertical Timeline (for mobile / order details)
function VerticalTimeline({
  items,
  isCancelled,
  estimatedDelivery,
  showTime,
  className,
}: {
  items: Array<TimelineEvent & { isComplete: boolean; isCurrent: boolean; isPending: boolean; note?: string }>;
  isCancelled: boolean;
  estimatedDelivery?: Date;
  showTime: boolean;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;

          return (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-5 top-10 w-0.5 h-[calc(100%-2.5rem)]',
                    item.isComplete ? 'bg-primary-500' : 'bg-border-subtle dark:bg-[#2A2A2D]'
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  'transition-all duration-300',
                  item.isComplete && 'bg-primary-500 text-white',
                  item.isCurrent && !isCancelled && 'bg-primary-500 text-white ring-4 ring-primary-500/20',
                  item.isCurrent && isCancelled && 'bg-error-500 text-white ring-4 ring-error-500/20',
                  item.isPending && 'bg-background-subtle dark:bg-[#1A1A1D] text-foreground-tertiary border border-border-subtle dark:border-[#2A2A2D]'
                )}
              >
                {item.isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className={cn('h-5 w-5', item.isCurrent && 'animate-pulse')} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        (item.isComplete || item.isCurrent) && 'text-foreground-DEFAULT dark:text-[#FAFAFA]',
                        item.isPending && 'text-foreground-tertiary dark:text-[#636366]'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs text-foreground-secondary dark:text-[#A1A1A6] mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-foreground-tertiary dark:text-[#636366] mt-1 italic">
                        "{item.note}"
                      </p>
                    )}
                  </div>

                  {showTime && item.timestamp && (
                    <span className="text-xs text-foreground-tertiary dark:text-[#636366] whitespace-nowrap">
                      {formatTime(item.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ETA */}
      {estimatedDelivery && !isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800"
        >
          <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm text-primary-700 dark:text-primary-300">
            Estimated: <strong>{formatDateTime(estimatedDelivery)}</strong>
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Compact Timeline for list views
export function CompactDeliveryStatus({
  status,
  eta,
  className,
}: {
  status: DeliveryStatus;
  eta?: number; // minutes
  className?: string;
}) {
  const definition = statusDefinitions[status];
  const Icon = definition.icon;
  const isCancelled = status === 'cancelled';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          status === 'delivered' && 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
          status === 'cancelled' && 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
          status === 'in_transit' && 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
          !['delivered', 'cancelled', 'in_transit'].includes(status) &&
            'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-xs font-medium',
            isCancelled ? 'text-error-600 dark:text-error-400' : 'text-foreground-DEFAULT dark:text-[#FAFAFA]'
          )}
        >
          {definition.label}
        </span>
        {eta && !isCancelled && status !== 'delivered' && (
          <span className="text-xs text-foreground-tertiary dark:text-[#636366]">{eta} min</span>
        )}
      </div>
    </div>
  );
}

// Format helpers
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateTime(date: Date): string {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today at ${formatTime(date)}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default DeliveryTimeline;
