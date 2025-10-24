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
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

interface SystemHealth {
  apiStatus: 'healthy' | 'degraded' | 'offline'
  databaseStatus: 'healthy' | 'degraded' | 'offline'
  cacheStatus: 'healthy' | 'degraded' | 'offline'
  lastCheck: Date
}

interface PerformanceMetrics {
  apiLatency: number // ms
  errorRate: number // %
  uptime: number // %
  requestsPerSecond: number
}

export default function AdminDashboardPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiStatus: 'healthy',
    databaseStatus: 'healthy',
    cacheStatus: 'healthy',
    lastCheck: new Date(),
  })
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiLatency: 45,
    errorRate: 0.2,
    uptime: 99.95,
    requestsPerSecond: 1250,
  })
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const performanceData = [
    { time: '00:00', latency: 42, errorRate: 0.1, requests: 980 },
    { time: '04:00', latency: 48, errorRate: 0.2, requests: 1050 },
    { time: '08:00', latency: 45, errorRate: 0.15, requests: 1200 },
    { time: '12:00', latency: 52, errorRate: 0.3, requests: 1450 },
    { time: '16:00', latency: 50, errorRate: 0.25, requests: 1380 },
    { time: '20:00', latency: 46, errorRate: 0.2, requests: 1280 },
  ]

  const endpointStats = [
    { endpoint: '/workflows', calls: 8420, avgLatency: 45, errors: 12 },
    { endpoint: '/platforms/analyze', calls: 5230, avgLatency: 120, errors: 8 },
    { endpoint: '/costs/estimate', calls: 3450, avgLatency: 35, errors: 5 },
    { endpoint: '/publishing-platforms', calls: 2890, avgLatency: 25, errors: 2 },
    { endpoint: '/campaigns', calls: 2145, avgLatency: 40, errors: 4 },
  ]

  const alerts = [
    {
      id: 1,
      severity: 'warning',
      message: 'API latency increased by 15% in last hour',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: 2,
      severity: 'info',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 45 * 60000),
    },
    {
      id: 3,
      severity: 'warning',
      message: 'Cache hit ratio dropped below 85%',
      timestamp: new Date(Date.now() - 2 * 3600000),
    },
  ]

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, fetch from health check endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSystemHealth({
        apiStatus: Math.random() > 0.05 ? 'healthy' : 'degraded',
        databaseStatus: Math.random() > 0.02 ? 'healthy' : 'degraded',
        cacheStatus: Math.random() > 0.1 ? 'healthy' : 'degraded',
        lastCheck: new Date(),
      })

      setMetrics({
        apiLatency: Math.floor(Math.random() * 50) + 30,
        errorRate: Math.random() * 0.5,
        uptime: 99.9 + Math.random() * 0.05,
        requestsPerSecond: Math.floor(Math.random() * 500) + 1000,
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: 'healthy' | 'degraded' | 'offline') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'offline') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'offline':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">System Dashboard</h1>
          <p className="text-gray-600">
            Monitor system health and performance
          </p>
        </div>
        <Button
          onClick={fetchSystemHealth}
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Checking...' : 'Refresh'}
        </Button>
      </div>

      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">API Server</CardTitle>
              {getStatusIcon(systemHealth.apiStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(systemHealth.apiStatus)}>
              {systemHealth.apiStatus.charAt(0).toUpperCase() + systemHealth.apiStatus.slice(1)}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              Latency: {metrics.apiLatency}ms
            </p>
            <p className="text-xs text-gray-500">
              Requests/sec: {metrics.requestsPerSecond.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Database</CardTitle>
              {getStatusIcon(systemHealth.databaseStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(systemHealth.databaseStatus)}>
              {systemHealth.databaseStatus.charAt(0).toUpperCase() + systemHealth.databaseStatus.slice(1)}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              Connections: 45/100
            </p>
            <p className="text-xs text-gray-500">
              Query Time: 12ms avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cache</CardTitle>
              {getStatusIcon(systemHealth.cacheStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(systemHealth.cacheStatus)}>
              {systemHealth.cacheStatus.charAt(0).toUpperCase() + systemHealth.cacheStatus.slice(1)}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              Hit Ratio: 87.5%
            </p>
            <p className="text-xs text-gray-500">
              Memory: 512MB / 1GB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <p className="text-gray-600 text-sm">Uptime</p>
              </div>
              <p className="text-2xl font-bold">{metrics.uptime.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <p className="text-gray-600 text-sm">API Latency</p>
              </div>
              <p className="text-2xl font-bold">{metrics.apiLatency}ms</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-gray-600 text-sm">Error Rate</p>
              </div>
              <p className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-gray-600 text-sm">Requests/sec</p>
              </div>
              <p className="text-2xl font-bold">{metrics.requestsPerSecond.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>API Latency Trend</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  name="Latency (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>Requests per second</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#10b981" name="Requests/sec" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Top API Endpoints</CardTitle>
          <CardDescription>
            Performance metrics for busiest endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Endpoint</th>
                  <th className="text-right py-3 px-4 font-semibold">Calls</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Latency</th>
                  <th className="text-right py-3 px-4 font-semibold">Errors</th>
                </tr>
              </thead>
              <tbody>
                {endpointStats.map((stat) => (
                  <tr key={stat.endpoint} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{stat.endpoint}</td>
                    <td className="text-right py-3 px-4">
                      {stat.calls.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">{stat.avgLatency}ms</td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        variant={stat.errors > 0 ? 'destructive' : 'secondary'}
                      >
                        {stat.errors}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-medium ${
                    alert.severity === 'warning'
                      ? 'text-yellow-900'
                      : 'text-blue-900'
                  }`}>
                    {alert.message}
                  </p>
                  <p className={`text-xs mt-1 ${
                    alert.severity === 'warning'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }`}>
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge
                  variant={
                    alert.severity === 'warning' ? 'secondary' : 'outline'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Last Refresh Info */}
      <div className="text-right text-xs text-gray-500">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  )
}
