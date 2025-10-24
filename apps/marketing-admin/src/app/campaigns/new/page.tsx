'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WorkflowLauncher } from '@/components/campaigns/workflow-launcher'
import { ChevronLeft, Zap } from 'lucide-react'

export default function NewCampaignPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/campaigns">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                World Domination
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Launch your next campaign across all platforms with intelligent automation
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <WorkflowLauncher />
      </div>
    </div>
  )
}
