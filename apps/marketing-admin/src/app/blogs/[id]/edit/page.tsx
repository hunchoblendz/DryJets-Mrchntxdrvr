'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { AlertCircle, CheckCircle, Save, Eye, Loader } from 'lucide-react'

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    metaTitle: '',
    metaDescription: '',
    excerpt: '',
    content: '',
    keywords: [] as string[],
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [publishStatus, setPublishStatus] = useState('')

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => apiClient.getBlog(blogId),
    onSuccess: (data) => {
      setFormData({
        title: data.title || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        keywords: data.keywords || [],
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (updates: any) => apiClient.updateBlogContent(blogId, updates),
    onSuccess: () => {
      setPublishStatus('updated')
      setTimeout(() => setPublishStatus(''), 3000)
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => apiClient.updateBlogStatus(blogId, 'PUBLISHED'),
    onSuccess: () => {
      setPublishStatus('published')
      setTimeout(() => router.push('/blogs'), 2000)
    },
  })

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      })
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    })
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this blog post?')) {
      publishMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <DashboardHeader
        title="Edit Blog Post"
        description="Review and refine your blog content before publishing"
      />

      {/* Status Messages */}
      {publishStatus === 'updated' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Blog post updated successfully. Changes saved to draft.
          </p>
        </div>
      )}

      {publishStatus === 'published' && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Blog post published! Redirecting to blog list...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-semibold"
              placeholder="Enter blog title..."
            />
          </div>

          {/* Meta Tags */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">SEO Meta Tags</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Title (60 characters max)
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value.slice(0, 60) })
                }
                maxLength={60}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="What appears in search results..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description (160 characters max)
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value.slice(0, 160),
                  })
                }
                maxLength={160}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Summary for search results..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">SEO Keywords</h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                placeholder="Add keyword and press Enter..."
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <Button type="button" variant="outline" onClick={handleAddKeyword}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <div
                  key={keyword}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:bg-primary/20 rounded px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Recommended: 5-7 keywords per post
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Excerpt (Blog summary)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="Brief summary of the blog post..."
            />
          </div>

          {/* Content Editor */}
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Blog Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              placeholder="Your blog content in markdown..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supports markdown formatting (# for headings, ** for bold, etc.)
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Post Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground capitalize">
                  {blog?.status || 'DRAFT'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Created by</p>
                <p className="font-semibold text-foreground">{blog?.createdBy || 'Manual'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Views</p>
                <p className="font-semibold text-foreground">{blog?.viewCount || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Word Count</p>
                <p className="font-semibold text-foreground">
                  {formData.content.split(/\s+/).length}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              onClick={handlePublish}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full"
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
          </div>

          {/* Publishing Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Publishing:</strong> Once published, this blog will be visible on your website and indexed by search engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
