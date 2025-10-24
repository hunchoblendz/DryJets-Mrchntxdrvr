'use client'

import { useState, useEffect } from 'react'
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
  ScatterChart,
  Scatter,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Filter } from 'lucide-react'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
const PLATFORMS = [
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
]

interface AnalyticsData {
  date: string
  engagement: number
  reach: number
  impressions: number
  cost: number
  roi: number
  conversions: number
}

interface PlatformAnalytics {
  platform: string
  reach: number
  engagement: number
  impressions: number
  engagementRate: number
  cost: number
  roi: number
  conversions: number
  conversionRate: number
  cpc: number
  cpm: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [platformMetrics, setPlatformMetrics] = useState<PlatformAnalytics[]>([])
  const [loading, setLoading] = useState(false)

  // Initialize with sample data
  useEffect(() => {
    loadAnalytics()
  }, [timeRange, selectedPlatforms])

  const loadAnalytics = () => {
    setLoading(true)
    setTimeout(() => {
      // Generate sample analytics data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const data: AnalyticsData[] = []

      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - i))

        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          engagement: Math.floor(Math.random() * 5000) + 2000,
          reach: Math.floor(Math.random() * 50000) + 20000,
          impressions: Math.floor(Math.random() * 100000) + 50000,
          cost: Math.floor(Math.random() * 500) + 100,
          roi: Math.random() * 300 + 50,
          conversions: Math.floor(Math.random() * 50) + 10,
        })
      }

      setAnalyticsData(data)

      // Generate platform metrics
      const platforms: PlatformAnalytics[] = selectedPlatforms.map((platform) => ({
        platform,
        reach: Math.floor(Math.random() * 100000) + 50000,
        engagement: Math.floor(Math.random() * 5000) + 2000,
        impressions: Math.floor(Math.random() * 200000) + 100000,
        engagementRate: Math.random() * 10 + 2,
        cost: Math.floor(Math.random() * 1000) + 200,
        roi: Math.random() * 400 + 50,
        conversions: Math.floor(Math.random() * 100) + 20,
        conversionRate: Math.random() * 5 + 1,
        cpc: (Math.random() * 5 + 0.5).toFixed(2) as any,
        cpm: (Math.random() * 15 + 3).toFixed(2) as any,
      }))

      setPlatformMetrics(platforms)
      setLoading(false)
    }, 500)
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    )
  }

  const exportData = (format: 'csv' | 'json') => {
    let content = ''
    let filename = `analytics_${new Date().toISOString().split('T')[0]}`

    if (format === 'csv') {
      content = 'Date,Engagement,Reach,Impressions,Cost,ROI,Conversions\n'
      analyticsData.forEach((row) => {
        content += `${row.date},${row.engagement},${row.reach},${row.impressions},${row.cost},${row.roi.toFixed(2)},${row.conversions}\n`
      })
      filename += '.csv'
    } else {
      content = JSON.stringify(
        {
          analytics: analyticsData,
          platforms: platformMetrics,
          timeRange,
          exportDate: new Date().toISOString(),
        },
        null,
        2,
      )
      filename += '.json'
    }

    const blob = new Blob([content], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const totalReach = analyticsData.reduce((sum, d) => sum + d.reach, 0)
  const totalEngagement = analyticsData.reduce((sum, d) => sum + d.engagement, 0)
  const totalImpressions = analyticsData.reduce((sum, d) => sum + d.impressions, 0)
  const totalCost = analyticsData.reduce((sum, d) => sum + d.cost, 0)
  const avgROI = analyticsData.length > 0
    ? analyticsData.reduce((sum, d) => sum + d.roi, 0) / analyticsData.length
    : 0
  const totalConversions = analyticsData.reduce((sum, d) => sum + d.conversions, 0)

  const conversionFunnel = [
    { stage: 'Impressions', value: totalImpressions },
    { stage: 'Reach', value: totalReach },
    { stage: 'Engagement', value: totalEngagement },
    { stage: 'Conversions', value: totalConversions },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Detailed performance metrics and insights</p>
        </div>

        {/* Controls */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters & Options</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={loadAnalytics}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={() => setCompareMode(!compareMode)}
                  variant={compareMode ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Compare
                </Button>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <Badge
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  variant={selectedPlatforms.includes(platform.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  {platform.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(totalReach / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-gray-500 mt-1">People reached</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(totalEngagement / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-gray-500 mt-1">Total interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(totalImpressions / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-gray-500 mt-1">Content views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalConversions}</div>
              <p className="text-xs text-gray-500 mt-1">Completed actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalCost.toFixed(0)}</div>
              <p className="text-xs text-gray-500 mt-1">Campaign spend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{avgROI.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Daily engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10b981"
                    name="Engagement"
                  />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#3b82f6"
                    name="Reach"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost & ROI Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Cost & ROI Trend</CardTitle>
              <CardDescription>Spending and return over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cost"
                    stroke="#ef4444"
                    name="Cost ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="roi"
                    stroke="#8b5cf6"
                    name="ROI (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>Engagement rate by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagementRate" fill="#3b82f6" name="Engagement Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="stage" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform ROI Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Distribution</CardTitle>
              <CardDescription>Return by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformMetrics}
                    dataKey="roi"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {platformMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency</CardTitle>
              <CardDescription>Cost per metric by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="cpc"
                    name="Cost Per Click"
                    unit="$"
                    type="number"
                  />
                  <YAxis
                    dataKey="roi"
                    name="ROI"
                    unit="%"
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Platforms"
                    data={platformMetrics}
                    fill="#8b5cf6"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance Details</CardTitle>
            <CardDescription>Comprehensive metrics for each platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-semibold">Platform</th>
                    <th className="px-4 py-2 text-right font-semibold">Reach</th>
                    <th className="px-4 py-2 text-right font-semibold">Engagement</th>
                    <th className="px-4 py-2 text-right font-semibold">Eng. Rate</th>
                    <th className="px-4 py-2 text-right font-semibold">Conversions</th>
                    <th className="px-4 py-2 text-right font-semibold">Conv. Rate</th>
                    <th className="px-4 py-2 text-right font-semibold">Cost</th>
                    <th className="px-4 py-2 text-right font-semibold">ROI</th>
                    <th className="px-4 py-2 text-right font-semibold">CPM</th>
                    <th className="px-4 py-2 text-right font-semibold">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {platformMetrics.map((metric) => (
                    <tr key={metric.platform} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        <Badge variant="outline">
                          {PLATFORMS.find((p) => p.id === metric.platform)?.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{metric.reach.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{metric.engagement.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {metric.engagementRate.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right">{metric.conversions}</td>
                      <td className="px-4 py-3 text-right text-blue-600">
                        {metric.conversionRate.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right">${metric.cost.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right text-purple-600">
                        {metric.roi.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right">${metric.cpm}</td>
                      <td className="px-4 py-3 text-right">${metric.cpc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => exportData('csv')} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => exportData('json')} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  )
}
