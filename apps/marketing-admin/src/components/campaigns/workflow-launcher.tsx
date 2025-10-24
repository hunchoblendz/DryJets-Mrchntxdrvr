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
import {
  Zap,
  Brain,
  Edit,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'
import { AutonomousCampaignFlow } from './autonomous-campaign-flow'
import { CustomCampaignFlow } from './custom-campaign-flow'

export function WorkflowLauncher() {
  const [campaignType, setCampaignType] = useState<'AUTONOMOUS' | 'CUSTOM_CAMPAIGN' | null>(
    null
  )

  // Show the type selection screen
  if (!campaignType) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold">World Domination Campaigns</h2>
          </div>
          <p className="text-gray-600">
            Choose your approach to launch the perfect multi-platform campaign
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Autonomous Campaign Card */}
          <button
            onClick={() => setCampaignType('AUTONOMOUS')}
            className="group"
          >
            <Card className="h-full border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">RECOMMENDED</Badge>
                </div>
                <CardTitle className="text-2xl">Autonomous Campaign</CardTitle>
                <CardDescription>
                  Let AI handle everything
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Our AI generates platform-optimized content, manages publishing schedules,
                  and continuously optimizes performance based on real-time engagement data.
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">AI generates content for all platforms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Automatic performance optimization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Smart scheduling for maximum reach</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Auto-reposts top-performing content</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Real-time analytics & adjustments</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group-hover:shadow-lg">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </button>

          {/* Custom Campaign Card */}
          <button
            onClick={() => setCampaignType('CUSTOM_CAMPAIGN')}
            className="group"
          >
            <Card className="h-full border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline">FOR CREATORS</Badge>
                </div>
                <CardTitle className="text-2xl">Custom Campaign</CardTitle>
                <CardDescription>
                  You're in full control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Write custom content for each platform with platform-specific guidance,
                  preview your content, and schedule exactly when you want to publish.
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Write custom content for each platform</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Platform-specific writing guidelines</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Content length validation & tips</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Flexible scheduling per platform</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm">Full content preview before publishing</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 group-hover:shadow-lg">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </button>
        </div>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Why Use the World Domination Engine?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <p className="font-semibold text-purple-900">10+ Platforms</p>
                <p className="text-sm text-purple-700 mt-2">
                  Reach your audience across Twitter, LinkedIn, Instagram, TikTok, Facebook,
                  YouTube, and more
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-semibold text-blue-900">AI-Optimized</p>
                <p className="text-sm text-blue-700 mt-2">
                  Content automatically adapted for each platform's best practices and audience
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="font-semibold text-green-900">Real-time Analytics</p>
                <p className="text-sm text-green-700 mt-2">
                  Track performance, engagement, and ROI across all platforms in real-time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show the selected flow
  if (campaignType === 'AUTONOMOUS') {
    return <AutonomousCampaignFlow />
  }

  return <CustomCampaignFlow />
}
