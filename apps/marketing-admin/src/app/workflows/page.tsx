'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Zap,
  Eye,
  Copy,
  Trash2,
  Archive,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Workflow {
  id: string
  name: string
  type: 'AUTONOMOUS' | 'CUSTOM_CAMPAIGN'
  status:
    | 'CONFIGURING'
    | 'GENERATING'
    | 'REVIEW'
    | 'PUBLISHING'
    | 'COMPLETED'
    | 'FAILED'
  platformConfig: {
    platforms: string[]
    presetUsed?: string
  }
  createdAt: string
  updatedAt: string
  stats?: {
    totalReach: number
    engagements: number
    roi: number
  }
}

const STATUS_STYLES = {
  CONFIGURING: 'bg-blue-100 text-blue-800',
  GENERATING: 'bg-purple-100 text-purple-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  PUBLISHING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchWorkflows()
  }, [statusFilter])

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      // Mock workflows data
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'Q4 Product Launch',
          type: 'AUTONOMOUS',
          status: 'COMPLETED',
          platformConfig: {
            platforms: ['twitter', 'linkedin', 'instagram', 'tiktok'],
          },
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          stats: { totalReach: 45000, engagements: 2250, roi: 284 },
        },
        {
          id: '2',
          name: 'Black Friday Campaign',
          type: 'AUTONOMOUS',
          status: 'PUBLISHING',
          platformConfig: {
            platforms: ['twitter', 'instagram', 'facebook'],
          },
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          stats: { totalReach: 78000, engagements: 4890, roi: 324 },
        },
        {
          id: '3',
          name: 'Summer Collection Teaser',
          type: 'CUSTOM_CAMPAIGN',
          status: 'REVIEW',
          platformConfig: {
            platforms: ['instagram', 'tiktok', 'youtube'],
          },
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          stats: { totalReach: 32000, engagements: 1280, roi: 188 },
        },
        {
          id: '4',
          name: 'Industry Insights Series',
          type: 'AUTONOMOUS',
          status: 'GENERATING',
          platformConfig: {
            platforms: ['linkedin', 'twitter', 'threads'],
          },
          createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Customer Success Stories',
          type: 'CUSTOM_CAMPAIGN',
          status: 'CONFIGURING',
          platformConfig: {
            platforms: ['youtube', 'linkedin'],
          },
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      setWorkflows(mockWorkflows)
    } catch (error) {
      console.error('Failed to fetch workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkflows = workflows
    .filter(
      (w) =>
        (statusFilter === 'all' || w.status === statusFilter) &&
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'updated':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workflows</h1>
          <p className="text-gray-600">
            Manage and monitor all your marketing workflows
          </p>
        </div>
        <Link href="/workflows/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="CONFIGURING">Configuring</SelectItem>
                <SelectItem value="GENERATING">Generating</SelectItem>
                <SelectItem value="REVIEW">In Review</SelectItem>
                <SelectItem value="PUBLISHING">Publishing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Loading workflows...</p>
          </div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workflows found. Create a new workflow to get started!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Main Info */}
                  <div className="md:col-span-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      >
                        {workflow.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created{' '}
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Type */}
                  <div className="md:col-span-2">
                    <Badge
                      className={`${STATUS_STYLES[workflow.status]}`}
                    >
                      {workflow.status}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">
                      Type: {workflow.type === 'AUTONOMOUS' ? 'Autonomous' : 'Custom'}
                    </p>
                  </div>

                  {/* Platforms */}
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Platforms</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.platformConfig.platforms.slice(0, 3).map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                      {workflow.platformConfig.platforms.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{workflow.platformConfig.platforms.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {workflow.stats && (
                    <div className="md:col-span-2 text-right">
                      <div className="text-sm">
                        <p className="text-gray-600">Reach</p>
                        <p className="font-semibold">
                          {(workflow.stats.totalReach / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="text-sm mt-2">
                        <p className="text-gray-600">ROI</p>
                        <p className="font-semibold text-green-600">
                          {workflow.stats.roi}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="md:col-span-1 flex gap-2">
                    <Link href={`/workflows/${workflow.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Workflows</p>
                <p className="text-3xl font-bold">{workflows.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-blue-600">
                  {workflows.filter((w) => w.status !== 'COMPLETED' && w.status !== 'FAILED').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {workflows.filter((w) => w.status === 'COMPLETED').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Reach</p>
                <p className="text-3xl font-bold">
                  {(
                    workflows.reduce((sum, w) => sum + (w.stats?.totalReach || 0), 0) /
                    1000
                  ).toFixed(0)}
                  K
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
