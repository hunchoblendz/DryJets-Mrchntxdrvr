'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertCircle,
  Loader2,
  Zap,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  Target,
  Lightbulb,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AutonomousCampaignData {
  campaignName: string
  topic: string
  description: string
  industry: string
  tone: string
  contentStrategy: string
  selectedPlatforms: string[]
  contentPiecesPerDay: number
  campaignDuration: number
  goals: string[]
  budget: number
  autoOptimize: boolean
  autoRepost: boolean
}

interface TrendAnalysis {
  topTrends: string[]
  recommendedStrategy: string
  contentOpportunities: string[]
  competitorInsights: string
  seasonalFactors: string
}

interface GeneratedContent {
  id: string
  platform: string
  content: string
  format: string
  estimatedReach: number
  estimatedEngagement: number
  scheduledTime: string
  approved: boolean
}

const PLATFORMS_WITH_DETAILS = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    maxLength: 280,
    formats: ['Text', 'Text + Media'],
    topicFit: 0.9,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    maxLength: 3000,
    formats: ['Text', 'Text + Media', 'Article'],
    topicFit: 0.85,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    maxLength: 2200,
    formats: ['Caption', 'Carousel', 'Reel'],
    topicFit: 0.8,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '♪',
    maxLength: 2200,
    formats: ['Video Hook', 'Trending Format', 'Educational'],
    topicFit: 0.75,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    maxLength: 63206,
    formats: ['Text', 'Link Post', 'Video'],
    topicFit: 0.7,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶',
    maxLength: 5000,
    formats: ['Community Post', 'Shorts Script'],
    topicFit: 0.75,
  },
]

const INDUSTRIES = [
  'Technology',
  'E-commerce',
  'SaaS',
  'Finance',
  'Healthcare',
  'Education',
  'Entertainment',
  'News & Media',
  'Non-profit',
  'Other',
]

const TONES = [
  'Professional',
  'Casual & Friendly',
  'Humorous',
  'Inspiring & Motivational',
  'Educational',
  'Promotional',
  'Thought Leadership',
]

const CONTENT_STRATEGIES = [
  'Educational Content',
  'Engagement Focused',
  'Sales & Conversion',
  'Brand Awareness',
  'Community Building',
  'Product Updates',
]

const CAMPAIGN_GOALS = [
  'Increase Reach',
  'Boost Engagement',
  'Drive Traffic',
  'Generate Leads',
  'Build Community',
  'Establish Authority',
  'Launch Product',
  'Brand Awareness',
]

export function AutonomousCampaignFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<AutonomousCampaignData>({
    campaignName: '',
    topic: '',
    description: '',
    industry: 'Technology',
    tone: 'Professional',
    contentStrategy: 'Engagement Focused',
    selectedPlatforms: ['twitter', 'linkedin'],
    contentPiecesPerDay: 3,
    campaignDuration: 7,
    goals: ['Increase Reach', 'Boost Engagement'],
    budget: 1000,
    autoOptimize: true,
    autoRepost: true,
  })

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))
  }

  const analyzeTrends = async () => {
    if (!formData.topic) {
      setError('Please enter a topic or theme')
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/marketing/workflows/autonomous/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          industry: formData.industry,
          description: formData.description,
        }),
      })

      if (!response.ok) throw new Error('Failed to analyze trends')
      const analysis = await response.json()

      setTrendAnalysis(analysis)
      // Auto-update content strategy based on trends
      setFormData((prev) => ({
        ...prev,
        contentStrategy: analysis.recommendedStrategy,
      }))

      setStep(2)
    } catch (err) {
      setError('Failed to analyze trends. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter((id) => id !== platformId)
        : [...prev.selectedPlatforms, platformId],
    }))
  }

  const generateContent = async () => {
    if (!formData.campaignName || !formData.topic) {
      setError('Please fill in campaign name and topic')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(
        '/api/v1/marketing/workflows/autonomous/generate-content',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: formData.topic,
            description: formData.description,
            industry: formData.industry,
            tone: formData.tone,
            contentStrategy: formData.contentStrategy,
            platforms: formData.selectedPlatforms,
            contentPiecesPerDay: formData.contentPiecesPerDay,
            campaignDuration: formData.campaignDuration,
            goals: formData.goals,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to generate content')
      const content = await response.json()
      setGeneratedContent(content)
      setStep(3)
    } catch (err) {
      setError('Failed to generate content. Please try again.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const submitForReview = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/marketing/workflows/autonomous/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          type: 'AUTONOMOUS',
          customInput: {
            topic: formData.topic,
            description: formData.description,
            industry: formData.industry,
            tone: formData.tone,
            contentStrategy: formData.contentStrategy,
            goals: formData.goals,
            contentPiecesPerDay: formData.contentPiecesPerDay,
            campaignDuration: formData.campaignDuration,
            autoOptimize: formData.autoOptimize,
            autoRepost: formData.autoRepost,
            trendAnalysis: trendAnalysis,
          },
          selectedPlatforms: formData.selectedPlatforms,
          generatedContent: generatedContent.filter((c) => c.approved),
          budget: formData.budget,
          createdBy: 'current-user-id',
        }),
      })

      if (!response.ok) throw new Error('Failed to submit for review')
      const workflow = await response.json()

      setSuccessMessage(`Campaign "${formData.campaignName}" submitted for admin review! ✅`)

      setTimeout(() => {
        router.push(`/admin/approvals/${workflow.id}`)
      }, 2500)
    } catch (err) {
      setError('Failed to submit campaign. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const platformDetails = PLATFORMS_WITH_DETAILS.filter((p) =>
    formData.selectedPlatforms.includes(p.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Autonomous Campaign
            </h2>
            <p className="text-gray-600 mt-1">
              Let AI handle content creation across all platforms
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              s <= step
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Campaign Basics & Trend Analysis */}
          {step === 1 && !trendAnalysis && (
            <Card className="border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  Campaign Basics
                </CardTitle>
                <CardDescription>Tell us about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Q4 Product Domination"
                    value={formData.campaignName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        campaignName: e.target.value,
                      }))
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Topic/Theme *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., AI-powered marketing automation"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        topic: e.target.value,
                      }))
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about what you want to achieve..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          industry: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          tone: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 1B: Trend Analysis Results */}
          {step === 1 && trendAnalysis && (
            <Card className="border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Trend Analysis Results
                </CardTitle>
                <CardDescription>
                  AI analyzed current trends to determine your optimal strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">🔥 Top Trends</p>
                  <ul className="space-y-2">
                    {trendAnalysis.topTrends.map((trend, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-600">→</span>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">📊 Recommended Strategy</p>
                  <p className="font-semibold text-gray-900">{trendAnalysis.recommendedStrategy}</p>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">💡 Content Opportunities</p>
                  <ul className="space-y-2">
                    {trendAnalysis.contentOpportunities.map((opp, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Competitor Insights</p>
                    <p className="text-sm text-purple-900 line-clamp-2">
                      {trendAnalysis.competitorInsights}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-600 mb-1">Seasonal Factors</p>
                    <p className="text-sm text-orange-900 line-clamp-2">
                      {trendAnalysis.seasonalFactors}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  size="lg"
                >
                  Continue to Strategy Configuration
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Campaign Strategy */}
          {step === 2 && (
            <>
              <Card className="border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Campaign Strategy
                  </CardTitle>
                  <CardDescription>
                    Define your content and distribution strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="strategy">Content Strategy</Label>
                    <Select
                      value={formData.contentStrategy}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          contentStrategy: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_STRATEGIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Campaign Goals</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {CAMPAIGN_GOALS.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={formData.goals.includes(goal)}
                            onCheckedChange={() => handleGoalToggle(goal)}
                          />
                          <Label htmlFor={goal} className="font-normal cursor-pointer">
                            {goal}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contentPieces">Content Pieces/Day</Label>
                      <Input
                        id="contentPieces"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.contentPiecesPerDay}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contentPiecesPerDay: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Campaign Duration (Days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="90"
                        value={formData.campaignDuration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            campaignDuration: parseInt(e.target.value) || 7,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    Platform Selection
                  </CardTitle>
                  <CardDescription>
                    Choose platforms for your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS_WITH_DETAILS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformToggle(platform.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.selectedPlatforms.includes(platform.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold">{platform.name}</span>
                          <span className="text-lg">{platform.icon}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Max {platform.maxLength} chars
                        </p>
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {platform.formats.slice(0, 2).map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-600" />
                    Auto-Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="autoOptimize"
                      checked={formData.autoOptimize}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoOptimize: checked === true,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="autoOptimize" className="font-semibold cursor-pointer">
                        Auto-Optimize Content
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        AI adjusts content based on real-time engagement data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id="autoRepost"
                      checked={formData.autoRepost}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoRepost: checked === true,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="autoRepost" className="font-semibold cursor-pointer">
                        Auto-Repost Best Performers
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatically repost your top-performing content at optimal times
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* STEP 3: Content Review */}
          {step === 3 && (
            <Card className="border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Review Generated Content
                </CardTitle>
                <CardDescription>
                  {generatedContent.length} pieces of content generated for {formData.selectedPlatforms.length} platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 max-h-96 overflow-y-auto">
                {generatedContent.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className="mb-2">
                          {PLATFORMS_WITH_DETAILS.find((p) => p.id === item.platform)?.name}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {item.format}
                        </Badge>
                      </div>
                      <Checkbox
                        checked={item.approved}
                        onCheckedChange={(checked) => {
                          setGeneratedContent((prev) =>
                            prev.map((c) =>
                              c.id === item.id
                                ? { ...c, approved: checked === true }
                                : c
                            )
                          )
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{item.content}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>📈 Reach: {item.estimatedReach.toLocaleString()}</span>
                      <span>💬 Engagement: {(item.estimatedEngagement * 100).toFixed(1)}%</span>
                      <span>🕐 {new Date(item.scheduledTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Confirmation & Admin Submission */}
          {step === 4 && (
            <Card className="border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  Campaign Summary
                </CardTitle>
                <CardDescription>Review and submit your campaign for admin approval</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Campaign Name</p>
                    <p className="font-semibold">{formData.campaignName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-semibold">{formData.campaignDuration} days</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Platforms</p>
                    <p className="font-semibold">{formData.selectedPlatforms.length}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Content Pieces</p>
                    <p className="font-semibold">
                      {formData.contentPiecesPerDay * formData.campaignDuration}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-2">📋 Campaign Status:</p>
                  <p className="text-sm text-blue-800">
                    ✨ Your campaign is ready for admin review. Once approved by an administrator,
                    it will automatically post across all platforms on an optimal schedule,
                    continuously optimize based on engagement, and repost your best content.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    ⏳ An admin will review your campaign content and approve for publication within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Budget & Timeline Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Budget</Label>
                <div className="flex mt-2 gap-2">
                  <span className="pt-2 text-gray-500">$</span>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Content/day:{' '}
                    <span className="font-semibold">{formData.contentPiecesPerDay}</span>
                  </p>
                  <p>
                    Duration:{' '}
                    <span className="font-semibold">{formData.campaignDuration} days</span>
                  </p>
                  <p className="pt-2 border-t">
                    Total content:{' '}
                    <span className="font-semibold text-lg">
                      {formData.contentPiecesPerDay * formData.campaignDuration}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (step === 1 && !trendAnalysis) {
                    analyzeTrends()
                  } else if (step === 2) {
                    generateContent()
                  } else if (step === 3) {
                    setStep(4)
                  } else {
                    submitForReview()
                  }
                }}
                disabled={loading || generating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {step === 1 && !trendAnalysis &&
                  (analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Trends...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Trends
                    </>
                  ))}
                {step === 1 && trendAnalysis && 'Continue to Strategy'}
                {step === 2 &&
                  (generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  ))}
                {step === 3 && 'Review & Continue'}
                {step === 4 &&
                  (loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Submit for Admin Review
                    </>
                  ))}
              </Button>

              {step > 1 && (
                <Button
                  onClick={() => {
                    if (step === 2) {
                      setTrendAnalysis(null)
                      setStep(1)
                    } else {
                      setStep(step - 1)
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Why Autonomous?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Brain className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>AI generates platform-optimized content</span>
              </div>
              <div className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Real-time engagement-based optimization</span>
              </div>
              <div className="flex gap-2">
                <Flame className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>Auto-repost top performers</span>
              </div>
              <div className="flex gap-2">
                <Clock className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Smart scheduling for max reach</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
