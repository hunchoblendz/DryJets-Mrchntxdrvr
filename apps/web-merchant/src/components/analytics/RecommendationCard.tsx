'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { TrendingDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  potentialSavings: {
    amount: number;
    unit: string;
    period: string;
  };
  actionItems: string[];
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const priorityConfig = {
  HIGH: {
    border: 'border-l-error-600 dark:border-l-error-500',
    badge: 'bg-error-gradient text-white border-0',
  },
  MEDIUM: {
    border: 'border-l-warning-600 dark:border-l-warning-500',
    badge: 'bg-warning-gradient text-white border-0',
  },
  LOW: {
    border: 'border-l-primary-600 dark:border-l-primary-500',
    badge: 'bg-primary-600 dark:bg-primary-700 text-white border-0',
  },
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityStyle = priorityConfig[recommendation.priority as keyof typeof priorityConfig];
  const annualSavings = recommendation.potentialSavings.amount * 12;
  const roiScore = Math.min(100, (annualSavings / 500) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-fast hover:shadow-lift border-l-4',
          priorityStyle.border
        )}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg mb-2">{recommendation.title}</h3>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <Badge className={priorityStyle.badge}>{recommendation.priority}</Badge>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs mb-4">
            {recommendation.type}
          </Badge>

          <div className="rounded-lg bg-gradient-to-br from-eco-50 to-eco-100 dark:from-eco-950/30 dark:to-eco-900/20 p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-eco-600 dark:text-eco-500" />
                  <span className="font-heading font-semibold text-eco-900 dark:text-eco-100 text-lg">
                    ${recommendation.potentialSavings.amount}/<span className="text-sm">{recommendation.potentialSavings.period}</span>
                  </span>
                </div>
                <p className="text-sm text-eco-700 dark:text-eco-400">
                  ${annualSavings.toLocaleString()}/year potential savings
                </p>
              </div>
              <div className="flex-shrink-0">
                <CircularProgress
                  value={roiScore}
                  size={80}
                  variant="eco"
                  showValue
                  label="%"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3 text-foreground">Action Items:</p>
            <ul className="space-y-2">
              {recommendation.actionItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-eco-600 dark:text-eco-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
