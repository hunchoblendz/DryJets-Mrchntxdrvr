import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * BudgetOptimizerService
 *
 * Manages budget allocation and optimization
 * Uses performance data to dynamically adjust spending across channels
 */
@Injectable()
export class BudgetOptimizerService {
  private logger = new Logger('BudgetOptimizerService');

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze budget efficiency across channels
   */
  async analyzeBudgetEfficiency(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        budgetAllocations: true,
        campaignMetrics: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const efficiency: Record<string, any> = {};

    for (const allocation of campaign.budgetAllocations) {
      const channelMetrics = campaign.campaignMetrics.filter(
        (m) => m.channel === allocation.channel,
      );

      const totalSpend = parseFloat(allocation.spent.toString());
      const totalRevenue = channelMetrics.reduce((sum, m) => {
        const revenue = parseFloat(m.revenue?.toString() || '0');
        return sum + revenue;
      }, 0);

      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
      const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

      const totalImpressions = channelMetrics.reduce((sum, m) => sum + m.impressions, 0);
      const totalClicks = channelMetrics.reduce((sum, m) => sum + m.clicks, 0);
      const totalConversions = channelMetrics.reduce((sum, m) => sum + m.conversions, 0);

      efficiency[allocation.channel] = {
        allocated: allocation.allocatedBudget,
        spent: totalSpend,
        revenue: totalRevenue,
        roi,
        roas,
        cpc:
          totalClicks > 0
            ? parseFloat((totalSpend / totalClicks).toFixed(2))
            : 0,
        cpa:
          totalConversions > 0
            ? parseFloat((totalSpend / totalConversions).toFixed(2))
            : 0,
        ctr:
          totalImpressions > 0
            ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
            : 0,
        conversionRate:
          totalClicks > 0
            ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2))
            : 0,
        efficiency: roi > 100 ? 'HIGH' : roi > 0 ? 'MEDIUM' : 'LOW',
      };
    }

    return {
      campaignId,
      analyzedAt: new Date(),
      totalBudget: campaign.budgetTotal,
      channelEfficiency: efficiency,
      topPerformingChannel: this.findTopPerformer(efficiency),
      recommendations: this.generateRecommendations(efficiency),
    };
  }

  /**
   * Find top performing channel
   */
  private findTopPerformer(efficiency: Record<string, any>): string {
    let topChannel = '';
    let topROI = -Infinity;

    for (const [channel, data] of Object.entries(efficiency)) {
      if (data.roi > topROI) {
        topROI = data.roi;
        topChannel = channel;
      }
    }

    return topChannel;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(efficiency: Record<string, any>): string[] {
    const recommendations: string[] = [];

    for (const [channel, data] of Object.entries(efficiency)) {
      const dataTyped = data as any;

      // High ROI channels
      if (dataTyped.roi > 150) {
        recommendations.push(
          `Increase budget for ${channel} - ROI is ${dataTyped.roi.toFixed(2)}%`,
        );
      }

      // Low performing channels
      if (dataTyped.roi < 0) {
        recommendations.push(
          `Review ${channel} strategy - Negative ROI of ${dataTyped.roi.toFixed(2)}%`,
        );
      }

      // High CPA channels
      if (dataTyped.cpa > 50 && dataTyped.conversionRate < 2) {
        recommendations.push(
          `${channel} has high CPA (${dataTyped.cpa.toFixed(2)}). Consider optimization or budget reduction.`,
        );
      }

      // Low CTR channels
      if (dataTyped.ctr < 0.5) {
        recommendations.push(
          `${channel} has low CTR (${dataTyped.ctr.toFixed(2)}%). Review creative and messaging.`,
        );
      }
    }

    return recommendations;
  }

  /**
   * Recommend budget reallocation
   */
  async recommendBudgetReallocation(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        budgetAllocations: true,
        campaignMetrics: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Analyze efficiency first
    const efficiency = await this.analyzeBudgetEfficiency(campaignId);
    const { channelEfficiency } = efficiency;

    // Calculate new allocations based on performance
    const newAllocations: Record<string, number> = {};
    let totalWeight = 0;

    // Use ROI as weight for new allocation
    for (const [channel, data] of Object.entries(channelEfficiency)) {
      const dataTyped = data as any;
      const roi = Math.max(dataTyped.roi, 0); // Don't use negative ROI
      const weight = 1 + roi / 100; // Convert ROI to multiplier
      newAllocations[channel] = weight;
      totalWeight += weight;
    }

    // Normalize to total budget
    const recommendations: any[] = [];
    const totalBudget = campaign.budgetTotal || 0;

    for (const allocation of campaign.budgetAllocations) {
      const weight = newAllocations[allocation.channel] || 1;
      const newBudget = (weight / totalWeight) * totalBudget;

      recommendations.push({
        channel: allocation.channel,
        currentAllocation: allocation.allocatedBudget,
        recommendedAllocation: parseFloat(newBudget.toFixed(2)),
        change: parseFloat((newBudget - allocation.allocatedBudget).toFixed(2)),
        percentChange: parseFloat(
          (((newBudget - allocation.allocatedBudget) / allocation.allocatedBudget) * 100).toFixed(
            2,
          ),
        ),
        reason: `Based on ROI performance: ${(channelEfficiency[allocation.channel] as any).roi.toFixed(2)}%`,
      });
    }

    return {
      campaignId,
      recommendedAt: new Date(),
      totalBudget,
      recommendations,
      summary: `Recommending budget reallocation to maximize ROI across ${recommendations.length} channels`,
    };
  }

  /**
   * Apply budget reallocation
   */
  async applyBudgetReallocation(
    campaignId: string,
    allocations: Array<{ channel: string; amount: number }>,
  ): Promise<any> {
    const updates = await Promise.all(
      allocations.map((alloc) =>
        this.prisma.budgetAllocation.update({
          where: {
            campaignId_channel: {
              campaignId,
              channel: alloc.channel,
            },
          },
          data: {
            allocatedBudget: alloc.amount,
            updatedAt: new Date(),
          },
        }),
      ),
    );

    this.logger.log(
      `[Budget] Applied reallocation for campaign: ${campaignId}. Updated ${updates.length} channels.`,
    );

    return {
      campaignId,
      appliedAt: new Date(),
      updatedAllocations: updates,
      message: 'Budget reallocation applied successfully',
    };
  }

  /**
   * Forecast budget ROI
   */
  async forecastROI(
    campaignId: string,
    projectionDays: number = 30,
  ): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        budgetAllocations: true,
        campaignMetrics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Calculate average daily ROI
    let totalSpend = 0;
    let totalRevenue = 0;

    campaign.campaignMetrics.forEach((metric) => {
      const spend = parseFloat(metric.spend?.toString() || '0');
      const revenue = parseFloat(metric.revenue?.toString() || '0');
      totalSpend += spend;
      totalRevenue += revenue;
    });

    const avgDailySpend = totalSpend / Math.max(campaign.campaignMetrics.length, 1);
    const avgDailyRevenue = totalRevenue / Math.max(campaign.campaignMetrics.length, 1);
    const dailyROI =
      avgDailySpend > 0 ? ((avgDailyRevenue - avgDailySpend) / avgDailySpend) * 100 : 0;

    // Project forward
    const projectedSpend = avgDailySpend * projectionDays;
    const projectedRevenue = avgDailyRevenue * projectionDays;
    const projectedROI = dailyROI;
    const projectedProfit = projectedRevenue - projectedSpend;

    return {
      campaignId,
      projection: {
        days: projectionDays,
        projectedSpend: parseFloat(projectedSpend.toFixed(2)),
        projectedRevenue: parseFloat(projectedRevenue.toFixed(2)),
        projectedProfit: parseFloat(projectedProfit.toFixed(2)),
        projectedROI: parseFloat(projectedROI.toFixed(2)),
      },
      historical: {
        totalDaysTracked: campaign.campaignMetrics.length,
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        avgDailyROI: parseFloat(dailyROI.toFixed(2)),
      },
      confidence: this.calculateConfidence(campaign.campaignMetrics.length),
    };
  }

  /**
   * Calculate forecast confidence
   */
  private calculateConfidence(dataPoints: number): string {
    if (dataPoints < 7) return 'LOW';
    if (dataPoints < 14) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Get budget status
   */
  async getBudgetStatus(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        budgetAllocations: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const status: any[] = [];
    let totalAllocated = 0;
    let totalSpent = 0;

    for (const allocation of campaign.budgetAllocations) {
      const spent = parseFloat(allocation.spent.toString());
      const allocated = parseFloat(allocation.allocatedBudget.toString());

      totalAllocated += allocated;
      totalSpent += spent;

      const roi = spent > 0 ? ((parseFloat(allocation.roi?.toString() || '0') * spent) / spent) : 0;

      status.push({
        channel: allocation.channel,
        allocated: parseFloat(allocated.toFixed(2)),
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat((allocated - spent).toFixed(2)),
        percentUsed: parseFloat(((spent / allocated) * 100).toFixed(2)),
        roi,
      });
    }

    return {
      campaignId,
      budgetSummary: {
        totalAllocated: parseFloat(totalAllocated.toFixed(2)),
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalRemaining: parseFloat((totalAllocated - totalSpent).toFixed(2)),
        percentUsed: parseFloat(((totalSpent / totalAllocated) * 100).toFixed(2)),
      },
      channels: status,
    };
  }
}
