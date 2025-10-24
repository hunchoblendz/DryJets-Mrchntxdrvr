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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { campaignAPI } from '@/lib/api'

interface CampaignFormData {
  name: string
  type: 'AWARENESS' | 'ENGAGEMENT' | 'CONVERSION' | 'RETENTION'
  platforms: string[]
  budgetTotal: number
  targetAudience?: any
}

const CAMPAIGN_TYPES = [
  { value: 'AWARENESS', label: 'Brand Awareness' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'CONVERSION', label: 'Conversion' },
  { value: 'RETENTION', label: 'Customer Retention' },
]

const PLATFORMS = [
  { value: 'EMAIL', label: 'Email Marketing' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'ADS', label: 'Paid Ads' },
]

export function CampaignForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'AWARENESS',
    platforms: ['EMAIL'],
    budgetTotal: 1000,
    targetAudience: {
      demographics: 'General',
      interests: [],
    },
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budgetTotal' ? parseFloat(value) : value,
    }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as CampaignFormData['type'],
    }))
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name) {
      setError('Campaign name is required')
      return
    }

    if (formData.platforms.length === 0) {
      setError('Please select at least one platform')
      return
    }

    if (formData.budgetTotal <= 0) {
      setError('Budget must be greater than 0')
      return
    }

    try {
      setLoading(true)
      const campaign = await campaignAPI.createCampaign(formData)
      router.push(`/campaigns/${campaign.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Create a new marketing campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Campaign Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="budgetTotal">Budget (USD)</Label>
            <Input
              id="budgetTotal"
              name="budgetTotal"
              type="number"
              value={formData.budgetTotal}
              onChange={handleInputChange}
              min="1"
              step="100"
              required
            />
          </div>

          <div>
            <Label>Platforms</Label>
            <div className="space-y-3 mt-2">
              {PLATFORMS.map((platform) => (
                <div key={platform.value} className="flex items-center gap-2">
                  <Checkbox
                    id={platform.value}
                    checked={formData.platforms.includes(platform.value)}
                    onCheckedChange={() => handlePlatformToggle(platform.value)}
                  />
                  <Label htmlFor={platform.value} className="font-normal cursor-pointer">
                    {platform.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Audience</CardTitle>
          <CardDescription>Define your target audience (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="demographics">Demographics</Label>
            <Input
              id="demographics"
              value={formData.targetAudience?.demographics || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAudience: {
                    ...prev.targetAudience,
                    demographics: e.target.value,
                  },
                }))
              }
              placeholder="e.g., 25-45 year olds, professionals"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Campaign
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
