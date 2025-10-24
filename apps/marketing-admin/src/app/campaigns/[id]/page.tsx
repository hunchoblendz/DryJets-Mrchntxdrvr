'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampaignDetails } from '@/components/campaigns/campaign-details'
import { useCampaign } from '@/lib/hooks/use-campaigns'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default function CampaignPage({ params }: Props) {
  const { campaign, loading } = useCampaign(params.id)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
        {campaign && (
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.id}</p>
          </div>
        )}
      </div>

      <CampaignDetails campaign={campaign} loading={loading} />
    </div>
  )
}
