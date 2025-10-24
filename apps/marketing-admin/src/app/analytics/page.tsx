'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAllCampaignsAnalytics } from '@/lib/hooks/use-analytics'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { analytics, loading } = useAllCampaignsAnalytics()
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor campaign performance across all channels
        </p>
      </div>

      {/* Overall Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.activeCampaigns} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.completedCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finished campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns ROI Chart */}
      {analytics?.campaigns && analytics.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns ROI Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.campaigns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="roi" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Campaign Selection */}
      {analytics?.campaigns && analytics.campaigns.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Campaign Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {analytics.campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.campaignId} value={campaign.campaignId}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedCampaignId && (
            <AnalyticsDashboard campaignId={selectedCampaignId} />
          )}
        </div>
      )}

      {/* Empty State */}
      {(!analytics?.campaigns || analytics.campaigns.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No campaigns found. Create a campaign to see analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
