'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton';
import { RecommendationCard } from '@/components/analytics/RecommendationCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Droplets, DollarSign, Lightbulb, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';

interface ResourceData {
  date: string;
  energy: number;
  water: number;
  cost: number;
}

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

export default function AnalyticsPage() {
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // TODO: Replace with actual API calls
      // const resourceResponse = await fetch('/api/v1/iot/optimization/usage-summary');
      // const recsResponse = await fetch('/api/v1/iot/optimization/recommendations');

      // Mock resource data (last 30 days)
      const mockResourceData: ResourceData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        mockResourceData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          energy: 45 + Math.random() * 15,
          water: 280 + Math.random() * 60,
          cost: 32 + Math.random() * 8,
        });
      }
      setResourceData(mockResourceData);

      // Mock recommendations
      setRecommendations([
        {
          type: 'ENERGY',
          priority: 'HIGH',
          title: 'High Energy Consumption Detected',
          description: 'Your equipment is consuming an average of 2.8kW during operating hours, which is 20% higher than industry standards (2.2kW).',
          potentialSavings: {
            amount: 135,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Clean lint filters and ventilation systems',
            'Inspect heating elements for buildup',
            'Consider upgrading to energy-efficient equipment',
            'Schedule preventive maintenance',
          ],
        },
        {
          type: 'SCHEDULING',
          priority: 'MEDIUM',
          title: 'Off-Peak Energy Opportunity',
          description: 'Shifting 30% of operations to off-peak hours (10pm-6am) could reduce energy costs significantly.',
          potentialSavings: {
            amount: 85,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Review customer pickup/delivery preferences',
            'Offer incentives for off-peak orders',
            'Batch process during off-peak hours',
          ],
        },
        {
          type: 'WATER',
          priority: 'MEDIUM',
          title: 'Water Optimization Available',
          description: 'Average water usage is 52L per cycle. Optimizing wash cycles could reduce this to 42L.',
          potentialSavings: {
            amount: 45,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Use appropriate water levels for load size',
            'Implement water recycling systems',
            'Check for leaks and inefficiencies',
          ],
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings.amount, 0);
  const avgEnergy = resourceData.reduce((sum, d) => sum + d.energy, 0) / resourceData.length || 0;
  const avgWater = resourceData.reduce((sum, d) => sum + d.water, 0) / resourceData.length || 0;
  const avgCost = resourceData.reduce((sum, d) => sum + d.cost, 0) / resourceData.length || 0;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="h-10 w-80 bg-muted rounded mb-2 skeleton" />
          <div className="h-5 w-96 bg-muted rounded skeleton" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl skeleton" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>

        <SkeletonChart className="mb-6" />

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
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-4xl font-heading font-bold bg-brand-gradient bg-clip-text text-transparent">
          Resource Analytics & Optimization
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Monitor energy, water usage, and discover cost-saving opportunities
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          title="Potential Monthly Savings"
          value={totalSavings}
          prefix="$"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Avg Daily Energy"
          value={parseFloat(avgEnergy.toFixed(1))}
          suffix=" kWh"
          icon={Zap}
          variant="info"
          decimals={1}
        />
        <StatCard
          title="Avg Daily Water"
          value={Math.round(avgWater)}
          suffix=" L"
          icon={Droplets}
          variant="info"
        />
        <StatCard
          title="Avg Daily Cost"
          value={parseFloat(avgCost.toFixed(2))}
          prefix="$"
          icon={TrendingDown}
          variant="default"
          decimals={2}
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lift-hover border-primary-100 dark:border-primary-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-600" />
              Energy Consumption
            </CardTitle>
            <p className="text-sm text-muted-foreground">Daily kWh usage - Last 30 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A78FF" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0A78FF" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="energy" fill="url(#energyGradient)" name="Energy (kWh)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lift-hover border-eco-100 dark:border-eco-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-eco-600" />
              Water Usage
            </CardTitle>
            <p className="text-sm text-muted-foreground">Daily liters - Last 30 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00B7A5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00B7A5" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="water" fill="url(#waterGradient)" name="Water (L)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card className="mb-8 shadow-lift-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-eco-600" />
              Daily Operating Costs
            </CardTitle>
            <p className="text-sm text-muted-foreground">Combined energy and water costs - Last 30 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resourceData}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0A78FF" />
                    <stop offset="100%" stopColor="#00B7A5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="url(#costGradient)"
                  name="Cost ($)"
                  strokeWidth={3}
                  dot={{ fill: '#0A78FF', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/30 dark:to-warning-800/20">
            <Lightbulb className="h-6 w-6 text-warning-600 dark:text-warning-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold">Optimization Recommendations</h2>
        </div>

        <div className="space-y-4 mb-8">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>

        <Card className="bg-gradient-to-br from-primary-50 to-eco-50 dark:from-primary-950/30 dark:to-eco-950/20 border-primary-200 dark:border-primary-800 shadow-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 rounded-full bg-eco-gradient">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Annual ROI Projection
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              By implementing all recommendations above
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Annual Savings</p>
                <p className="text-4xl font-heading font-bold bg-eco-gradient bg-clip-text text-transparent">
                  ${(totalSavings * 12).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">per year</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">Implementation Cost</p>
                <p className="text-4xl font-heading font-bold text-foreground">$0 - $500</p>
                <p className="text-xs text-eco-600 dark:text-eco-500 mt-1 font-medium">Mostly operational changes</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">First Year ROI</p>
                <p className="text-4xl font-heading font-bold text-eco-600 dark:text-eco-500">300-500%</p>
                <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}