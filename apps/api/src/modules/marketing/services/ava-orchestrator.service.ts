import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * AvaOrchestratorService
 *
 * AI-powered campaign orchestration and optimization
 * - Campaign strategy generation
 * - Multi-channel coordination intelligence
 * - Success prediction modeling
 * - Failure recovery mechanisms
 * - Real-time orchestration recommendations
 */
@Injectable()
export class AvaOrchestratorService {
  private logger = new Logger('AvaOrchestrator');
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate comprehensive campaign strategy using AI
   */
  async generateCampaignStrategy(
    campaignId: string,
    context?: { targetAudience?: string; budget?: number; objectives?: string[] },
  ): Promise<any> {
    this.logger.log(`[Ava] Generating strategy for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { budgetAllocations: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const prompt = this.buildStrategyPrompt(campaign, context);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return {
      campaignId,
      strategy: response.strategy || {},
      channels: response.channels || [],
      timeline: response.timeline || [],
      keyMetrics: response.keyMetrics || [],
      riskFactors: response.riskFactors || [],
      successProbability: response.successProbability || 0,
      generatedAt: new Date(),
    };
  }

  /**
   * Build strategy generation prompt
   */
  private buildStrategyPrompt(campaign: any, context?: any): string {
    return `
You are Ava, an expert campaign orchestration strategist specializing in multi-channel marketing.

Campaign Details:
- Name: ${campaign.name}
- Type: ${campaign.type}
- Budget: $${campaign.totalBudget}
- Platforms: ${campaign.platforms?.join(', ') || 'Not specified'}
- Target Audience: ${context?.targetAudience || 'Not specified'}
- Objectives: ${context?.objectives?.join(', ') || 'Not specified'}

Generate a comprehensive campaign strategy that includes:

1. **Channel Strategy**: Which channels to focus on and why
2. **Timeline**: Week-by-week execution plan
3. **Content Strategy**: Types of content for each channel
4. **Budget Allocation**: Recommended distribution across channels
5. **Key Metrics**: Success metrics to track
6. **Risk Factors**: Potential challenges and mitigation strategies
7. **Success Probability**: Estimated likelihood of success (0-100)

Return as JSON with this structure:
{
  "strategy": {
    "overview": "...",
    "goals": ["...", "..."],
    "targetAudience": "...",
    "differentiators": ["...", "..."]
  },
  "channels": [
    {
      "name": "email/social/ads",
      "focus": "primary/secondary/tertiary",
      "tactics": ["...", "..."],
      "contentTypes": ["...", "..."],
      "estimatedReach": 50000,
      "conversionRate": 2.5
    }
  ],
  "timeline": [
    {
      "week": 1,
      "phase": "Setup",
      "tasks": ["...", "..."],
      "deliverables": ["...", "..."]
    }
  ],
  "keyMetrics": ["impressions", "clicks", "conversions", "roi"],
  "riskFactors": [
    {
      "risk": "...",
      "impact": "high/medium/low",
      "mitigation": "..."
    }
  ],
  "successProbability": 75
}

Ensure the strategy is data-driven, practical, and optimized for the campaign budget and objectives.
    `;
  }

  /**
   * Predict campaign success probability
   */
  async predictCampaignSuccess(campaignId: string): Promise<any> {
    this.logger.log(`[Ava] Predicting success for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { metrics: true, budgetAllocations: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const metrics = campaign.metrics || [];

    // Calculate success indicators
    const successIndicators = {
      hasMetrics: metrics.length > 0,
      hasBudget: campaign.totalBudget > 0,
      hasMultipleChannels: (campaign.platforms || []).length > 1,
      hasDefinedGoals: campaign.objectives?.length > 0,
    };

    // Calculate success score based on available data
    let successScore = 50; // Base score

    if (successIndicators.hasMetrics) {
      const avgConversionRate = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + ((m.conversions || 0) / (m.impressions || 1)), 0) / metrics.length
        : 0;
      successScore += Math.min(avgConversionRate * 100, 20);
    }

    if (successIndicators.hasMultipleChannels) {
      successScore += 10;
    }

    if (successIndicators.hasDefinedGoals) {
      successScore += 10;
    }

    if (successIndicators.hasBudget) {
      successScore += 10;
    }

    // Use AI to generate detailed prediction
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `
As a campaign strategist, analyze this campaign data and predict success:
- Campaign: ${campaign.name}
- Type: ${campaign.type}
- Budget: $${campaign.totalBudget}
- Platforms: ${campaign.platforms?.join(', ')}
- Metrics Records: ${metrics.length}
- Success Indicators: ${JSON.stringify(successIndicators)}

Provide a JSON response with:
{
  "successProbability": (number 0-100),
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."],
  "expectedOutcome": "..."
}
          `,
        },
      ],
    });

    const prediction = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return {
      campaignId,
      successProbability: prediction.successProbability || successScore,
      strengths: prediction.strengths || [],
      weaknesses: prediction.weaknesses || [],
      recommendations: prediction.recommendations || [],
      expectedOutcome: prediction.expectedOutcome || '',
      analysisDate: new Date(),
    };
  }

  /**
   * Get real-time orchestration recommendations
   */
  async getOrchestrationRecommendations(campaignId: string): Promise<any> {
    this.logger.log(`[Ava] Getting orchestration recommendations for: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { metrics: true, budgetAllocations: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const channelMetrics = this.aggregateChannelMetrics(campaign.metrics || []);

    const recommendations = {
      campaignId,
      timestamp: new Date(),
      channelRecommendations: await this.getChannelRecommendations(
        channelMetrics,
        campaign,
      ),
      budgetAdjustments: this.calculateBudgetAdjustments(channelMetrics),
      contentOptimizations: await this.getContentOptimizations(campaign),
      timingOptimizations: this.getTimingOptimizations(campaign),
      urgentActions: this.identifyUrgentActions(campaign),
    };

    return recommendations;
  }

  /**
   * Aggregate channel metrics
   */
  private aggregateChannelMetrics(metrics: any[]): Record<string, any> {
    const aggregated: Record<string, any> = {};

    metrics.forEach((metric) => {
      const channel = metric.channel;
      if (!aggregated[channel]) {
        aggregated[channel] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          engagement: 0,
        };
      }
      aggregated[channel].impressions += metric.impressions || 0;
      aggregated[channel].clicks += metric.clicks || 0;
      aggregated[channel].conversions += metric.conversions || 0;
      aggregated[channel].spend += metric.spend || 0;
      aggregated[channel].engagement += metric.engagements || 0;
    });

    return aggregated;
  }

  /**
   * Get channel-specific recommendations
   */
  private async getChannelRecommendations(
    channelMetrics: Record<string, any>,
    campaign: any,
  ): Promise<any[]> {
    const recommendations: any[] = [];

    const channels = Object.keys(channelMetrics);
    if (channels.length === 0) {
      return recommendations;
    }

    // Sort by performance
    const sorted = channels.sort((a, b) => {
      const scoreA = (channelMetrics[a].conversions || 0) / (channelMetrics[a].spend || 1);
      const scoreB = (channelMetrics[b].conversions || 0) / (channelMetrics[b].spend || 1);
      return scoreB - scoreA;
    });

    sorted.forEach((channel, index) => {
      const metrics = channelMetrics[channel];
      const roi = metrics.spend > 0 ? (metrics.conversions * 100 - metrics.spend) / metrics.spend : 0;

      recommendations.push({
        channel,
        rank: index + 1,
        performance: roi > 0 ? 'excellent' : roi > -20 ? 'good' : 'needs_improvement',
        roi: roi.toFixed(2),
        actions:
          index === 0
            ? ['Increase budget', 'Expand audience', 'Test new content']
            : ['Optimize targeting', 'Improve creative', 'Reduce budget if ROI negative'],
      });
    });

    return recommendations;
  }

  /**
   * Calculate budget adjustment recommendations
   */
  private calculateBudgetAdjustments(channelMetrics: Record<string, any>): any {
    const totalSpend = Object.values(channelMetrics).reduce((sum: number, m: any) => sum + m.spend, 0);
    const adjustments: any = {};

    Object.entries(channelMetrics).forEach(([channel, metrics]: [string, any]) => {
      const roi = metrics.spend > 0 ? (metrics.conversions * 100 - metrics.spend) / metrics.spend : 0;
      const currentAllocation = metrics.spend > 0 ? (metrics.spend / totalSpend) * 100 : 0;

      if (roi > 50) {
        adjustments[channel] = {
          action: 'increase',
          percentage: 20,
          reason: 'Strong ROI performance',
        };
      } else if (roi < 0) {
        adjustments[channel] = {
          action: 'decrease',
          percentage: 25,
          reason: 'Negative ROI - reallocate budget',
        };
      } else {
        adjustments[channel] = {
          action: 'maintain',
          percentage: 0,
          reason: 'Moderate performance - monitor closely',
        };
      }
    });

    return adjustments;
  }

  /**
   * Get content optimization suggestions
   */
  private async getContentOptimizations(campaign: any): Promise<any[]> {
    const optimizations = [
      {
        area: 'messaging',
        suggestion: 'Test new value propositions',
        priority: 'high',
      },
      {
        area: 'creative',
        suggestion: 'Update visual assets to match season/trends',
        priority: 'medium',
      },
      {
        area: 'cta',
        suggestion: 'A/B test different call-to-actions',
        priority: 'high',
      },
      {
        area: 'tone',
        suggestion: 'Adjust tone to match audience preferences',
        priority: 'medium',
      },
    ];

    return optimizations;
  }

  /**
   * Get timing optimization recommendations
   */
  private getTimingOptimizations(campaign: any): any {
    return {
      email: {
        bestDay: 'Tuesday',
        bestTime: '10:00 AM',
        frequency: 'Weekly',
      },
      social: {
        bestDay: 'Wednesday',
        bestTime: '1:00 PM',
        frequency: 'Daily',
      },
      ads: {
        bestDay: 'Thursday-Friday',
        bestTime: '6:00 PM',
        frequency: 'Continuous',
      },
    };
  }

  /**
   * Identify urgent actions needed
   */
  private identifyUrgentActions(campaign: any): string[] {
    const actions: string[] = [];

    if (campaign.status === 'PAUSED') {
      actions.push('Resume campaign to maintain momentum');
    }

    if (campaign.totalBudget && campaign.totalBudget < 1000) {
      actions.push('Consider increasing budget for better reach');
    }

    if (!campaign.objectives || campaign.objectives.length === 0) {
      actions.push('Define clear campaign objectives');
    }

    if (!campaign.platforms || campaign.platforms.length === 1) {
      actions.push('Expand to additional channels for better coverage');
    }

    return actions.length > 0 ? actions : ['Campaign is well-optimized'];
  }

  /**
   * Detect and suggest recovery for failing campaigns
   */
  async suggestFailureRecovery(campaignId: string): Promise<any> {
    this.logger.log(`[Ava] Analyzing failure recovery for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { metrics: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const metrics = campaign.metrics || [];
    const isUnderperforming = this.isUnderperforming(metrics);

    if (!isUnderperforming) {
      return {
        campaignId,
        status: 'healthy',
        message: 'Campaign is performing as expected',
        actions: [],
      };
    }

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `
A marketing campaign is underperforming. Campaign name: ${campaign.name}
Budget: $${campaign.totalBudget}
Platforms: ${campaign.platforms?.join(', ')}

Generate emergency recovery recommendations as JSON:
{
  "criticalIssues": ["...", "..."],
  "recoveryActions": [
    {
      "action": "...",
      "priority": "immediate/high/medium",
      "expectedImpact": "..."
    }
  ],
  "estimatedTimeToRecovery": "X days",
  "alternativeStrategy": "..."
}
          `,
        },
      ],
    });

    const recovery = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return {
      campaignId,
      status: 'needs_recovery',
      ...recovery,
      analysisDate: new Date(),
    };
  }

  /**
   * Check if campaign is underperforming
   */
  private isUnderperforming(metrics: any[]): boolean {
    if (metrics.length === 0) return false;

    const avgConversionRate = metrics.reduce(
      (sum, m) => sum + ((m.conversions || 0) / (m.impressions || 1)),
      0,
    ) / metrics.length;

    const avgROI = metrics.reduce((sum, m) => {
      const spend = m.spend || 1;
      const revenue = (m.conversions || 0) * 100; // Assuming $100 per conversion
      return sum + (revenue - spend) / spend;
    }, 0) / metrics.length;

    return avgConversionRate < 0.01 || avgROI < -0.2; // Less than 1% conversion or -20% ROI
  }

  /**
   * Get orchestration dashboard data
   */
  async getOrchestrationDashboard(campaignId: string): Promise<any> {
    this.logger.log(`[Ava] Getting orchestration dashboard for: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const [recommendations, prediction, recovery] = await Promise.all([
      this.getOrchestrationRecommendations(campaignId),
      this.predictCampaignSuccess(campaignId),
      this.suggestFailureRecovery(campaignId),
    ]);

    return {
      campaignId,
      campaign: {
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
      },
      recommendations,
      successPrediction: prediction,
      failureRecovery: recovery,
      generatedAt: new Date(),
    };
  }
}
