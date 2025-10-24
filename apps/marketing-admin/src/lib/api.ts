// API utility functions for marketing module

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: RequestOptions = {},
) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token') || '';

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Campaign APIs
export const campaignAPI = {
  listCampaigns: (status?: string) =>
    apiCall(`/marketing/campaigns${status ? `?status=${status}` : ''}`),

  createCampaign: (data: any) =>
    apiCall('/marketing/campaigns', {
      method: 'POST',
      body: data,
    }),

  getCampaign: (id: string) => apiCall(`/marketing/campaigns/${id}`),

  updateCampaignStatus: (id: string, status: string) =>
    apiCall(`/marketing/campaigns/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  launchCampaign: (id: string, data: any) =>
    apiCall(`/marketing/campaigns/${id}/launch`, {
      method: 'POST',
      body: data,
    }),

  pauseCampaign: (id: string, reason?: string) =>
    apiCall(`/marketing/campaigns/${id}/pause`, {
      method: 'POST',
      body: { reason },
    }),

  resumeCampaign: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/resume`, {
      method: 'POST',
    }),

  getCampaignStatus: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/status`),

  getCampaignMetrics: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/metrics`),

  coordinateChannels: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/coordinate`, {
      method: 'POST',
    }),

  getChannelPerformance: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/channel-performance`),

  executeWorkflow: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/execute-workflow`, {
      method: 'POST',
    }),

  getWorkflowStatus: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/workflow-status`),

  getBudgetEfficiency: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/budget-efficiency`),

  getBudgetStatus: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/budget-status`),

  getBudgetRecommendations: (id: string) =>
    apiCall(`/marketing/campaigns/${id}/budget-recommendations`),

  forecastROI: (id: string, days?: number) =>
    apiCall(
      `/marketing/campaigns/${id}/roi-forecast${days ? `?days=${days}` : ''}`,
    ),

  optimizeCampaign: (id: string, data: any) =>
    apiCall(`/marketing/campaigns/${id}/optimize`, {
      method: 'POST',
      body: data,
    }),
};
