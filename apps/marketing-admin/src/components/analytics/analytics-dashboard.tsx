'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useAnalyticsDashboard, usePerformanceTrends, useChannelComparison } from '@/lib/hooks/use-analytics'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function AnalyticsDashboard({ campaignId }: { campaignId: string }) {
  const { dashboard, loading, error, refetch } = useAnalyticsDashboard(campaignId)
  const { trends } = usePerformanceTrends(campaignId, 30)
  const { comparison } = useChannelComparison(campaignId)
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'executive'>('summary')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!dashboard) {
    return <div>No analytics data available</div>
  }

  const keyMetrics = dashboard.keyMetrics || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance insights and reporting
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Impressions"
          value={keyMetrics.totalImpressions?.toLocaleString() || '0'}
          icon={<Eye className="h-5 w-5" />}
          change={15}
        />
        <MetricCard
          title="Total Clicks"
          value={keyMetrics.totalClicks?.toLocaleString() || '0'}
          icon={<BarChart3 className="h-5 w-5" />}
          change={8}
        />
        <MetricCard
          title="Conversions"
          value={keyMetrics.totalConversions?.toLocaleString() || '0'}
          icon={<Users className="h-5 w-5" />}
          change={-2}
        />
        <MetricCard
          title="Total Spend"
          value={`$${(keyMetrics.totalSpend || 0).toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          change={3}
        />
      </div>

      {/* ROI Summary Card */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            ROI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total ROI</p>
              <p className="text-3xl font-bold text-green-600">
                {keyMetrics.roiPercentage || '0%'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-3xl font-bold text-green-600">
                ${(keyMetrics.roi || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average CPC</p>
              <p className="text-3xl font-bold">
                ${keyMetrics.averageCPC || '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (30 Days)</CardTitle>
              <CardDescription>
                Daily impressions, clicks, and conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trends?.data && trends.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No trend data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>
                Metrics breakdown by channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboard.channelMetrics &&
                  Object.entries(dashboard.channelMetrics).map(
                    ([channel, metrics]: [string, any]) => (
                      <div key={channel} className="border rounded-lg p-4">
                        <h4 className="font-semibold capitalize mb-3">
                          {channel}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Impressions
                            </p>
                            <p className="text-lg font-semibold">
                              {metrics.impressions?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Clicks
                            </p>
                            <p className="text-lg font-semibold">
                              {metrics.clicks?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Conversions
                            </p>
                            <p className="text-lg font-semibold">
                              {metrics.conversions?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Spend
                            </p>
                            <p className="text-lg font-semibold">
                              ${(metrics.spend || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Comparison</CardTitle>
              <CardDescription>
                Side-by-side channel performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparison?.comparison ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.values(comparison.comparison)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#3b82f6" />
                    <Bar dataKey="clicks" fill="#ef4444" />
                    <Bar dataKey="conversions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No comparison data available
                </p>
              )}

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Channel Rankings</h4>
                {comparison?.bestPerformingChannel && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">
                        Best Performing
                      </span>
                      <Badge className="capitalize">
                        {comparison.bestPerformingChannel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium">
                        Needs Improvement
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {comparison.worstPerformingChannel}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Create custom performance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <div className="flex gap-2 mt-2">
                  {(['summary', 'detailed', 'executive'] as const).map(
                    (type) => (
                      <Button
                        key={type}
                        variant={
                          reportType === type ? 'default' : 'outline'
                        }
                        onClick={() => setReportType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ),
                  )}
                </div>
              </div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  change,
}: {
  title: string
  value: string
  icon: React.ReactNode
  change: number
}) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
