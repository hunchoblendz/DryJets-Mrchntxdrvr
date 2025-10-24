'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  Download,
  Filter,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CostData {
  date: string
  totalSpent: number
  apiCost: number
  promotionCost: number
  roi: number
}

interface CampaignMetric {
  campaign: string
  cost: number
  revenue: number
  roi: number
  reach: number
  engagements: number
  conversions: number
}

interface PlatformEfficiency {
  platform: string
  cpm: number
  engagementRate: number
  roi: number
  costPerEngagement: number
}

export function CostROIDashboard() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [costTrend, setCostTrend] = useState<CostData[]>([])
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetric[]>([])
  const [platformEfficiency, setPlatformEfficiency] = useState<PlatformEfficiency[]>([])
  const [budgetAlerts, setBudgetAlerts] = useState<string[]>([])

  useEffect(() => {
    fetchCostData()
  }, [timeRange, campaignFilter])

  const fetchCostData = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock cost trend data
      const mockCostTrend: CostData[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
        totalSpent: Math.random() * 500 + 100,
        apiCost: Math.random() * 50 + 10,
        promotionCost: Math.random() * 400 + 50,
        roi: Math.random() * 400 + 100,
      }))

      setCostTrend(mockCostTrend)

      // Mock campaign metrics
      const mockCampaigns: CampaignMetric[] = [
        {
          campaign: 'Q4 Product Launch',
          cost: 1250,
          revenue: 4800,
          roi: 284,
          reach: 45000,
          engagements: 2250,
          conversions: 115,
        },
        {
          campaign: 'Black Friday Blitz',
          cost: 2100,
          revenue: 8900,
          roi: 324,
          reach: 78000,
          engagements: 4890,
          conversions: 298,
        },
        {
          campaign: 'Summer Collection',
          cost: 850,
          revenue: 2450,
          roi: 188,
          reach: 32000,
          engagements: 1280,
          conversions: 68,
        },
        {
          campaign: 'Holiday Special',
          cost: 1800,
          revenue: 7200,
          roi: 300,
          reach: 62000,
          engagements: 3410,
          conversions: 201,
        },
      ]

      setCampaignMetrics(mockCampaigns)

      // Mock platform efficiency
      const mockPlatforms: PlatformEfficiency[] = [
        {
          platform: 'TikTok',
          cpm: 9.0,
          engagementRate: 8.9,
          roi: 420,
          costPerEngagement: 0.12,
        },
        {
          platform: 'Instagram',
          cpm: 7.0,
          engagementRate: 6.7,
          roi: 360,
          costPerEngagement: 0.18,
        },
        {
          platform: 'Twitter',
          cpm: 5.0,
          engagementRate: 4.5,
          roi: 280,
          costPerEngagement: 0.22,
        },
        {
          platform: 'LinkedIn',
          cpm: 8.5,
          engagementRate: 3.2,
          roi: 240,
          costPerEngagement: 0.35,
        },
        {
          platform: 'Facebook',
          cpm: 6.0,
          engagementRate: 2.8,
          roi: 200,
          costPerEngagement: 0.42,
        },
        {
          platform: 'YouTube',
          cpm: 6.5,
          engagementRate: 4.2,
          roi: 310,
          costPerEngagement: 0.24,
        },
      ]

      setPlatformEfficiency(mockPlatforms.sort((a, b) => b.roi - a.roi))

      // Set budget alerts
      const alerts: string[] = []
      if (mockCampaigns[1].cost > 2000) {
        alerts.push('Black Friday campaign spending is above 80% of allocated budget')
      }
      if (mockCampaigns.some((c) => c.roi < 200)) {
        alerts.push('Summer Collection campaign has ROI below target threshold')
      }
      setBudgetAlerts(alerts)
    } catch (err) {
      console.error('Failed to fetch cost data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading cost analytics...</p>
        </div>
      </div>
    )
  }

  const totalSpent = costTrend.reduce((sum, d) => sum + d.totalSpent, 0)
  const avgROI =
    campaignMetrics.length > 0
      ? Math.round(
          campaignMetrics.reduce((sum, c) => sum + c.roi, 0) /
            campaignMetrics.length
        )
      : 0
  const totalRevenue = campaignMetrics.reduce((sum, c) => sum + c.revenue, 0)
  const totalProfit = totalRevenue - totalSpent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Cost & ROI Analytics
          </h2>
          <p className="text-gray-600 mt-2">
            Track spending and return on investment across campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Budget Alerts:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {budgetAlerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Total Spent</p>
              <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Across all campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-green-600 text-sm font-semibold">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">From paid campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-blue-600 text-sm font-semibold">Avg ROI</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-600">{avgROI}%</p>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Across campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-purple-600 text-sm font-semibold">Net Profit</p>
              <p className="text-3xl font-bold text-purple-600">
                ${totalProfit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Revenue - Costs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend Over Time</CardTitle>
          <CardDescription>
            Breakdown of spending by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="apiCost" fill="#3b82f6" name="API Costs" />
              <Bar
                dataKey="promotionCost"
                fill="#f59e0b"
                name="Promotion Costs"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* ROI Trend */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#10b981"
                  name="ROI %"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost vs Engagement Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Efficiency Analysis</CardTitle>
            <CardDescription>
              Cost per engagement by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="costPerEngagement" name="Cost per Engagement ($)" />
                <YAxis dataKey="engagementRate" name="Engagement Rate (%)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Platforms"
                  data={platformEfficiency}
                  fill="#8b5cf6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Detailed ROI breakdown by campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                  <th className="text-right py-3 px-4 font-semibold">Cost</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                  <th className="text-right py-3 px-4 font-semibold">Reach</th>
                  <th className="text-right py-3 px-4 font-semibold">Engagements</th>
                  <th className="text-right py-3 px-4 font-semibold">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {campaignMetrics.map((campaign) => (
                  <tr
                    key={campaign.campaign}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {campaign.campaign}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${campaign.cost.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      ${campaign.revenue.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        variant={
                          campaign.roi >= 300 ? 'default' : 'secondary'
                        }
                      >
                        {campaign.roi}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      {(campaign.reach / 1000).toFixed(1)}K
                    </td>
                    <td className="text-right py-3 px-4">
                      {campaign.engagements.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {campaign.conversions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Efficiency Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Efficiency Rankings</CardTitle>
          <CardDescription>
            Ranked by ROI and cost effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {platformEfficiency.map((platform, index) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{platform.platform}</p>
                    <p className="text-sm text-gray-600">
                      ${platform.costPerEngagement.toFixed(2)}/engagement •{' '}
                      {platform.engagementRate}% engagement rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-green-600">
                      {platform.roi}%
                    </span>
                    <span className="text-sm text-gray-600">ROI</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    CPM: ${platform.cpm.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-blue-900">
            ✓ Increase budget for TikTok campaigns - showing 420% ROI
          </p>
          <p className="text-sm text-blue-900">
            ✓ Optimize LinkedIn strategy - lower engagement rate (3.2%) vs cost
          </p>
          <p className="text-sm text-blue-900">
            ✓ Double down on Black Friday campaign - highest revenue and ROI
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
