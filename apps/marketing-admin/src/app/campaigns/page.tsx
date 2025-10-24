'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { Plus, RefreshCw } from 'lucide-react'

export default function CampaignsPage() {
  const { campaigns, loading, refetch } = useCampaigns()
  const [status, setStatus] = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Campaigns"
        description="Manage your multi-channel marketing campaigns"
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
