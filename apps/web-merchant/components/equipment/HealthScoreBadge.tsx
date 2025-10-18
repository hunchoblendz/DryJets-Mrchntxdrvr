'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface HealthScoreBadgeProps {
  score: number;
  status?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  size?: 'sm' | 'md' | 'lg';
}

export function HealthScoreBadge({ score, status, size = 'md' }: HealthScoreBadgeProps) {
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-green-600 hover:bg-green-700';
    if (score >= 75) return 'bg-blue-600 hover:bg-blue-700';
    if (score >= 60) return 'bg-yellow-600 hover:bg-yellow-700';
    if (score >= 40) return 'bg-orange-600 hover:bg-orange-700';
    return 'bg-red-600 hover:bg-red-700';
  };

  const getHealthIcon = (score: number) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

    if (score >= 90) return <CheckCircle2 className={iconSize} />;
    if (score >= 75) return <Activity className={iconSize} />;
    if (score >= 60) return <AlertCircle className={iconSize} />;
    if (score >= 40) return <AlertTriangle className={iconSize} />;
    return <XCircle className={iconSize} />;
  };

  const getHealthLabel = (score: number) => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 40) return 'POOR';
    return 'CRITICAL';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      className={`${getHealthColor(score)} text-white ${sizeClasses[size]} flex items-center space-x-1`}
    >
      {getHealthIcon(score)}
      <span>{score}%</span>
      {size !== 'sm' && <span className="font-normal">• {status || getHealthLabel(score)}</span>}
    </Badge>
  );
}
