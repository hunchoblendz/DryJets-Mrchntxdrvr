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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Edit2,
  MessageSquare,
  Clock,
  Share2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ContentPiece {
  id: string
  platform: string
  platformId: string
  content: {
    title?: string
    body: string
    hashtags?: string[]
    mentions?: string[]
    mediaRecommendations?: string[]
    cta?: string
  }
  status: 'GENERATED' | 'APPROVED' | 'REJECTED'
  aiGenerated: boolean
  createdAt: string
}

interface BatchReviewProps {
  workflowId: string
  contentPieces: ContentPiece[]
  onReview?: (approved: string[], rejected: string[]) => void
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'bg-blue-50 border-blue-200',
  linkedin: 'bg-blue-50 border-blue-200',
  instagram: 'bg-pink-50 border-pink-200',
  tiktok: 'bg-black text-white border-gray-800',
  facebook: 'bg-blue-50 border-blue-200',
  youtube: 'bg-red-50 border-red-200',
  threads: 'bg-gray-50 border-gray-200',
  reddit: 'bg-orange-50 border-orange-200',
}

export function BatchReview({
  workflowId,
  contentPieces = [],
  onReview,
}: BatchReviewProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [approvalStatus, setApprovalStatus] = useState<
    Record<string, 'APPROVED' | 'REJECTED' | 'PENDING'>
  >({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>('')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize approval status
  if (Object.keys(approvalStatus).length === 0 && contentPieces.length > 0) {
    const initialStatus: Record<string, 'PENDING'> = {}
    contentPieces.forEach((piece) => {
      initialStatus[piece.id] = 'PENDING'
    })
    setApprovalStatus(initialStatus)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === contentPieces.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(contentPieces.map((p) => p.id))
    }
  }

  const handleSelectPiece = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleApproveSelected = () => {
    const newStatus = { ...approvalStatus }
    selectedIds.forEach((id) => {
      newStatus[id] = 'APPROVED'
    })
    setApprovalStatus(newStatus)
    setSuccess(`${selectedIds.length} items approved`)
    setSelectedIds([])
  }

  const handleRejectSelected = () => {
    const newStatus = { ...approvalStatus }
    selectedIds.forEach((id) => {
      newStatus[id] = 'REJECTED'
    })
    setApprovalStatus(newStatus)
    setSelectedIds([])
  }

  const handleEditContent = (id: string, content: string) => {
    setEditingId(id)
    setEditedContent(content)
  }

  const handleSaveEdit = (id: string) => {
    // Update the content in the piece
    const piece = contentPieces.find((p) => p.id === id)
    if (piece) {
      piece.content.body = editedContent
    }
    setEditingId(null)
    setSuccess('Content updated')
  }

  const handlePublish = async () => {
    const approvedIds = Object.entries(approvalStatus)
      .filter(([, status]) => status === 'APPROVED')
      .map(([id]) => id)

    const rejectedIds = Object.entries(approvalStatus)
      .filter(([, status]) => status === 'REJECTED')
      .map(([id]) => id)

    if (approvedIds.length === 0) {
      setError('Please approve at least one piece before publishing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v1/marketing/workflows/${workflowId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approvedIds,
            rejectedIds,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to submit review')

      onReview?.(approvedIds, rejectedIds)
      setSuccess('Review submitted successfully! Ready for publishing.')

      // Redirect to publishing step
      setTimeout(() => {
        router.push(`/workflows/${workflowId}/publish`)
      }, 2000)
    } catch (err) {
      setError('Failed to submit review. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approvedCount = Object.values(approvalStatus).filter(
    (s) => s === 'APPROVED'
  ).length
  const rejectedCount = Object.values(approvalStatus).filter(
    (s) => s === 'REJECTED'
  ).length
  const pendingCount = Object.values(approvalStatus).filter(
    (s) => s === 'PENDING'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Eye className="h-8 w-8 text-blue-600" />
          Review Generated Content
        </h2>
        <p className="text-gray-600 mt-2">
          Review and approve content before publishing to your platforms
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total Content</p>
              <p className="text-3xl font-bold">{contentPieces.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-600 text-sm mb-1 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" /> Pending
              </p>
              <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-600 text-sm mb-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Approved
              </p>
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 text-sm mb-1 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" /> Rejected
              </p>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedIds.length === contentPieces.length}
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={selectedIds.length === 0}
                onClick={handleApproveSelected}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                disabled={selectedIds.length === 0}
                onClick={handleRejectSelected}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Selected
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-4">
        {contentPieces.map((piece) => {
          const status = approvalStatus[piece.id] || 'PENDING'
          const isSelected = selectedIds.includes(piece.id)

          return (
            <Card
              key={piece.id}
              className={`transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${PLATFORM_COLORS[piece.platform] || 'bg-white'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectPiece(piece.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="capitalize">
                          {piece.platform}
                        </Badge>
                        {piece.aiGenerated && (
                          <Badge variant="secondary">AI Generated</Badge>
                        )}
                        <Badge
                          variant={
                            status === 'APPROVED'
                              ? 'default'
                              : status === 'REJECTED'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(piece.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewId(piece.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditContent(piece.id, piece.content.body)
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Content Preview */}
                <div className="bg-white rounded p-4">
                  {editingId === piece.id ? (
                    <div className="space-y-2">
                      <Label>Edit Content</Label>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(piece.id)}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {piece.content.title && (
                        <p className="font-bold text-lg">
                          {piece.content.title}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">
                        {piece.content.body}
                      </p>
                      {piece.content.hashtags?.length > 0 && (
                        <p className="text-sm text-blue-600">
                          {piece.content.hashtags.join(' ')}
                        </p>
                      )}
                      {piece.content.cta && (
                        <p className="text-sm font-semibold text-gray-600">
                          CTA: {piece.content.cta}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata & Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`notes-${piece.id}`} className="text-sm">
                      Notes
                    </Label>
                    <Textarea
                      id={`notes-${piece.id}`}
                      placeholder="Add comments or feedback..."
                      value={notes[piece.id] || ''}
                      onChange={(e) =>
                        setNotes({
                          ...notes,
                          [piece.id]: e.target.value,
                        })
                      }
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`schedule-${piece.id}`}
                      className="text-sm"
                    >
                      Schedule Publishing (Optional)
                    </Label>
                    <Input
                      id={`schedule-${piece.id}`}
                      type="datetime-local"
                      value={scheduleDates[piece.id] || ''}
                      onChange={(e) =>
                        setScheduleDates({
                          ...scheduleDates,
                          [piece.id]: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for immediate publishing
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      status === 'APPROVED' ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setApprovalStatus({
                        ...approvalStatus,
                        [piece.id]: 'APPROVED',
                      })
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      status === 'REJECTED' ? 'destructive' : 'outline'
                    }
                    onClick={() =>
                      setApprovalStatus({
                        ...approvalStatus,
                        [piece.id]: 'REJECTED',
                      })
                    }
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setApprovalStatus({
                        ...approvalStatus,
                        [piece.id]: 'PENDING',
                      })
                    }}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Publish Button */}
      <div className="flex gap-4 justify-end sticky bottom-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Workflow
        </Button>
        <Button
          size="lg"
          disabled={loading || approvedCount === 0}
          onClick={handlePublish}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Review...
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Submit Review & Continue to Publishing ({approvedCount} approved)
            </>
          )}
        </Button>
      </div>

      {/* Preview Modal */}
      {previewId && (
        <PreviewModal
          piece={contentPieces.find((p) => p.id === previewId)!}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  )
}

function PreviewModal({
  piece,
  onClose,
}: {
  piece: ContentPiece
  onClose: () => void
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Content Preview</DialogTitle>
          <DialogDescription>
            {piece.platform.toUpperCase()} - {new Date(piece.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className={`p-6 rounded-lg ${PLATFORM_COLORS[piece.platform]}`}>
            {piece.content.title && (
              <p className="font-bold text-lg mb-3">{piece.content.title}</p>
            )}
            <p className="whitespace-pre-wrap text-sm mb-3">
              {piece.content.body}
            </p>
            {piece.content.hashtags?.length > 0 && (
              <p className="text-blue-600 text-sm mb-2">
                {piece.content.hashtags.join(' ')}
              </p>
            )}
            {piece.content.mediaRecommendations?.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold mb-2">
                  Recommended Media:
                </p>
                <div className="flex gap-2">
                  {piece.content.mediaRecommendations.map((rec, i) => (
                    <Badge key={i} variant="secondary">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
