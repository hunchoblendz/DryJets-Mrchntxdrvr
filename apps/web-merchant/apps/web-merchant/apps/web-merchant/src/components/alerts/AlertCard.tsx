'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  recommendation: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface AlertCardProps {
  alert: MaintenanceAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const severityConfig = {
  CRITICAL: {
    border: 'border-l-error-600 dark:border-l-error-500',
    badge: 'bg-error-gradient text-white border-0',
    icon: 'text-error-600 dark:text-error-500',
  },
  HIGH: {
    border: 'border-l-warning-600 dark:border-l-warning-500',
    badge: 'bg-warning-gradient text-white border-0',
    icon: 'text-warning-600 dark:text-warning-500',
  },
  MEDIUM: {
    border: 'border-l-warning-500 dark:border-l-warning-400',
    badge: 'bg-warning-500 dark:bg-warning-600 text-white border-0',
    icon: 'text-warning-500 dark:text-warning-400',
  },
  LOW: {
    border: 'border-l-primary-600 dark:border-l-primary-500',
    badge: 'bg-primary-600 dark:bg-primary-700 text-white border-0',
    icon: 'text-primary-600 dark:text-primary-500',
  },
};

const statusConfig = {
  RESOLVED: {
    icon: CheckCircle2,
    color: 'text-eco-600 dark:text-eco-500',
    label: 'Resolved',
  },
  ACKNOWLEDGED: {
    icon: Clock,
    color: 'text-primary-600 dark:text-primary-500',
    label: 'Acknowledged',
  },
  OPEN: {
    icon: AlertCircle,
    color: 'text-warning-600 dark:text-warning-500',
    label: 'Open',
  },
};

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const [showRipple, setShowRipple] = useState(false);
  const severityStyle = severityConfig[alert.severity];
  const statusStyle = statusConfig[alert.status];
  const StatusIcon = statusStyle.icon;

  const handleResolve = () => {
    setShowRipple(true);
    setTimeout(() => {
      onResolve(alert.id);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-fast hover:shadow-lift border-l-4',
          severityStyle.border,
          alert.status === 'RESOLVED' && 'opacity-75'
        )}
      >
        <div className="relative">
          {/* Ripple effect for resolved alerts */}
          {showRipple && (
            <motion.div
              className="absolute inset-0 bg-eco-500/20 dark:bg-eco-400/20 rounded-lg pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <StatusIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', statusStyle.color)} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-lg mb-1">{alert.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-medium">{alert.equipmentName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0 ml-4">
                <Badge className={severityStyle.badge}>{alert.severity}</Badge>
              </div>
            </div>

            {/* Alert Type Badge */}
            <div className="mb-4">
              <Badge variant="secondary" className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                {alert.type.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{alert.description}</p>
              </div>
              <div className="rounded-lg bg-primary-50 dark:bg-primary-950/30 p-3">
                <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-foreground">{alert.recommendation}</p>
              </div>
            </div>

            {/* Actions */}
            {alert.status === 'OPEN' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  onClick={handleResolve}
                  className="flex-1 bg-eco-gradient hover:opacity-90"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              </div>
            )}

            {alert.status === 'ACKNOWLEDGED' && (
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={handleResolve}
                  className="w-full bg-eco-gradient hover:opacity-90"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Mark as Resolved
                </Button>
                {alert.acknowledgedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Acknowledged {formatDistanceToNow(new Date(alert.acknowledgedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}

            {alert.status === 'RESOLVED' && alert.resolvedAt && (
              <div className="flex items-center gap-2 pt-2 text-sm text-eco-600 dark:text-eco-500">
                <CheckCircle2 className="h-4 w-4" />
                <span>Resolved {formatDistanceToNow(new Date(alert.resolvedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
