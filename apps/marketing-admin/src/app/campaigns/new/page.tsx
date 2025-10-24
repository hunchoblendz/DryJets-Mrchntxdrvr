'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { ChevronLeft } from 'lucide-react'

export default function NewCampaignPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Build a new multi-channel marketing campaign
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CampaignForm />
      </div>
    </div>
  )
}
