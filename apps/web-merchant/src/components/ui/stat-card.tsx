'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  decimals?: number;
  description?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-eco-200 bg-eco-50/50 dark:border-eco-800 dark:bg-eco-950/50',
  warning: 'border-warning-200 bg-warning-50/50 dark:border-warning-800 dark:bg-warning-950/50',
  error: 'border-error-200 bg-error-50/50 dark:border-error-800 dark:bg-error-950/50',
  info: 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/50',
};

const valueColors = {
  default: 'text-foreground',
  success: 'text-eco-600 dark:text-eco-400',
  warning: 'text-warning-600 dark:text-warning-400',
  error: 'text-error-600 dark:text-error-400',
  info: 'text-primary-600 dark:text-primary-400',
};

const iconColors = {
  default: 'text-muted-foreground',
  success: 'text-eco-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  info: 'text-primary-500',
};

export function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  icon: Icon,
  variant = 'default',
  className,
  decimals = 0,
  description,
}: StatCardProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card className={cn('shadow-lift-hover', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        {Icon && <Icon className={cn('h-4 w-4', iconColors[variant])} />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          {prefix && <span className={cn('text-2xl font-bold', valueColors[variant])}>{prefix}</span>}
          <div className={cn('text-3xl font-bold animate-count-up', valueColors[variant])}>
            {isVisible ? (
              <CountUp
                end={value}
                duration={1}
                decimals={decimals}
                separator=","
                preserveValue
              />
            ) : (
              <span>0</span>
            )}
          </div>
          {suffix && <span className="text-xl text-muted-foreground">{suffix}</span>}
        </div>

        {trend !== undefined && (
          <div className="mt-2 flex items-center space-x-1">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-eco-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-error-500" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend >= 0 ? 'text-eco-600 dark:text-eco-400' : 'text-error-600 dark:text-error-400'
              )}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}

        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
