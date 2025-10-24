import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * AnalyticsService
 *
 * Comprehensive campaign performance analytics and reporting
 * - Campaign performance dashboards
 * - Channel comparison analysis
 * - ROI analysis and breakdown
 * - Trend analysis
 * - Custom report generation
 * - Export functionality
 */
@Injectable()
export class AnalyticsService {
  private logger = new Logger('Analytics');

  constructor(private prisma: PrismaService) {}

  /**
   * Get complete campaign analytics dashboard
   */
  async getCampaignAnalyticsDashboard(campaignId: string): Promise<any> {
    this.logger.log(`[Analytics] Fetching dashboard for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        metrics: true,
        budgetAllocations: true,
        workflows: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get channel metrics
    const channelMetrics = await this.getChannelMetrics(campaignId);

    // Get ROI analysis
    const roiAnalysis = await this.analyzeROI(campaignId);

    // Get performance trends
    const trends = await this.getPerformanceTrends(campaignId, 30);

    // Get comparative metrics
    const comparison = await this.getChannelComparison(campaignId);

    // Calculate key metrics
    const keyMetrics = this.calculateKeyMetrics(campaign, channelMetrics, roiAnalysis);

    return {
      campaignId,
      campaign: {
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        platforms: campaign.platforms,
        totalBudget: campaign.totalBudget,
      },
      keyMetrics,
      channelMetrics,
      roiAnalysis,
      comparison,
      trends,
      generatedAt: new Date(),
    };
  }

  /**
   * Get channel-specific metrics
   */
  async getChannelMetrics(campaignId: string): Promise<any> {
    this.logger.log(`[Analytics] Fetching channel metrics for campaign: ${campaignId}`);

    const metrics = await this.prisma.campaignMetric.findMany({
      where: { campaignId },
      orderBy: { date: 'desc' },
    });

    if (metrics.length === 0) {
      return {
        email: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
        social: { impressions: 0, engagements: 0, reach: 0, spend: 0 },
        ads: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
      };
    }

    // Aggregate metrics by channel
    const channelAggregation: Record<string, any> = {
      email: { impressions: 0, clicks: 0, conversions: 0, spend: 0, clickRate: 0, conversionRate: 0 },
      social: { impressions: 0, engagements: 0, reach: 0, spend: 0, engagementRate: 0 },
      ads: { impressions: 0, clicks: 0, conversions: 0, spend: 0, clickRate: 0, conversionRate: 0 },
    };

    metrics.forEach((metric) => {
      const channel = metric.channel.toLowerCase();
      if (channelAggregation[channel]) {
        channelAggregation[channel].impressions += metric.impressions || 0;
        channelAggregation[channel].clicks += metric.clicks || 0;
        channelAggregation[channel].conversions += metric.conversions || 0;
        channelAggregation[channel].spend += metric.spend || 0;
        channelAggregation[channel].engagements += metric.engagements || 0;
        channelAggregation[channel].reach += metric.reach || 0;
      }
    });

    // Calculate derived metrics
    Object.keys(channelAggregation).forEach((channel) => {
      const data = channelAggregation[channel];
      if (data.impressions > 0) {
        data.clickRate = ((data.clicks / data.impressions) * 100).toFixed(2);
        data.conversionRate = ((data.conversions / data.impressions) * 100).toFixed(2);
        data.engagementRate = ((data.engagements / data.impressions) * 100).toFixed(2);
      }
      data.costPerClick = data.clicks > 0 ? (data.spend / data.clicks).toFixed(2) : 0;
      data.costPerConversion = data.conversions > 0 ? (data.spend / data.conversions).toFixed(2) : 0;
    });

    return channelAggregation;
  }

  /**
   * Analyze ROI across channels
   */
  async analyzeROI(campaignId: string): Promise<any> {
    this.logger.log(`[Analytics] Analyzing ROI for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { budgetAllocations: true },
    });

    const metrics = await this.prisma.campaignMetric.findMany({
      where: { campaignId },
    });

    if (!campaign || metrics.length === 0) {
      return {
        totalSpend: campaign?.totalBudget || 0,
        estimatedRevenue: 0,
        roi: 0,
        roiPercentage: '0%',
        byChannel: {},
      };
    }

    // Calculate channel-wise ROI
    const byChannel: Record<string, any> = {};
    const channels = ['EMAIL', 'SOCIAL', 'ADS'];

    channels.forEach((channel) => {
      const channelMetrics = metrics.filter((m) => m.channel === channel);
      const spend = channelMetrics.reduce((sum, m) => sum + (m.spend || 0), 0);
      const conversions = channelMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);

      // Estimate revenue (assuming average order value of $100)
      const estimatedRevenue = conversions * 100;
      const roi = estimatedRevenue - spend;
      const roiPercentage = spend > 0 ? ((roi / spend) * 100).toFixed(2) : '0';

      byChannel[channel.toLowerCase()] = {
        spend,
        conversions,
        estimatedRevenue,
        roi,
        roiPercentage: `${roiPercentage}%`,
      };
    });

    const totalSpend = Object.values(byChannel).reduce((sum: number, c: any) => sum + c.spend, 0);
    const totalEstimatedRevenue = Object.values(byChannel).reduce((sum: number, c: any) => sum + c.estimatedRevenue, 0);
    const totalROI = totalEstimatedRevenue - totalSpend;
    const totalROIPercentage = totalSpend > 0 ? ((totalROI / totalSpend) * 100).toFixed(2) : '0';

    return {
      totalSpend,
      totalEstimatedRevenue,
      totalROI,
      totalROIPercentage: `${totalROIPercentage}%`,
      byChannel,
    };
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(campaignId: string, days: number = 30): Promise<any> {
    this.logger.log(`[Analytics] Fetching performance trends for campaign: ${campaignId}`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.prisma.campaignMetric.findMany({
      where: {
        campaignId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    if (metrics.length === 0) {
      return {
        period: `Last ${days} days`,
        data: [],
      };
    }

    // Group metrics by date
    const trendData: Record<string, any> = {};

    metrics.forEach((metric) => {
      const dateStr = metric.date.toISOString().split('T')[0];
      if (!trendData[dateStr]) {
        trendData[dateStr] = {
          date: dateStr,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          engagement: 0,
        };
      }
      trendData[dateStr].impressions += metric.impressions || 0;
      trendData[dateStr].clicks += metric.clicks || 0;
      trendData[dateStr].conversions += metric.conversions || 0;
      trendData[dateStr].spend += metric.spend || 0;
      trendData[dateStr].engagement += metric.engagements || 0;
    });

    return {
      period: `Last ${days} days`,
      data: Object.values(trendData),
      summary: {
        averageImpressions: (Object.values(trendData).reduce((sum: number, d: any) => sum + d.impressions, 0) / Object.keys(trendData).length).toFixed(0),
        averageClicks: (Object.values(trendData).reduce((sum: number, d: any) => sum + d.clicks, 0) / Object.keys(trendData).length).toFixed(0),
        totalConversions: Object.values(trendData).reduce((sum: number, d: any) => sum + d.conversions, 0),
      },
    };
  }

  /**
   * Compare performance across channels
   */
  async getChannelComparison(campaignId: string): Promise<any> {
    this.logger.log(`[Analytics] Comparing channels for campaign: ${campaignId}`);

    const metrics = await this.prisma.campaignMetric.findMany({
      where: { campaignId },
    });

    if (metrics.length === 0) {
      return {
        bestPerformingChannel: 'N/A',
        worstPerformingChannel: 'N/A',
        comparison: {},
      };
    }

    const channels: Record<string, any> = {};

    metrics.forEach((metric) => {
      const channel = metric.channel;
      if (!channels[channel]) {
        channels[channel] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          engagement: 0,
        };
      }
      channels[channel].impressions += metric.impressions || 0;
      channels[channel].clicks += metric.clicks || 0;
      channels[channel].conversions += metric.conversions || 0;
      channels[channel].spend += metric.spend || 0;
      channels[channel].engagement += metric.engagements || 0;
    });

    // Calculate performance scores
    const scores: Record<string, number> = {};
    Object.keys(channels).forEach((channel) => {
      const data = channels[channel];
      let score = 0;
      if (data.impressions > 0) score += data.clicks / data.impressions;
      if (data.spend > 0) score += data.conversions / data.spend;
      if (data.impressions > 0) score += data.engagement / data.impressions;
      scores[channel] = score;
    });

    const bestChannel = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
    const worstChannel = Object.keys(scores).reduce((a, b) => (scores[a] < scores[b] ? a : b));

    return {
      bestPerformingChannel: bestChannel,
      worstPerformingChannel: worstChannel,
      performanceScores: scores,
      comparison: channels,
    };
  }

  /**
   * Calculate key performance indicators
   */
  private calculateKeyMetrics(campaign: any, channelMetrics: any, roiAnalysis: any): any {
    return {
      totalImpressions: Object.values(channelMetrics).reduce((sum: number, c: any) => sum + (c.impressions || 0), 0),
      totalClicks: Object.values(channelMetrics).reduce((sum: number, c: any) => sum + (c.clicks || 0), 0),
      totalConversions: Object.values(channelMetrics).reduce((sum: number, c: any) => sum + (c.conversions || 0), 0),
      totalEngagements: Object.values(channelMetrics).reduce((sum: number, c: any) => sum + (c.engagements || 0), 0),
      totalSpend: roiAnalysis.totalSpend,
      roi: roiAnalysis.totalROI,
      roiPercentage: roiAnalysis.totalROIPercentage,
      averageCPC: (roiAnalysis.totalSpend / (Object.values(channelMetrics).reduce((sum: number, c: any) => sum + (c.clicks || 0), 0) || 1)).toFixed(2),
      status: campaign.status,
      progress: this.calculateCampaignProgress(campaign),
    };
  }

  /**
   * Calculate campaign progress percentage
   */
  private calculateCampaignProgress(campaign: any): number {
    if (campaign.status === 'COMPLETED') return 100;
    if (campaign.status === 'ACTIVE') return 60;
    if (campaign.status === 'LAUNCHED') return 40;
    if (campaign.status === 'DRAFT') return 10;
    if (campaign.status === 'PAUSED') return 50;
    return 0;
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(
    campaignId: string,
    reportType: 'summary' | 'detailed' | 'executive',
    filters?: {
      startDate?: Date;
      endDate?: Date;
      channels?: string[];
    },
  ): Promise<any> {
    this.logger.log(`[Analytics] Generating ${reportType} report for campaign: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let metrics = await this.prisma.campaignMetric.findMany({
      where: { campaignId },
    });

    // Apply filters
    if (filters?.startDate || filters?.endDate) {
      metrics = metrics.filter((m) => {
        if (filters.startDate && m.date < filters.startDate) return false;
        if (filters.endDate && m.date > filters.endDate) return false;
        return true;
      });
    }

    if (filters?.channels && filters.channels.length > 0) {
      metrics = metrics.filter((m) => filters.channels!.includes(m.channel));
    }

    const roiAnalysis = await this.analyzeROI(campaignId);
    const channelMetrics = await this.getChannelMetrics(campaignId);

    switch (reportType) {
      case 'summary':
        return this.generateSummaryReport(campaign, metrics, roiAnalysis, channelMetrics);
      case 'detailed':
        return this.generateDetailedReport(campaign, metrics, roiAnalysis, channelMetrics);
      case 'executive':
        return this.generateExecutiveReport(campaign, metrics, roiAnalysis, channelMetrics);
      default:
        return this.generateSummaryReport(campaign, metrics, roiAnalysis, channelMetrics);
    }
  }

  /**
   * Generate summary report
   */
  private generateSummaryReport(campaign: any, metrics: any[], roiAnalysis: any, channelMetrics: any): any {
    return {
      type: 'summary',
      title: `${campaign.name} - Summary Report`,
      generatedAt: new Date(),
      campaign: {
        name: campaign.name,
        status: campaign.status,
        duration: `${campaign.startDate.toLocaleDateString()} - ${campaign.endDate?.toLocaleDateString() || 'Ongoing'}`,
      },
      keyMetrics: {
        totalImpressions: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
        totalClicks: metrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
        totalConversions: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
      },
      roi: {
        totalSpend: roiAnalysis.totalSpend,
        estimatedRevenue: roiAnalysis.totalEstimatedRevenue,
        roi: roiAnalysis.totalROI,
        roiPercentage: roiAnalysis.totalROIPercentage,
      },
      channels: channelMetrics,
    };
  }

  /**
   * Generate detailed report
   */
  private generateDetailedReport(campaign: any, metrics: any[], roiAnalysis: any, channelMetrics: any): any {
    const summary = this.generateSummaryReport(campaign, metrics, roiAnalysis, channelMetrics);

    return {
      ...summary,
      type: 'detailed',
      timeSeriesData: this.aggregateMetricsByDate(metrics),
      channelBreakdown: this.getDetailedChannelBreakdown(metrics),
      topPerformingDays: this.getTopPerformingDays(metrics, 5),
      recommendations: this.generateRecommendations(roiAnalysis, channelMetrics),
    };
  }

  /**
   * Generate executive report
   */
  private generateExecutiveReport(campaign: any, metrics: any[], roiAnalysis: any, channelMetrics: any): any {
    const summary = this.generateSummaryReport(campaign, metrics, roiAnalysis, channelMetrics);

    return {
      ...summary,
      type: 'executive',
      executiveSummary: this.generateExecutiveSummary(campaign, roiAnalysis, channelMetrics),
      keyInsights: this.generateKeyInsights(metrics, roiAnalysis),
      nextSteps: this.generateNextSteps(campaign, roiAnalysis, channelMetrics),
    };
  }

  /**
   * Aggregate metrics by date
   */
  private aggregateMetricsByDate(metrics: any[]): any[] {
    const dateAggregation: Record<string, any> = {};

    metrics.forEach((metric) => {
      const dateStr = metric.date.toISOString().split('T')[0];
      if (!dateAggregation[dateStr]) {
        dateAggregation[dateStr] = {
          date: dateStr,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
        };
      }
      dateAggregation[dateStr].impressions += metric.impressions || 0;
      dateAggregation[dateStr].clicks += metric.clicks || 0;
      dateAggregation[dateStr].conversions += metric.conversions || 0;
      dateAggregation[dateStr].spend += metric.spend || 0;
    });

    return Object.values(dateAggregation);
  }

  /**
   * Get detailed channel breakdown
   */
  private getDetailedChannelBreakdown(metrics: any[]): any {
    const breakdown: Record<string, any> = {};

    metrics.forEach((metric) => {
      const channel = metric.channel;
      if (!breakdown[channel]) {
        breakdown[channel] = {
          channel,
          metrics: [],
        };
      }
      breakdown[channel].metrics.push({
        date: metric.date,
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        spend: metric.spend,
      });
    });

    return breakdown;
  }

  /**
   * Get top performing days
   */
  private getTopPerformingDays(metrics: any[], limit: number = 5): any[] {
    const dailyData = this.aggregateMetricsByDate(metrics);
    return dailyData
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, limit)
      .map((day) => ({
        date: day.date,
        conversions: day.conversions,
        revenue: day.conversions * 100, // Assuming $100 per conversion
      }));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(roiAnalysis: any, channelMetrics: any): string[] {
    const recommendations: string[] = [];

    // Get best performing channel
    const channels = Object.keys(roiAnalysis.byChannel);
    if (channels.length > 0) {
      const bestChannel = channels.reduce((a, b) =>
        parseFloat(roiAnalysis.byChannel[a].roiPercentage) > parseFloat(roiAnalysis.byChannel[b].roiPercentage) ? a : b,
      );
      recommendations.push(`Allocate more budget to ${bestChannel.toUpperCase()} as it has the highest ROI`);
    }

    // Performance threshold
    const totalROI = roiAnalysis.totalROI;
    if (totalROI > 0) {
      recommendations.push('Campaign is performing well with positive ROI, continue current strategy');
    } else {
      recommendations.push('Consider revising campaign strategy as ROI is negative');
    }

    recommendations.push('A/B test different audience segments to improve conversion rates');
    recommendations.push('Optimize underperforming channels to match top performer metrics');

    return recommendations;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(campaign: any, roiAnalysis: any, channelMetrics: any): string {
    const roi = roiAnalysis.totalROIPercentage;
    return `Campaign "${campaign.name}" achieved ${roi} ROI across ${Object.keys(roiAnalysis.byChannel).length} channels with ${roiAnalysis.totalEstimatedRevenue} in estimated revenue from ${roiAnalysis.totalSpend} spend.`;
  }

  /**
   * Generate key insights
   */
  private generateKeyInsights(metrics: any[], roiAnalysis: any): string[] {
    return [
      `Total metric records analyzed: ${metrics.length}`,
      `Overall ROI performance: ${roiAnalysis.totalROIPercentage}`,
      `Estimated revenue generated: ${roiAnalysis.totalEstimatedRevenue}`,
      `Total spend across all channels: ${roiAnalysis.totalSpend}`,
    ];
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(campaign: any, roiAnalysis: any, channelMetrics: any): string[] {
    return [
      'Review channel performance and reallocate budget accordingly',
      'Conduct audience segmentation to improve targeting',
      'Implement A/B testing for content optimization',
      'Monitor campaign daily for performance changes',
      'Schedule follow-up analysis in 2 weeks',
    ];
  }

  /**
   * Export report as data structure (for CSV/PDF conversion)
   */
  async exportReport(
    campaignId: string,
    reportType: string = 'summary',
    format: 'csv' | 'json' = 'json',
  ): Promise<any> {
    this.logger.log(`[Analytics] Exporting report as ${format} for campaign: ${campaignId}`);

    const report = await this.generateCustomReport(campaignId, reportType as any);

    if (format === 'csv') {
      return this.convertToCSV(report);
    }

    return report;
  }

  /**
   * Convert report to CSV format
   */
  private convertToCSV(report: any): string {
    // Simple CSV conversion for key metrics
    let csv = 'Campaign Performance Report\n\n';
    csv += `Campaign,${report.campaign.name}\n`;
    csv += `Status,${report.campaign.status}\n`;
    csv += `Generated,${new Date().toISOString()}\n\n`;

    if (report.keyMetrics) {
      csv += 'Key Metrics\n';
      csv += `Total Impressions,${report.keyMetrics.totalImpressions}\n`;
      csv += `Total Clicks,${report.keyMetrics.totalClicks}\n`;
      csv += `Total Conversions,${report.keyMetrics.totalConversions}\n`;
      csv += `\n`;
    }

    if (report.roi) {
      csv += 'ROI Analysis\n';
      csv += `Total Spend,${report.roi.totalSpend}\n`;
      csv += `Estimated Revenue,${report.roi.estimatedRevenue}\n`;
      csv += `ROI,${report.roi.roi}\n`;
      csv += `ROI %,${report.roi.roiPercentage}\n`;
    }

    return csv;
  }

  /**
   * Get all campaigns analytics summary
   */
  async getAllCampaignsAnalyticsSummary(): Promise<any> {
    this.logger.log('[Analytics] Fetching all campaigns analytics summary');

    const campaigns = await this.prisma.campaign.findMany({
      include: { metrics: true },
    });

    const summary = await Promise.all(
      campaigns.map(async (campaign) => {
        const roiAnalysis = await this.analyzeROI(campaign.id);
        return {
          campaignId: campaign.id,
          name: campaign.name,
          status: campaign.status,
          type: campaign.type,
          totalSpend: roiAnalysis.totalSpend,
          roi: roiAnalysis.totalROI,
          roiPercentage: roiAnalysis.totalROIPercentage,
          metricsCount: campaign.metrics.length,
        };
      }),
    );

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'LAUNCHED').length,
      completedCampaigns: campaigns.filter((c) => c.status === 'COMPLETED').length,
      campaigns: summary,
    };
  }
}
