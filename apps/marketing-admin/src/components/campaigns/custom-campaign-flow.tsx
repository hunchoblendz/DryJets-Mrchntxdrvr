'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertCircle,
  Loader2,
  Zap,
  Edit,
  Copy,
  Calendar,
  CheckCircle2,
  Eye,
  Clock,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CustomContent {
  platform: string
  content: string
  mediaUrls?: string[]
  scheduledTime: string
  timezone: string
}

interface StrategyPlan {
  title: string
  description: string
  targetAudience: string
  keyMessages: string[]
  contentThemes: string[]
  postingSchedule: string
  successMetrics: string[]
  estimatedReach: number
  estimatedEngagement: number
}

interface CustomCampaignData {
  campaignName: string
  customStrategy: string
  strategyPlan?: StrategyPlan
  contents: CustomContent[]
  selectedPlatforms: string[]
  budget: number
}

const PLATFORM_CONFIG = {
  twitter: {
    name: 'Twitter',
    maxLength: 280,
    guidance: 'Keep it concise. Use hashtags and mentions strategically.',
    examples: [
      'Check out our latest feature!',
      'Here\'s what\'s new today 🚀',
      'Join us for an exciting announcement',
    ],
    placeholder: 'What\'s happening?!',
  },
  linkedin: {
    name: 'LinkedIn',
    maxLength: 3000,
    guidance: 'Professional tone. Share insights and thought leadership.',
    examples: [
      'Excited to announce our latest update...',
      'Here\'s what we learned this quarter...',
      'Best practices for maximizing ROI...',
    ],
    placeholder: 'Start a post...',
  },
  instagram: {
    name: 'Instagram',
    maxLength: 2200,
    guidance: 'Visual-first. Use emojis and call-to-actions.',
    examples: [
      'Loving this moment 📸✨',
      'Swipe to see more →',
      'Save this for later 💫',
    ],
    placeholder: 'Write a caption...',
  },
  tiktok: {
    name: 'TikTok',
    maxLength: 2200,
    guidance: 'Trendy and engaging. Hook viewers in the first 3 seconds.',
    examples: [
      'POV: You just discovered...',
      'If you know, you know 👀',
      'This trend hits different 🔥',
    ],
    placeholder: 'Add caption here...',
  },
  facebook: {
    name: 'Facebook',
    maxLength: 63206,
    guidance: 'Conversational. Encourage shares and reactions.',
    examples: [
      'We\'re thrilled to share...',
      'Tag someone who needs to see this',
      'What do you think? Leave a comment below 👇',
    ],
    placeholder: 'What\'s on your mind?',
  },
  youtube: {
    name: 'YouTube',
    maxLength: 5000,
    guidance: 'Detailed and descriptive. Include links and hashtags.',
    examples: [
      'In this video, we\'re exploring...',
      'Don\'t forget to like and subscribe!',
      'Watch till the end for the surprise!',
    ],
    placeholder: 'Tell viewers about this video...',
  },
}

export function CustomCampaignFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter')

  const [formData, setFormData] = useState<CustomCampaignData>({
    campaignName: '',
    customStrategy: '',
    strategyPlan: undefined,
    contents: [
      {
        platform: 'twitter',
        content: '',
        scheduledTime: new Date().toISOString(),
        timezone: 'UTC',
      },
      {
        platform: 'linkedin',
        content: '',
        scheduledTime: new Date().toISOString(),
        timezone: 'UTC',
      },
      {
        platform: 'instagram',
        content: '',
        scheduledTime: new Date().toISOString(),
        timezone: 'UTC',
      },
    ],
    selectedPlatforms: ['twitter', 'linkedin', 'instagram'],
    budget: 500,
  })

  const generateStrategyPlan = async () => {
    if (!formData.customStrategy.trim()) {
      setError('Please describe your custom strategy')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/marketing/workflows/custom/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: formData.customStrategy,
          platforms: formData.selectedPlatforms,
          budget: formData.budget,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate strategy plan')
      const plan = await response.json()

      setFormData((prev) => ({
        ...prev,
        strategyPlan: plan,
      }))

      setStep(2)
    } catch (err) {
      setError('Failed to generate strategy plan. Please try again.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleContentChange = (platform: string, content: string) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.map((c) =>
        c.platform === platform ? { ...c, content } : c
      ),
    }))
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...prev.selectedPlatforms, platform],
      contents: prev.selectedPlatforms.includes(platform)
        ? prev.contents.filter((c) => c.platform !== platform)
        : [
            ...prev.contents,
            {
              platform,
              content: '',
              scheduledTime: new Date().toISOString(),
              timezone: 'UTC',
            },
          ],
    }))
  }

  const launchCampaign = async () => {
    if (!formData.campaignName) {
      setError('Please enter a campaign name')
      return
    }

    const emptyContent = formData.contents.find((c) => !c.content.trim())
    if (emptyContent) {
      setError(`Please fill in content for ${emptyContent.platform}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/marketing/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          type: 'CUSTOM_CAMPAIGN',
          customInput: {
            contents: formData.contents.filter((c) =>
              formData.selectedPlatforms.includes(c.platform)
            ),
          },
          selectedPlatforms: formData.selectedPlatforms,
          budget: formData.budget,
          createdBy: 'current-user-id',
        }),
      })

      if (!response.ok) throw new Error('Failed to create campaign')
      const workflow = await response.json()

      const successMsg = `Campaign "${formData.campaignName}" created successfully! Scheduled to publish across all selected platforms.`
      // Show success
      setTimeout(() => {
        router.push(`/workflows/${workflow.id}`)
      }, 2000)
    } catch (err) {
      setError('Failed to create campaign. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const currentContent = formData.contents.find((c) => c.platform === selectedPlatform)
  const platformConfig = PLATFORM_CONFIG[selectedPlatform as keyof typeof PLATFORM_CONFIG]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Edit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Custom Campaign
            </h2>
            <p className="text-gray-600 mt-1">
              Write and schedule custom content for each platform
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              s <= step
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {step === 1 && !formData.strategyPlan && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Fall Collection Launch"
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
                  <Label>Select Platforms to Post On</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {Object.entries(PLATFORM_CONFIG).map(([key, platform]) => (
                      <button
                        key={key}
                        onClick={() => handlePlatformToggle(key)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          formData.selectedPlatforms.includes(key)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold">{platform.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {platform.maxLength} chars max
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <div className="flex gap-2 mt-2">
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
                  <Label className="font-semibold">Custom Strategy</Label>
                  <Textarea
                    placeholder="Describe your custom marketing strategy. E.g., 'Focus on thought leadership content for mid-market SaaS companies, emphasize ROI metrics, target CTOs and product managers'"
                    value={formData.customStrategy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customStrategy: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500">
                    Describe your target audience, key messages, content themes, and success metrics
                  </p>
                </div>

                <Button
                  onClick={generateStrategyPlan}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Strategy Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && formData.strategyPlan && (
            <Card className="border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Strategy Plan Review
                </CardTitle>
                <CardDescription>
                  Review the generated strategy before creating content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Strategy Title</p>
                  <p className="font-bold text-lg">{formData.strategyPlan.title}</p>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700">{formData.strategyPlan.description}</p>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Target Audience</p>
                  <p className="text-gray-700">{formData.strategyPlan.targetAudience}</p>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Key Messages</p>
                  <ul className="space-y-2">
                    {formData.strategyPlan.keyMessages.map((msg, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Content Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.strategyPlan.contentThemes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Estimated Reach</p>
                    <p className="font-bold text-lg text-green-900">
                      {formData.strategyPlan.estimatedReach.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Estimated Engagement</p>
                    <p className="font-bold text-lg text-blue-900">
                      {(formData.strategyPlan.estimatedEngagement * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        strategyPlan: undefined,
                      }))
                      setStep(1)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Strategy
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    Continue to Content
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <>
              {/* Platform Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.selectedPlatforms.map((platform) => (
                  <Button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    variant={selectedPlatform === platform ? 'default' : 'outline'}
                    className={
                      selectedPlatform === platform
                        ? 'bg-blue-600 text-white'
                        : ''
                    }
                  >
                    {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.name}
                  </Button>
                ))}
              </div>

              {/* Content Editor */}
              <Card className="border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        {platformConfig?.name} Content
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {platformConfig?.guidance}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Content</Label>
                      <span className="text-sm text-gray-600">
                        {currentContent?.content.length || 0} / {platformConfig?.maxLength}
                      </span>
                    </div>
                    <Textarea
                      placeholder={platformConfig?.placeholder}
                      value={currentContent?.content || ''}
                      onChange={(e) => handleContentChange(selectedPlatform, e.target.value)}
                      maxLength={platformConfig?.maxLength}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div>
                    <Label>Suggested Content Ideas</Label>
                    <div className="grid gap-2 mt-2">
                      {platformConfig?.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleContentChange(selectedPlatform, example)}
                          className="p-3 text-left rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <p className="text-sm text-gray-700">{example}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`date-${selectedPlatform}`}>Scheduled Date</Label>
                      <Input
                        id={`date-${selectedPlatform}`}
                        type="datetime-local"
                        value={
                          currentContent?.scheduledTime
                            ? new Date(currentContent.scheduledTime)
                                .toISOString()
                                .slice(0, 16)
                            : ''
                        }
                        onChange={(e) => {
                          const newDate = new Date(e.target.value).toISOString()
                          setFormData((prev) => ({
                            ...prev,
                            contents: prev.contents.map((c) =>
                              c.platform === selectedPlatform
                                ? { ...c, scheduledTime: newDate }
                                : c
                            ),
                          }))
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tz-${selectedPlatform}`}>Timezone</Label>
                      <select
                        id={`tz-${selectedPlatform}`}
                        value={currentContent?.timezone || 'UTC'}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            contents: prev.contents.map((c) =>
                              c.platform === selectedPlatform
                                ? { ...c, timezone: e.target.value }
                                : c
                            ),
                          }))
                        }}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option>UTC</option>
                        <option>EST</option>
                        <option>CST</option>
                        <option>MST</option>
                        <option>PST</option>
                        <option>GMT</option>
                        <option>CET</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Strategy
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Review & Launch
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Review Your Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {formData.contents
                    .filter((c) => formData.selectedPlatforms.includes(c.platform))
                    .map((content) => (
                      <div
                        key={content.platform}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge className="mb-2">
                              {PLATFORM_CONFIG[content.platform as keyof typeof PLATFORM_CONFIG]?.name}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              📅 {new Date(content.scheduledTime).toLocaleString()} {content.timezone}
                            </p>
                          </div>
                          <Eye className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-700">{content.content}</p>
                      </div>
                    ))}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      ✅ All content is scheduled and ready to publish across {formData.selectedPlatforms.length} platforms
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={launchCampaign}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Publish Campaign 🚀
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Summary Card */}
          {step >= 1 && (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Campaign Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Campaign Name</p>
                  <p className="font-semibold break-words">{formData.campaignName || '—'}</p>
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="text-gray-600 mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.selectedPlatforms.length > 0 ? (
                      formData.selectedPlatforms.map((p) => (
                        <Badge key={p} variant="secondary">
                          {PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG]?.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No platforms selected</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="text-gray-600">Budget</p>
                  <p className="font-semibold text-lg">${formData.budget}</p>
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="text-gray-600 mb-2">Content Status</p>
                  {formData.contents
                    .filter((c) => formData.selectedPlatforms.includes(c.platform))
                    .map((content) => (
                      <div
                        key={content.platform}
                        className="flex items-center gap-2 text-xs mb-1"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            content.content.trim()
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                        <span>
                          {PLATFORM_CONFIG[content.platform as keyof typeof PLATFORM_CONFIG]?.name}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Tailor content to each platform's audience</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Use platform-specific formatting and emojis</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Include clear calls-to-action</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Schedule for optimal engagement times</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
