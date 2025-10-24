'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, Edit2, Share2, Copy, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string
  const [copied, setCopied] = useState(false)

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => apiClient.getBlog(blogId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Blog post not found</p>
        <Link href="/blogs">
          <Button variant="outline">Back to Blogs</Button>
        </Link>
      </div>
    )
  }

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/blog/${blog.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Navigation */}
      <div>
        <Link href="/blogs" className="flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <DashboardHeader
          title={blog.title}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
              <Link href={`/blogs/${blog.id}/edit`}>
                <Button>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blog Card */}
          <div className="bg-card border border-border rounded-lg p-8">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
              <Badge className={statusColors[blog.status]}>
                {blog.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                by <span className="font-semibold text-foreground">{blog.createdBy}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDate(blog.createdAt)}
              </span>
            </div>

            {/* Meta Tags Preview */}
            <div className="bg-muted rounded-lg p-4 mb-8">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Search Result Preview
              </p>
              <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                {blog.metaTitle || blog.title}
              </p>
              <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                {`${window.location.origin}/blog/${blog.slug}`}
              </p>
              <p className="text-sm text-foreground mt-2">
                {blog.metaDescription}
              </p>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="mb-8">
                <p className="text-lg text-muted-foreground italic">
                  {blog.excerpt}
                </p>
              </div>
            )}

            {/* Blog Content */}
            <div className="prose dark:prose-invert max-w-none mb-12">
              <div className="whitespace-pre-wrap text-foreground text-base leading-relaxed">
                {blog.content}
              </div>
            </div>

            {/* Keywords */}
            {blog.keywords && blog.keywords.length > 0 && (
              <div className="pt-8 border-t border-border">
                <p className="font-semibold text-foreground mb-3">SEO Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {blog.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Publishing Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Publishing Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground capitalize">
                  {blog.status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-semibold text-foreground">
                  {formatDate(blog.createdAt)}
                </p>
              </div>
              {blog.publishedAt && (
                <div>
                  <p className="text-muted-foreground">Published</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(blog.publishedAt)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Created by</p>
                <p className="font-semibold text-foreground capitalize">
                  {blog.createdBy}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Views</p>
                <p className="font-semibold text-foreground">{blog.viewCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Slug</p>
                <p className="font-mono text-xs text-foreground break-all">
                  {blog.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Content Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Word Count</p>
                <p className="font-semibold text-foreground">
                  {blog.content?.split(/\s+/).length || 0} words
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Keywords</p>
                <p className="font-semibold text-foreground">
                  {blog.keywords?.length || 0} keywords
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">SERP Ranking</p>
                <p className="font-semibold text-foreground">
                  {blog.serpRank ? `Position ${blog.serpRank}` : 'Not ranked yet'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Repurposed</p>
                <p className="font-semibold text-foreground">
                  {blog.repurposedCount} times
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <Link href={`/blogs/${blog.id}/edit`} className="block">
              <Button className="w-full" variant="default">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
            </Link>
            <Link href={`/content/repurpose?blogId=${blog.id}`} className="block">
              <Button className="w-full" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Repurpose Content
              </Button>
            </Link>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> Use the "Repurpose Content" button to automatically create social media content variations from this blog post.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
