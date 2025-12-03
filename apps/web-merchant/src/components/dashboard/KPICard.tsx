'use client';

/**
 * KPI Card Component
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Displays key performance indicators with trends and sparklines
 * Inspired by Linear and Stripe dashboard metrics
 *
 * Features:
 * - Large value display with formatting
 * - Trend indicators (↑↓%) with color coding
 * - Optional sparkline chart
 * - Comparison periods (vs. last week/month/year)
 * - Click-through for detailed views
 * - Loading and error states
 * - Multiple size variants
 */

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type ComparisonPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type KPISize = 'sm' | 'md' | 'lg';

export interface KPICardProps {
  // Core data
  title: string;
  value: string | number;
  subtitle?: string;

  // Trend
  trend?: {
    value: number; // Percentage change (e.g., 12.5 for +12.5%)
    direction: TrendDirection;
    period?: ComparisonPeriod;
  };

  // Sparkline (optional)
  sparklineData?: number[];

  // Appearance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: KPISize;

  // Interaction
  onClick?: () => void;
  loading?: boolean;
  error?: string;

  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  sparklineData,
  icon: Icon,
  variant = 'default',
  size = 'md',
  onClick,
  loading = false,
  error,
  className,
}: KPICardProps) {
  // Format large numbers (e.g., 1234567 → 1.23M)
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(2)}M`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  // Trend color based on direction
  const getTrendColor = () => {
    if (!trend) return 'text-[#6B7280] dark:text-[#A1A1A6]';

    switch (trend.direction) {
      case 'up':
        return 'text-[#00A86B]'; // Success green
      case 'down':
        return 'text-[#FF3B30]'; // Danger red
      case 'neutral':
        return 'text-[#6B7280] dark:text-[#A1A1A6]';
      default:
        return 'text-[#6B7280] dark:text-[#A1A1A6]';
    }
  };

  // Variant styles
  const variantStyles = {
    default: 'border-[#E5E7EB] dark:border-[#2A2A2D]',
    success: 'border-[#00A86B]/20 bg-[#00A86B]/5',
    warning: 'border-[#FF9500]/20 bg-[#FF9500]/5',
    danger: 'border-[#FF3B30]/20 bg-[#FF3B30]/5',
  };

  // Size styles
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizeStyles = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white dark:bg-[#0A0A0B]',
          variantStyles[variant],
          sizeStyles[size],
          'animate-pulse',
          className,
        )}
      >
        <div className="h-4 w-24 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded mb-3" />
        <div className="h-8 w-32 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-[#FF3B30]/20 bg-[#FF3B30]/5',
          sizeStyles[size],
          className,
        )}
      >
        <p className="text-sm text-[#FF3B30]">{error}</p>
      </div>
    );
  }

  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-white dark:bg-[#0A0A0B]',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        isClickable && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#6B7280] dark:text-[#A1A1A6] truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="flex-shrink-0 ml-3">
            <div className="p-2 rounded-lg bg-[#F3F4F6] dark:bg-[#1A1A1D]">
              <Icon className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
            </div>
          </div>
        )}

        {isClickable && !Icon && (
          <ArrowUpRight className="h-4 w-4 text-[#9CA3AF] dark:text-[#636366] flex-shrink-0 ml-3" />
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-3 mb-2">
        <p
          className={cn(
            'font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight',
            valueSizeStyles[size],
          )}
        >
          {formatValue(value)}
        </p>

        {/* Trend Badge */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
              getTrendColor(),
              'bg-current/10',
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
            <span>
              {trend.direction === 'up' && '+'}
              {trend.direction === 'down' && '-'}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Comparison Period */}
      {trend?.period && (
        <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mb-3">
          vs. last {trend.period}
        </p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4">
          <Sparkline
            data={sparklineData}
            height={32}
            color={trend?.direction === 'up' ? '#00A86B' : trend?.direction === 'down' ? '#FF3B30' : '#0066FF'}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Mini Sparkline Chart
 * Simple SVG line chart for trend visualization
 */
interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
}

function Sparkline({ data, height = 32, color = '#0066FF' }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const padding = 2;

  // Normalize data to chart dimensions
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={`${pathData} L ${width - padding},${height} L ${padding},${height} Z`}
        fill={`url(#gradient-${color})`}
      />

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * KPI Grid - Layout helper for multiple KPI cards
 */
export interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ children, columns = 3, className }: KPIGridProps) {
  const gridColsClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridColsClasses[columns], className)}>
      {children}
    </div>
  );
}

/**
 * Comparison KPI Card - Side-by-side comparison
 */
export interface ComparisonKPICardProps {
  title: string;
  current: {
    label: string;
    value: string | number;
  };
  previous: {
    label: string;
    value: string | number;
  };
  trend?: {
    value: number;
    direction: TrendDirection;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>;
  onClick?: () => void;
  className?: string;
}

export function ComparisonKPICard({
  title,
  current,
  previous,
  trend,
  icon: Icon,
  onClick,
  className,
}: ComparisonKPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D]',
        'bg-white dark:bg-[#0A0A0B]',
        'p-6',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#6B7280] dark:text-[#A1A1A6]">
          {title}
        </h3>
        {Icon && (
          <div className="p-2 rounded-lg bg-[#F3F4F6] dark:bg-[#1A1A1D]">
            <Icon className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
          </div>
        )}
      </div>

      {/* Values */}
      <div className="flex items-center justify-between gap-4">
        {/* Current */}
        <div className="flex-1">
          <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mb-1">
            {current.label}
          </p>
          <p className="text-2xl font-semibold text-[#111827] dark:text-[#FAFAFA]">
            {typeof current.value === 'number'
              ? current.value.toLocaleString()
              : current.value}
          </p>
        </div>

        {/* Trend */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md',
              trend.direction === 'up' && 'text-[#00A86B] bg-[#00A86B]/10',
              trend.direction === 'down' && 'text-[#FF3B30] bg-[#FF3B30]/10',
              trend.direction === 'neutral' && 'text-[#6B7280] bg-[#F3F4F6]',
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
            {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {trend.direction === 'up' && '+'}
              {trend.direction === 'down' && '-'}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}

        {/* Previous */}
        <div className="flex-1 text-right">
          <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mb-1">
            {previous.label}
          </p>
          <p className="text-2xl font-semibold text-[#6B7280] dark:text-[#A1A1A6]">
            {typeof previous.value === 'number'
              ? previous.value.toLocaleString()
              : previous.value}
          </p>
        </div>
      </div>
    </div>
  );
}
