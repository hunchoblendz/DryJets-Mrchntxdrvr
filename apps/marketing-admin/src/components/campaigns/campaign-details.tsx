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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Zap,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { Campaign } from '@/lib/hooks/use-campaigns'
import { campaignAPI } from '@/lib/api'

interface CampaignDetailsProps {
  campaign: Campaign | null
  loading?: boolean
}

interface MetricsData {
  aggregates: {
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalSpend: number
    totalRevenue: number
    roi: number
    ctr: number
    conversionRate: number
  }
}

interface WorkflowData {
  progress: {
    completed: number
    running: number
    pending: number
    failed: number
  }
  progressPercentage: number
}

interface BudgetData {
  budgetSummary: {
    totalAllocated: number
    totalSpent: number
    totalRemaining: number
    percentUsed: number
  }
}

export function CampaignDetails({ campaign, loading }: CampaignDetailsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const [budget, setBudget] = useState<BudgetData | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchMetrics = async () => {
    if (!campaign) return
    try {
      setLoadingMetrics(true)
      const data = await campaignAPI.getCampaignMetrics(campaign.id)
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const fetchWorkflow = async () => {
    if (!campaign) return
    try {
      const data = await campaignAPI.getWorkflowStatus(campaign.id)
      setWorkflow(data)
    } catch (error) {
      console.error('Failed to fetch workflow:', error)
    }
  }

  const fetchBudget = async () => {
    if (!campaign) return
    try {
      const data = await campaignAPI.getBudgetStatus(campaign.id)
      setBudget(data)
    } catch (error) {
      console.error('Failed to fetch budget:', error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'metrics' && !metrics) fetchMetrics()
    if (value === 'workflow' && !workflow) fetchWorkflow()
    if (value === 'budget' && !budget) fetchBudget()
  }

  if (loading || !campaign) {
    return <div className="text-center py-8">Loading campaign details...</div>
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription>Campaign ID: {campaign.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge className="mt-1 bg-blue-100 text-blue-800">
                  {campaign.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="mt-1" variant="default">
                  {campaign.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {campaign.platforms.map((platform) => (
                  <Badge key={platform} variant="outline">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Budget</p>
              <div className="text-2xl font-bold">
                ${campaign.budgetTotal?.toFixed(2) || '0.00'}
              </div>
            </div>

            {campaign.targetAudience && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Target Audience
                </p>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(campaign.targetAudience, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Type</p>
              </div>
              <p className="text-lg font-bold mt-1">{campaign.type}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
              </div>
              <p className="text-lg font-bold mt-1">
                ${campaign.budgetTotal?.toFixed(0) || '0'}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metrics" className="space-y-6">
        {metrics ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.aggregates.totalImpressions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.aggregates.totalClicks.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.aggregates.totalConversions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${metrics.aggregates.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.aggregates.roi.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Click Through Rate (CTR)</span>
                    <span className="text-sm font-bold">
                      {metrics.aggregates.ctr.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={Math.min(metrics.aggregates.ctr * 10, 100)} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm font-bold">
                      {metrics.aggregates.conversionRate.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={Math.min(metrics.aggregates.conversionRate * 10, 100)} />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Button onClick={fetchMetrics} loading={loadingMetrics}>
                Load Metrics
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="workflow" className="space-y-6">
        {workflow ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold">
                      {workflow.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={workflow.progressPercentage} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {workflow.progress.completed}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {workflow.progress.pending}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {workflow.progress.running}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {workflow.progress.failed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Button onClick={fetchWorkflow}>Load Workflow Status</Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="budget" className="space-y-6">
        {budget ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Budget Used</span>
                    <span className="text-sm font-bold">
                      {budget.budgetSummary.percentUsed.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={budget.budgetSummary.percentUsed} />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Allocated</p>
                    <p className="text-lg font-bold">
                      ${budget.budgetSummary.totalAllocated.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-lg font-bold text-orange-600">
                      ${budget.budgetSummary.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-lg font-bold text-green-600">
                      ${budget.budgetSummary.totalRemaining.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Button onClick={fetchBudget}>Load Budget Status</Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
