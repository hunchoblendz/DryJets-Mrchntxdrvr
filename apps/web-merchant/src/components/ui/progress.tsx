'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
  variant?: 'primary' | 'eco' | 'warning' | 'error';
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      size = 120,
      strokeWidth = 8,
      className,
      showValue = true,
      label,
      variant = 'primary',
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const getColor = () => {
      if (variant === 'eco') return '#00B7A5';
      if (variant === 'warning') return '#FFB74D';
      if (variant === 'error') return '#FF6B6B';

      // Default primary color based on value (health score logic)
      if (value >= 80) return '#00B7A5'; // Excellent - eco green
      if (value >= 70) return '#0A78FF'; // Good - primary blue
      if (value >= 40) return '#FFB74D'; // Fair - warning amber
      return '#FF6B6B'; // Poor/Critical - error red
    };

    const color = getColor();

    return (
      <div ref={ref} className={cn('relative inline-flex', className)}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>
              {Math.round(value)}
            </span>
            {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };
