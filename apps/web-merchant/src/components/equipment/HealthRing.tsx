'use client';

import * as React from 'react';
import { CircularProgress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type HealthStatus = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

interface HealthRingProps {
  score: number;
  status?: HealthStatus;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

const statusLabels: Record<HealthStatus, string> = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical',
};

const statusColors: Record<HealthStatus, string> = {
  EXCELLENT: 'text-eco-600 dark:text-eco-400',
  GOOD: 'text-primary-600 dark:text-primary-400',
  FAIR: 'text-warning-600 dark:text-warning-400',
  POOR: 'text-error-600 dark:text-error-400',
  CRITICAL: 'text-error-700 dark:text-error-500',
};

function getStatusFromScore(score: number): HealthStatus {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  if (score >= 30) return 'POOR';
  return 'CRITICAL';
}

export function HealthRing({
  score,
  status,
  size = 120,
  className,
  showLabel = true,
}: HealthRingProps) {
  const healthStatus = status || getStatusFromScore(score);
  const statusLabel = statusLabels[healthStatus];
  const statusColor = statusColors[healthStatus];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <CircularProgress value={score} size={size} showValue label="%" />
      {showLabel && (
        <span className={cn('text-sm font-medium', statusColor)}>{statusLabel}</span>
      )}
    </div>
  );
}
