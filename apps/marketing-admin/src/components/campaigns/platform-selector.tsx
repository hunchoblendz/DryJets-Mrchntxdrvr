'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  Loader2,
  ChevronDown,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  Plus,
  Check,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Platform {
  id: string
  name: string
  slug: string
  type: 'social' | 'blog' | 'video' | 'community'
  description: string
  icon?: string
  metrics: {
    avgEngagement: number
    averageReach: number
    costPerThousandImpressions: number
    bestContentTypes: string[]
  }
  features: string[]
}

interface Preset {
  id: string
  name: string
  description: string
  icon?: string
  platforms: string[]
  bestFor: string
  estimatedReachPerMonth: number
}

interface PlatformSelectorProps {
  selectedPlatforms?: string[]
  onPlatformsChange?: (platforms: string[]) => void
  onPresetSelect?: (presetId: string) => void
  showMetrics?: boolean
}

const PRESETS: Preset[] = [
  {
    id: 'viral-reach',
    name: 'Viral Reach',
    description: 'Maximize engagement and reach',
    platforms: ['tiktok', 'instagram', 'youtube'],
    bestFor: 'Visual content and trends',
    estimatedReachPerMonth: 5000000,
  },
  {
    id: 'b2b-professional',
    name: 'B2B Professional',
    description: 'Reach business decision-makers',
    platforms: ['linkedin', 'twitter', 'threads'],
    bestFor: 'Business content and thought leadership',
    estimatedReachPerMonth: 1500000,
  },
  {
    id: 'community-driven',
    name: 'Community Driven',
    description: 'Build engaged communities',
    platforms: ['reddit', 'threads', 'discord'],
    bestFor: 'Community engagement and discussions',
    estimatedReachPerMonth: 2000000,
  },
  {
    id: 'all-in-one',
    name: 'All-In-One',
    description: 'Comprehensive multi-platform coverage',
    platforms: [
      'twitter',
      'linkedin',
      'instagram',
      'tiktok',
      'facebook',
      'youtube',
    ],
    bestFor: 'Broad audience targeting',
    estimatedReachPerMonth: 10000000,
  },
  {
    id: 'budget-friendly',
    name: 'Budget Friendly',
    description: 'Maximum reach with minimum spend',
    platforms: ['threads', 'reddit', 'bluesky'],
    bestFor: 'Cost-effective campaigns',
    estimatedReachPerMonth: 800000,
  },
]

const PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    slug: 'twitter',
    type: 'social',
    description: 'Real-time news, trends, and discussions',
    features: [
      'Trending topics',
      'Viral potential',
      'News-focused audience',
      'Thread support',
    ],
    metrics: {
      avgEngagement: 0.045,
      averageReach: 500000,
      costPerThousandImpressions: 5.0,
      bestContentTypes: ['threads', 'news', 'opinions'],
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    slug: 'linkedin',
    type: 'social',
    description: 'Professional network for B2B marketing',
    features: [
      'Professional audience',
      'Thought leadership',
      'Job market insights',
      'Article publishing',
    ],
    metrics: {
      avgEngagement: 0.032,
      averageReach: 300000,
      costPerThousandImpressions: 8.5,
      bestContentTypes: ['articles', 'insights', 'company news'],
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    slug: 'instagram',
    type: 'social',
    description: 'Visual storytelling and lifestyle content',
    features: [
      'Instagram Stories',
      'Reels (short video)',
      'Shopping integration',
      'Direct messaging',
    ],
    metrics: {
      avgEngagement: 0.067,
      averageReach: 1000000,
      costPerThousandImpressions: 7.0,
      bestContentTypes: ['images', 'reels', 'stories'],
    },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    slug: 'tiktok',
    type: 'social',
    description: 'Short-form video with viral potential',
    features: [
      'Algorithm-driven discovery',
      'Duets and stitches',
      'Trend integration',
      'Creator fund',
    ],
    metrics: {
      avgEngagement: 0.089,
      averageReach: 2000000,
      costPerThousandImpressions: 9.0,
      bestContentTypes: ['videos', 'trends', 'challenges'],
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    slug: 'facebook',
    type: 'social',
    description: 'Broad audience reach and community building',
    features: [
      'Community groups',
      'Event promotion',
      'Detailed targeting',
      'Video hosting',
    ],
    metrics: {
      avgEngagement: 0.028,
      averageReach: 800000,
      costPerThousandImpressions: 6.0,
      bestContentTypes: ['images', 'video', 'community posts'],
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    slug: 'youtube',
    type: 'video',
    description: 'Long-form and short-form video platform',
    features: [
      'Long-form videos',
      'YouTube Shorts',
      'Comments section',
      'Monetization options',
    ],
    metrics: {
      avgEngagement: 0.042,
      averageReach: 1500000,
      costPerThousandImpressions: 6.5,
      bestContentTypes: ['video', 'tutorials', 'shorts'],
    },
  },
  {
    id: 'reddit',
    name: 'Reddit',
    slug: 'reddit',
    type: 'community',
    description: 'Community-driven discussions and content',
    features: [
      'Subreddit communities',
      'Discussion threads',
      'AMA (Ask Me Anything)',
      'Voting system',
    ],
    metrics: {
      avgEngagement: 0.051,
      averageReach: 400000,
      costPerThousandImpressions: 4.5,
      bestContentTypes: ['discussions', 'AMAs', 'communities'],
    },
  },
  {
    id: 'threads',
    name: 'Threads',
    slug: 'threads',
    type: 'social',
    description: 'Instagram alternative for text-based content',
    features: [
      'Thread format',
      'Quick updates',
      'Link sharing',
      'Federated protocol',
    ],
    metrics: {
      avgEngagement: 0.053,
      averageReach: 300000,
      costPerThousandImpressions: 5.5,
      bestContentTypes: ['threads', 'updates', 'discussions'],
    },
  },
  {
    id: 'bluesky',
    name: 'BlueSky',
    slug: 'bluesky',
    type: 'social',
    description: 'Open social protocol alternative to Twitter',
    features: [
      'Decentralized',
      'Custom algorithms',
      'Feed customization',
      'Moderation tools',
    ],
    metrics: {
      avgEngagement: 0.038,
      averageReach: 200000,
      costPerThousandImpressions: 4.0,
      bestContentTypes: ['posts', 'updates', 'discussions'],
    },
  },
]

export function PlatformSelector({
  selectedPlatforms = ['twitter', 'linkedin', 'instagram'],
  onPlatformsChange,
  onPresetSelect,
  showMetrics = true,
}: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<string[]>(selectedPlatforms)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handlePlatformToggle = (platformSlug: string) => {
    const updated = platforms.includes(platformSlug)
      ? platforms.filter((p) => p !== platformSlug)
      : [...platforms, platformSlug]
    setPlatforms(updated)
    onPlatformsChange?.(updated)
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setPlatforms(preset.platforms)
      setSelectedPreset(presetId)
      onPlatformsChange?.(preset.platforms)
      onPresetSelect?.(presetId)
    }
  }

  const filteredPlatforms = PLATFORMS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedPlatformDetails = PLATFORMS.filter((p) =>
    platforms.includes(p.slug)
  )

  const calculateTotalReach = () => {
    return selectedPlatformDetails.reduce((sum, p) => sum + p.metrics.averageReach, 0)
  }

  const calculateAverageEngagement = () => {
    if (selectedPlatformDetails.length === 0) return 0
    const total = selectedPlatformDetails.reduce((sum, p) => sum + p.metrics.avgEngagement, 0)
    return (total / selectedPlatformDetails.length * 100).toFixed(1)
  }

  const calculateAverageCost = () => {
    if (selectedPlatformDetails.length === 0) return 0
    const total = selectedPlatformDetails.reduce((sum, p) => sum + p.metrics.costPerThousandImpressions, 0)
    return (total / selectedPlatformDetails.length).toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Presets Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESETS.map((preset) => (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all ${
                selectedPreset === preset.id
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => handlePresetSelect(preset.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{preset.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {preset.description}
                    </CardDescription>
                  </div>
                  {selectedPreset === preset.id && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Best for</p>
                  <p className="text-sm font-medium">{preset.bestFor}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {preset.platforms.map((slug) => {
                    const platform = PLATFORMS.find((p) => p.slug === slug)
                    return (
                      <Badge key={slug} variant="secondary" className="text-xs">
                        {platform?.name}
                      </Badge>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>
                    {(preset.estimatedReachPerMonth / 1000000).toFixed(1)}M
                    monthly reach
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Metrics */}
      {showMetrics && platforms.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selected Platforms</p>
                <p className="text-2xl font-bold">{platforms.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Avg. Engagement
                </div>
                <p className="text-2xl font-bold">{calculateAverageEngagement()}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Target className="h-4 w-4" />
                  Total Reach
                </div>
                <p className="text-2xl font-bold">
                  {(calculateTotalReach() / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <DollarSign className="h-4 w-4" />
                  Avg. CPM
                </div>
                <p className="text-2xl font-bold">${calculateAverageCost()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Platform Selection</h3>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Tabs for Organization */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredPlatforms.length})
            </TabsTrigger>
            <TabsTrigger value="social">
              Social ({filteredPlatforms.filter((p) => p.type === 'social').length})
            </TabsTrigger>
            <TabsTrigger value="video">
              Video ({filteredPlatforms.filter((p) => p.type === 'video').length})
            </TabsTrigger>
            <TabsTrigger value="community">
              Community ({filteredPlatforms.filter((p) => p.type === 'community').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredPlatforms.map((platform) => (
              <PlatformCard
                key={platform.slug}
                platform={platform}
                isSelected={platforms.includes(platform.slug)}
                isExpanded={expandedPlatform === platform.slug}
                onToggle={() => handlePlatformToggle(platform.slug)}
                onExpandChange={(expanded) =>
                  setExpandedPlatform(expanded ? platform.slug : null)
                }
              />
            ))}
          </TabsContent>

          <TabsContent value="social" className="space-y-3 mt-4">
            {filteredPlatforms
              .filter((p) => p.type === 'social')
              .map((platform) => (
                <PlatformCard
                  key={platform.slug}
                  platform={platform}
                  isSelected={platforms.includes(platform.slug)}
                  isExpanded={expandedPlatform === platform.slug}
                  onToggle={() => handlePlatformToggle(platform.slug)}
                  onExpandChange={(expanded) =>
                    setExpandedPlatform(expanded ? platform.slug : null)
                  }
                />
              ))}
          </TabsContent>

          <TabsContent value="video" className="space-y-3 mt-4">
            {filteredPlatforms
              .filter((p) => p.type === 'video')
              .map((platform) => (
                <PlatformCard
                  key={platform.slug}
                  platform={platform}
                  isSelected={platforms.includes(platform.slug)}
                  isExpanded={expandedPlatform === platform.slug}
                  onToggle={() => handlePlatformToggle(platform.slug)}
                  onExpandChange={(expanded) =>
                    setExpandedPlatform(expanded ? platform.slug : null)
                  }
                />
              ))}
          </TabsContent>

          <TabsContent value="community" className="space-y-3 mt-4">
            {filteredPlatforms
              .filter((p) => p.type === 'community')
              .map((platform) => (
                <PlatformCard
                  key={platform.slug}
                  platform={platform}
                  isSelected={platforms.includes(platform.slug)}
                  isExpanded={expandedPlatform === platform.slug}
                  onToggle={() => handlePlatformToggle(platform.slug)}
                  onExpandChange={(expanded) =>
                    setExpandedPlatform(expanded ? platform.slug : null)
                  }
                />
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Selected Platforms Summary */}
      {platforms.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base">Selected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPlatformDetails.map((platform) => (
                <Badge
                  key={platform.slug}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handlePlatformToggle(platform.slug)}
                >
                  {platform.name}
                  <span className="ml-2 opacity-70">×</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Platform Card Component
function PlatformCard({
  platform,
  isSelected,
  isExpanded,
  onToggle,
  onExpandChange,
}: {
  platform: Platform
  isSelected: boolean
  isExpanded: boolean
  onToggle: () => void
  onExpandChange: (expanded: boolean) => void
}) {
  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Checkbox checked={isSelected} onChange={onToggle} />
            <div>
              <h4 className="font-semibold">{platform.name}</h4>
              <p className="text-sm text-gray-600">{platform.description}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-3 mt-3 ml-9">
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>{(platform.metrics.avgEngagement * 100).toFixed(1)}% engagement</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span>{(platform.metrics.averageReach / 1000000).toFixed(1)}M reach</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span>${platform.metrics.costPerThousandImpressions.toFixed(1)} CPM</span>
            </div>
          </div>
        </div>

        <Collapsible
          open={isExpanded}
          onOpenChange={onExpandChange}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4 w-full">
            <div>
              <h5 className="font-semibold text-sm mb-2">Best Content Types</h5>
              <div className="flex flex-wrap gap-1">
                {platform.metrics.bestContentTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-sm mb-2">Key Features</h5>
              <ul className="space-y-1">
                {platform.features.map((feature) => (
                  <li key={feature} className="text-sm flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
