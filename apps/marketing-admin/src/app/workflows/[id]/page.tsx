'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const WORKFLOW_STATUSES = {
  CONFIGURING: { label: 'Configuring', progress: 20, color: 'bg-blue-500' },
  GENERATING: { label: 'Generating Content', progress: 40, color: 'bg-purple-500' },
  REVIEW: { label: 'In Review', progress: 60, color: 'bg-yellow-500' },
  PUBLISHING: { label: 'Publishing', progress: 80, color: 'bg-green-500' },
  COMPLETED: { label: 'Completed', progress: 100, color: 'bg-green-600' },
  FAILED: { label: 'Failed', progress: 0, color: 'bg-red-500' },
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'text-blue-400',
  linkedin: 'text-blue-700',
  instagram: 'text-pink-500',
  tiktok: 'text-black',
  facebook: 'text-blue-600',
  youtube: 'text-red-600',
  threads: 'text-gray-800',
  reddit: 'text-orange-500',
}

interface WorkflowDetailsPageProps {
  params: { id: string }
}

export default function WorkflowDetailsPage() {
  const params = useParams()
  const workflowId = params.id as string
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchWorkflowDetails()
    const interval = setInterval(fetchWorkflowDetails, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [workflowId])

  const fetchWorkflowDetails = async () => {
    try {
      const response = await fetch(
        `/api/v1/marketing/workflows/${workflowId}/details`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch workflow details')
      }

      const data = await response.json()
      setWorkflow(data)
      setError(null)
    } catch (err) {
      setError('Failed to load workflow. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading workflow details...</p>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Workflow not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusConfig = WORKFLOW_STATUSES[workflow.status as keyof typeof WORKFLOW_STATUSES]

  // Mock performance data
  const performanceData = [
    { time: '00:00', impressions: 1200, clicks: 120, engagements: 45 },
    { time: '04:00', impressions: 1900, clicks: 240, engagements: 80 },
    { time: '08:00', impressions: 2500, clicks: 450, engagements: 150 },
    { time: '12:00', impressions: 3200, clicks: 680, engagements: 280 },
    { time: '16:00', impressions: 4100, clicks: 890, engagements: 420 },
    { time: '20:00', impressions: 4800, clicks: 1200, engagements: 580 },
  ]

  const platformPerformance = [
    { name: 'Twitter', value: 1500, engagement: 4.5 },
    { name: 'LinkedIn', value: 1200, engagement: 3.2 },
    { name: 'Instagram', value: 2100, engagement: 6.7 },
    { name: 'TikTok', value: 3200, engagement: 8.9 },
  ]

  const totalReach = platformPerformance.reduce((sum, p) => sum + p.value, 0)
  const totalEngagements = totalReach * 0.058 // Average engagement rate
  const avgEngagementRate = (totalEngagements / totalReach * 100).toFixed(2)

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">{workflow.name}</h1>
          <p className="text-gray-600">
            Created {new Date(workflow.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true)
              fetchWorkflowDetails()
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline">Duplicate</Button>
        </div>
      </div>

      {/* Status and Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Workflow Status</CardTitle>
              <CardDescription>
                {statusConfig?.label || workflow.status}
              </CardDescription>
            </div>
            <Badge className={statusConfig?.color}>
              {statusConfig?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {statusConfig?.progress || 0}%
              </span>
            </div>
            <Progress
              value={statusConfig?.progress || 0}
              className="h-3"
            />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-5 gap-2 mt-6">
            {[
              { step: 'Configure', status: 'COMPLETED' },
              { step: 'Generate', status: 'COMPLETED' },
              { step: 'Review', status: workflow.status === 'REVIEW' ? 'ACTIVE' : 'PENDING' },
              { step: 'Publish', status: 'PENDING' },
              { step: 'Complete', status: 'PENDING' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className={`h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white ${
                    item.status === 'COMPLETED'
                      ? 'bg-green-600'
                      : item.status === 'ACTIVE'
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                  }`}
                >
                  {item.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <p className="text-xs font-medium">{item.step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Reach</p>
                <p className="text-2xl font-bold">{(totalReach / 1000).toFixed(1)}K</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Engagement Rate</p>
                <p className="text-2xl font-bold">{avgEngagementRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Engagements</p>
                <p className="text-2xl font-bold">
                  {Math.round(totalEngagements).toLocaleString()}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Platforms</p>
                <p className="text-2xl font-bold">
                  {workflow.platformConfig?.platforms?.length || 0}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="costs">Costs & ROI</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Real-time engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    stroke="#3b82f6"
                    name="Impressions"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#10b981"
                    name="Clicks"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagements"
                    stroke="#f59e0b"
                    name="Engagements"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Reach by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      fill="#3b82f6"
                      name="Reach"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="engagement"
                      fill="#f59e0b"
                      name="Engagement %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Platform Details */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Detailed Platform Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.platformConfig?.platforms?.map((platform: string) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${PLATFORM_COLORS[platform]}`}>
                        ●
                      </span>
                      <div>
                        <p className="font-semibold capitalize">{platform}</p>
                        <p className="text-sm text-gray-600">
                          1.2K impressions • 45 engagements
                        </p>
                      </div>
                    </div>
                    <Badge>5.2% engagement</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Status</CardTitle>
              <CardDescription>
                Generated content by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { platform: 'Twitter', status: 'Published', engagement: '4.5%' },
                  { platform: 'LinkedIn', status: 'Published', engagement: '3.2%' },
                  { platform: 'Instagram', status: 'Scheduled', engagement: '6.7%' },
                  { platform: 'TikTok', status: 'Pending Review', engagement: '8.9%' },
                ].map((item) => (
                  <div
                    key={item.platform}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.platform}</p>
                      <p className="text-sm text-gray-600">
                        {item.status}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {item.engagement} engagement
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-gray-600 text-sm mb-1">Total Cost</p>
                  <p className="text-3xl font-bold">$245.50</p>
                  <p className="text-xs text-gray-500 mt-2">
                    AI Generation + Publishing
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-gray-600 text-sm mb-1">Estimated ROI</p>
                  <p className="text-3xl font-bold text-green-600">325%</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Based on 2.3% conversion rate
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-600 text-sm mb-1">Cost Per 1K Reach</p>
                  <p className="text-3xl font-bold">$0.82</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Highly efficient
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <span>AI Content Generation (4 pieces)</span>
                  <span className="font-semibold">$12.40</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <span>Platform API Calls</span>
                  <span className="font-semibold">$8.50</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <span>Paid Promotion (TikTok)</span>
                  <span className="font-semibold">$224.60</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>$245.50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
