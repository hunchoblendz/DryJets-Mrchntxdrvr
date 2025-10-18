'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';

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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/iot/alerts');

      // Mock data
      setAlerts([
        {
          id: '1',
          equipmentId: '2',
          equipmentName: 'Dryer #1',
          type: 'PREVENTIVE_MAINTENANCE',
          severity: 'MEDIUM',
          title: 'Preventive Maintenance Due',
          description: 'Equipment is overdue for scheduled maintenance (95 days since last service)',
          recommendation: 'Schedule maintenance within the next 7 days to prevent potential issues.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          equipmentId: '3',
          equipmentName: 'Washer #2',
          type: 'HIGH_VIBRATION',
          severity: 'HIGH',
          title: 'High Vibration Detected',
          description: 'Equipment experiencing vibration levels of 6.2 (threshold: 5.0)',
          recommendation: 'Check for load imbalance. Inspect mounting bolts and shock absorbers.',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          equipmentId: '3',
          equipmentName: 'Washer #2',
          type: 'LOW_EFFICIENCY',
          severity: 'MEDIUM',
          title: 'Low Efficiency Alert',
          description: 'Equipment efficiency has dropped to 52% (normal: 85-95%)',
          recommendation: 'Clean filters, check water pressure, inspect heating elements.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      // TODO: API call
      // await fetch(`/api/v1/iot/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date().toISOString() } : a));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      // TODO: API call
      // await fetch(`/api/v1/iot/alerts/${alertId}/resolve`, { method: 'PATCH' });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' as const, resolvedAt: new Date().toISOString() } : a));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status.toLowerCase() === filter;
  });

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-80 bg-muted rounded mb-2 skeleton" />
          <div className="h-5 w-96 bg-muted rounded skeleton" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl skeleton" />
          ))}
        </div>

        {/* Filter Skeleton */}
        <div className="flex space-x-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded skeleton" />
          ))}
        </div>

        {/* Alerts Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-4xl font-heading font-bold bg-brand-gradient bg-clip-text text-transparent">
          Maintenance Alerts
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Monitor and manage equipment maintenance alerts with real-time insights
        </p>
      </motion.div>

      {/* Stats - Using StatCard */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          title="Total Alerts"
          value={stats.total}
          icon={AlertTriangle}
          variant="default"
        />
        <StatCard
          title="Open Alerts"
          value={stats.open}
          icon={AlertCircle}
          variant={stats.open > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Acknowledged"
          value={stats.acknowledged}
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          variant="success"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-brand-gradient' : ''}
        >
          All Alerts ({stats.total})
        </Button>
        <Button
          variant={filter === 'open' ? 'default' : 'outline'}
          onClick={() => setFilter('open')}
          className={filter === 'open' ? 'bg-warning-gradient' : ''}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Open ({stats.open})
        </Button>
        <Button
          variant={filter === 'acknowledged' ? 'default' : 'outline'}
          onClick={() => setFilter('acknowledged')}
          className={filter === 'acknowledged' ? 'bg-primary-600' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          Acknowledged ({stats.acknowledged})
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          onClick={() => setFilter('resolved')}
          className={filter === 'resolved' ? 'bg-eco-gradient' : ''}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Resolved ({stats.resolved})
        </Button>
      </motion.div>

      {/* Alerts List with AnimatePresence for smooth exits */}
      <motion.div variants={fadeInUp}>
        {filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 rounded-2xl bg-gradient-to-br from-eco-50 to-primary-50 dark:from-eco-950/20 dark:to-primary-950/20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-eco-gradient mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'all' ? 'All Clear!' : 'No Alerts'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filter === 'all'
                ? 'All equipment is running smoothly with no maintenance alerts.'
                : `No ${filter} alerts at this time.`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}