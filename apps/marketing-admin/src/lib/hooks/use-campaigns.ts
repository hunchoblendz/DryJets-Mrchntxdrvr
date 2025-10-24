'use client'

import { useState, useCallback, useEffect } from 'react'
import { campaignAPI } from '../api'

export interface Campaign {
  id: string
  name: string
  type: 'AWARENESS' | 'ENGAGEMENT' | 'CONVERSION' | 'RETENTION'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  platforms: string[]
  budgetTotal: number
  targetAudience?: any
  createdAt: string
  updatedAt: string
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async (status?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.listCampaigns(status)
      setCampaigns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.getCampaign(id)
      setCampaign(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCampaign()
    }
  }, [id, fetchCampaign])

  return { campaign, loading, error, refetch: fetchCampaign }
}

export function useCampaignMetrics(id: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.getCampaignMetrics(id)
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchMetrics()
      // Refresh metrics every 30 seconds
      const interval = setInterval(fetchMetrics, 30000)
      return () => clearInterval(interval)
    }
  }, [id, fetchMetrics])

  return { metrics, loading, error, refetch: fetchMetrics }
}

export function useCampaignStatus(id: string) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.getCampaignStatus(id)
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchStatus()
      // Refresh status every 10 seconds
      const interval = setInterval(fetchStatus, 10000)
      return () => clearInterval(interval)
    }
  }, [id, fetchStatus])

  return { status, loading, error, refetch: fetchStatus }
}

export function useCampaignWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.getWorkflowStatus(id)
      setWorkflow(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchWorkflow()
      // Refresh workflow every 10 seconds
      const interval = setInterval(fetchWorkflow, 10000)
      return () => clearInterval(interval)
    }
  }, [id, fetchWorkflow])

  return { workflow, loading, error, refetch: fetchWorkflow }
}

export function useCampaignBudget(id: string) {
  const [budget, setBudget] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignAPI.getBudgetStatus(id)
      setBudget(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budget')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchBudget()
    }
  }, [id, fetchBudget])

  return { budget, loading, error, refetch: fetchBudget }
}
