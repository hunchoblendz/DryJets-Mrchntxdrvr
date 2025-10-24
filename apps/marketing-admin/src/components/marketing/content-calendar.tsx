'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, AlertCircle, Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ScheduledContent {
  id: string
  title: string
  platform: string
  date: Date
  time: string
  status: 'scheduled' | 'published' | 'draft' | 'failed'
  content: string
  media?: string[]
}

const PLATFORMS = {
  twitter: { name: 'Twitter', color: 'bg-blue-100 text-blue-800' },
  linkedin: { name: 'LinkedIn', color: 'bg-indigo-100 text-indigo-800' },
  facebook: { name: 'Facebook', color: 'bg-cyan-100 text-cyan-800' },
  instagram: { name: 'Instagram', color: 'bg-pink-100 text-pink-800' },
  tiktok: { name: 'TikTok', color: 'bg-gray-100 text-gray-800' },
  youtube: { name: 'YouTube', color: 'bg-red-100 text-red-800' },
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-50 border-blue-200',
  published: 'bg-green-50 border-green-200',
  draft: 'bg-gray-50 border-gray-200',
  failed: 'bg-red-50 border-red-200',
}

const HOLIDAYS = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-12-25', name: 'Christmas' },
  { date: '2025-11-27', name: 'Thanksgiving' },
]

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [draggedItem, setDraggedItem] = useState<ScheduledContent | null>(null)

  // Sample data
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([
    {
      id: '1',
      title: 'New Product Launch',
      platform: 'twitter',
      date: new Date(2025, 0, 15),
      time: '09:00 AM',
      status: 'scheduled',
      content: 'Excited to announce our new product...',
    },
    {
      id: '2',
      title: 'Behind the Scenes',
      platform: 'instagram',
      date: new Date(2025, 0, 18),
      time: '03:00 PM',
      status: 'scheduled',
      content: 'A glimpse into our creative process...',
      media: ['image1.jpg', 'image2.jpg'],
    },
    {
      id: '3',
      title: 'Weekly Newsletter',
      platform: 'linkedin',
      date: new Date(2025, 0, 20),
      time: '08:00 AM',
      status: 'draft',
      content: 'This week in industry news...',
    },
    {
      id: '4',
      title: 'TikTok Trend',
      platform: 'tiktok',
      date: new Date(2025, 0, 22),
      time: '06:00 PM',
      status: 'scheduled',
      content: 'Jumping on the latest trend...',
    },
  ])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getContentForDate = (date: Date) => {
    return scheduledContent.filter(
      (content) =>
        content.date.toDateString() === date.toDateString(),
    )
  }

  const getDayContent = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
    }

    return days
  }

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return HOLIDAYS.some((h) => h.date === dateStr)
  }

  const getHolidayName = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return HOLIDAYS.find((h) => h.date === dateStr)?.name
  }

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    )
  }

  const handleDragStart = (content: ScheduledContent) => {
    setDraggedItem(content)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (date: Date) => {
    if (draggedItem) {
      setScheduledContent((prev) =>
        prev.map((item) =>
          item.id === draggedItem.id
            ? { ...item, date: new Date(date) }
            : item,
        ),
      )
      setDraggedItem(null)
    }
  }

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const days = getDayContent()

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Calendar</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage and schedule content across all platforms
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{monthYear}</h2>
            <div className="flex gap-2">
              <Button
                onClick={handlePrevMonth}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="outline"
                size="sm"
              >
                Today
              </Button>
              <Button
                onClick={handleNextMonth}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, idx) => {
                const dayContent = date ? getContentForDate(date) : []
                const isHolidayDay = date ? isHoliday(date) : false
                const holidayName = date ? getHolidayName(date) : null
                const isToday =
                  date &&
                  date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={idx}
                    onDragOver={handleDragOver}
                    onDrop={() => date && handleDrop(date)}
                    className={`min-h-32 border rounded-lg p-2 cursor-pointer transition-colors ${
                      date
                        ? `${
                            isToday
                              ? 'bg-blue-50 border-blue-300'
                              : isHolidayDay
                                ? 'bg-yellow-50 border-yellow-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`
                        : 'bg-gray-50 border-gray-100'
                    }`}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-semibold mb-1">
                          {date.getDate()}
                        </div>

                        {isHolidayDay && (
                          <div className="text-xs text-yellow-700 font-semibold mb-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {holidayName}
                          </div>
                        )}

                        {/* Content items */}
                        <div className="space-y-1">
                          {dayContent.map((content) => (
                            <div
                              key={content.id}
                              draggable
                              onDragStart={() => handleDragStart(content)}
                              className={`text-xs p-1 rounded cursor-move border ${
                                STATUS_COLORS[content.status]
                              } hover:shadow-md transition-shadow truncate`}
                              title={content.title}
                            >
                              <div className="flex gap-1 items-center">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs py-0 ${
                                    PLATFORMS[content.platform as keyof typeof PLATFORMS]
                                      ?.color
                                  }`}
                                >
                                  {PLATFORMS[content.platform as keyof typeof PLATFORMS]?.name}
                                </Badge>
                              </div>
                              <p className="mt-1 truncate font-medium">
                                {content.title}
                              </p>
                              <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {content.time}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Conflict detection */}
                        {dayContent.length > 2 && (
                          <div className="mt-2 flex items-center gap-1 text-orange-700 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            Multiple posts
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
                {isHoliday(selectedDate) && (
                  <Badge className="mt-2" variant="secondary">
                    {getHolidayName(selectedDate)}
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => setSelectedDate(null)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getContentForDate(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getContentForDate(selectedDate).map((content) => (
                  <Dialog key={content.id}>
                    <DialogTrigger asChild>
                      <div className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${STATUS_COLORS[content.status]}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <Badge
                              className={
                                PLATFORMS[
                                  content.platform as keyof typeof PLATFORMS
                                ]?.color
                              }
                            >
                              {
                                PLATFORMS[
                                  content.platform as keyof typeof PLATFORMS
                                ]?.name
                              }
                            </Badge>
                            <Badge variant="outline">
                              {content.status}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{content.time}</span>
                        </div>
                        <h3 className="font-semibold mb-2">{content.title}</h3>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {content.content}
                        </p>
                        {content.media && (
                          <p className="text-xs text-gray-500 mt-2">
                            📎 {content.media.length} media file(s)
                          </p>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{content.title}</DialogTitle>
                        <DialogDescription>
                          {selectedDate.toLocaleDateString()} at {content.time}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Platform</h4>
                          <Badge className={PLATFORMS[content.platform as keyof typeof PLATFORMS]?.color}>
                            {PLATFORMS[content.platform as keyof typeof PLATFORMS]?.name}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Status</h4>
                          <Badge variant="outline">{content.status}</Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Content</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {content.content}
                          </p>
                        </div>
                        {content.media && (
                          <div>
                            <h4 className="font-semibold mb-2">Media</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {content.media.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-100 h-20 rounded flex items-center justify-center text-xs text-gray-500"
                                >
                                  {file}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button className="flex-1">
                            {content.status === 'draft' ? 'Publish' : 'View'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No content scheduled for this date</p>
                <Button className="mt-4" size="sm">
                  Schedule Content
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(PLATFORMS).map(([key, platform]) => {
              const count = scheduledContent.filter(
                (c) => c.platform === key && c.status === 'scheduled',
              ).length
              return (
                <div
                  key={key}
                  className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h4 className="font-semibold text-sm">{platform.name}</h4>
                  <p className="text-2xl font-bold mt-2 text-blue-600">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {scheduledContent.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {scheduledContent.filter((c) => c.status === 'published').length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {scheduledContent.filter((c) => c.status === 'scheduled').length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {scheduledContent.filter((c) => c.status === 'draft').length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Drafts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
