'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Play, Pause, Eye } from 'lucide-react'
import { Campaign } from '@/lib/hooks/use-campaigns'
import { campaignAPI } from '@/lib/api'

interface CampaignListProps {
  campaigns: Campaign[]
  onRefresh: () => void
  loading?: boolean
}

export function CampaignList({ campaigns, onRefresh, loading }: CampaignListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AWARENESS':
        return 'bg-purple-100 text-purple-800'
      case 'ENGAGEMENT':
        return 'bg-blue-100 text-blue-800'
      case 'CONVERSION':
        return 'bg-green-100 text-green-800'
      case 'RETENTION':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleLaunch = async (id: string) => {
    try {
      setActionLoading(id)
      await campaignAPI.launchCampaign(id, {})
      onRefresh()
    } catch (error) {
      console.error('Failed to launch campaign:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePause = async (id: string) => {
    try {
      setActionLoading(id)
      await campaignAPI.pauseCampaign(id)
      onRefresh()
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async (id: string) => {
    try {
      setActionLoading(id)
      await campaignAPI.resumeCampaign(id)
      onRefresh()
    } catch (error) {
      console.error('Failed to resume campaign:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {loading ? 'Loading campaigns...' : 'No campaigns found'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(campaign.type)}>
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${campaign.budgetTotal?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {campaign.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actionLoading === campaign.id}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/campaigns/${campaign.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>

                        {campaign.status === 'DRAFT' && (
                          <DropdownMenuItem
                            onClick={() => handleLaunch(campaign.id)}
                            disabled={actionLoading === campaign.id}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Launch
                          </DropdownMenuItem>
                        )}

                        {campaign.status === 'ACTIVE' && (
                          <DropdownMenuItem
                            onClick={() => handlePause(campaign.id)}
                            disabled={actionLoading === campaign.id}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}

                        {campaign.status === 'PAUSED' && (
                          <DropdownMenuItem
                            onClick={() => handleResume(campaign.id)}
                            disabled={actionLoading === campaign.id}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
