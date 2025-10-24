'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { Plus, RefreshCw, Zap, Rocket, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function CampaignsPage() {
  const { campaigns, loading, refetch } = useCampaigns()
  const [status, setStatus] = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section - World Domination Marketing Engine */}
      <div className="relative overflow-hidden rounded-lg border border-gradient-to-r from-blue-500 to-purple-500 bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="absolute top-0 right-0 -m-16 h-32 w-32 rounded-full bg-blue-300 opacity-10" />
        <div className="absolute bottom-0 left-0 -m-16 h-32 w-32 rounded-full bg-purple-300 opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              World Domination Marketing Engine
            </h2>
          </div>

          <p className="text-lg text-gray-700 mb-2 max-w-2xl">
            Launch multi-platform campaigns with AI-powered content generation, real-time analytics, and intelligent automation across 10+ social media platforms.
          </p>

          <div className="flex gap-4 mt-6">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/campaigns/new">
                <Rocket className="h-5 w-5 mr-2" />
                Launch Campaign Now
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Sparkles className="h-5 w-5 mr-2" />
              View Quick Presets
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">10+ Platforms</p>
              <p className="text-xs text-gray-600">Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube & more</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">AI Content Gen</p>
              <p className="text-xs text-gray-600">Claude-powered intelligent content creation</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">Real-time Analytics</p>
              <p className="text-xs text-gray-600">Live engagement tracking and ROI metrics</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-900">Auto-Scheduling</p>
              <p className="text-xs text-gray-600">Intelligent posting times per platform</p>
            </div>
          </div>
        </div>
      </div>

      <DashboardHeader
        title="All Campaigns"
        description="View and manage your campaigns"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-4">
        <Button
          variant={status === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus(undefined)}
        >
          All
        </Button>
        <Button
          variant={status === 'DRAFT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('DRAFT')}
        >
          Draft
        </Button>
        <Button
          variant={status === 'ACTIVE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('ACTIVE')}
        >
          Active
        </Button>
        <Button
          variant={status === 'PAUSED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('PAUSED')}
        >
          Paused
        </Button>
        <Button
          variant={status === 'COMPLETED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('COMPLETED')}
        >
          Completed
        </Button>
      </div>

      <CampaignList
        campaigns={campaigns}
        onRefresh={refetch}
        loading={loading}
      />
    </div>
  )
}
