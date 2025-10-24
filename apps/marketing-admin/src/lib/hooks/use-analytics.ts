import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export function useAnalyticsDashboard(campaignId: string, autoRefresh: boolean = true) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getAnalyticsDashboard(campaignId)
      setDashboard(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetch()
    if (!autoRefresh) return

    const interval = setInterval(fetch, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetch, autoRefresh])

  return { dashboard, loading, error, refetch: fetch }
}

export function useChannelMetrics(campaignId: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const data = await api.getChannelMetrics(campaignId)
        setMetrics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [campaignId])

  return { metrics, loading, error }
}

export function useROIAnalysis(campaignId: string) {
  const [roiAnalysis, setROIAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchROI = async () => {
      try {
        setLoading(true)
        const data = await api.analyzeROI(campaignId)
        setROIAnalysis(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ROI analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchROI()
  }, [campaignId])

  return { roiAnalysis, loading, error }
}

export function usePerformanceTrends(campaignId: string, days: number = 30) {
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true)
        const data = await api.getPerformanceTrends(campaignId, days)
        setTrends(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends')
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [campaignId, days])

  return { trends, loading, error }
}

export function useChannelComparison(campaignId: string) {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true)
        const data = await api.getChannelComparison(campaignId)
        setComparison(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comparison')
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [campaignId])

  return { comparison, loading, error }
}

export function useAnalyticsReport(campaignId: string) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (
    reportType: 'summary' | 'detailed' | 'executive',
    startDate?: Date,
    endDate?: Date,
    channels?: string[],
  ) => {
    try {
      setLoading(true)
      const data = await api.generateAnalyticsReport(campaignId, {
        reportType,
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        channels,
      })
      setReport(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (
    reportType: string = 'summary',
    format: 'csv' | 'json' = 'json',
  ) => {
    try {
      setLoading(true)
      const data = await api.exportAnalyticsReport(campaignId, {
        reportType,
        format,
      })
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { report, loading, error, generateReport, exportReport }
}

export function useAllCampaignsAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await api.getAllCampaignsAnalytics()
        setAnalytics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return { analytics, loading, error }
}
