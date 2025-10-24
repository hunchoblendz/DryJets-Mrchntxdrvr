import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  LaunchCampaignDto,
  OptimizeCampaignDto,
  PauseCampaignDto,
  CampaignChannel,
} from '../dto/launch-campaign.dto';

/**
 * CampaignOrchestrationService
 *
 * Manages campaign lifecycle: strategy, coordination, execution, and optimization
 * Implements the Ava agent's core orchestration logic
 */
@Injectable()
export class CampaignOrchestrationService {
  private logger = new Logger('CampaignOrchestrationService');

  constructor(private prisma: PrismaService) {}

  /**
   * Launch a campaign with multi-channel coordination
   * - Allocates budget across channels
   * - Creates workflow steps
   * - Schedules content publishing
   * - Coordinates across all channels
   */
  async launchCampaign(
    campaignId: string,
    launchDto: LaunchCampaignDto,
  ): Promise<any> {
    this.logger.log(`[Ava] Launching campaign: ${campaignId}`);

    // Fetch campaign
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignContents: true,
        budgetAllocations: true,
        campaignWorkflows: true,
      },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    if (campaign.status === 'ACTIVE') {
      throw new BadRequestException('Campaign is already active');
    }

    // Validate campaign readiness
    const readinessCheck = await this.checkCampaignReadiness(campaign);
    if (!readinessCheck.ready) {
      throw new BadRequestException(
        `Campaign not ready: ${readinessCheck.issues.join(', ')}`,
      );
    }

    // Allocate budget across channels
    await this.allocateBudget(
      campaignId,
      campaign.budgetTotal,
      launchDto.channelAllocations,
    );

    // Create workflow steps
    const workflows = await this.createCampaignWorkflows(campaignId);

    // Update campaign status
    const launchedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        budgetAllocations: true,
        campaignWorkflows: true,
      },
    });

    this.logger.log(
      `[Ava] Campaign launched: ${campaignId} with ${workflows.length} workflow steps`,
    );

    return {
      campaign: launchedCampaign,
      workflowsCreated: workflows.length,
      budgetAllocated: campaign.budgetTotal,
      message: 'Campaign successfully launched',
    };
  }

  /**
   * Check if campaign is ready for launch
   */
  async checkCampaignReadiness(campaign: any): Promise<{
    ready: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check budget
    if (!campaign.budgetTotal || campaign.budgetTotal <= 0) {
      issues.push('No budget allocated');
    }

    // Check content
    if (!campaign.campaignContents || campaign.campaignContents.length === 0) {
      issues.push('No campaign content created');
    }

    // Check platforms
    if (!campaign.platforms || (campaign.platforms as any[]).length === 0) {
      issues.push('No platforms selected');
    }

    return {
      ready: issues.length === 0,
      issues,
    };
  }

  /**
   * Allocate budget across channels
   * Uses AI-powered optimization if enabled
   */
  async allocateBudget(
    campaignId: string,
    totalBudget: number,
    allocations?: any[],
  ): Promise<any[]> {
    if (allocations && allocations.length > 0) {
      // Use provided allocations
      const budgetAllocations = await Promise.all(
        allocations.map((alloc) =>
          this.prisma.budgetAllocation.upsert({
            where: {
              campaignId_channel: {
                campaignId,
                channel: alloc.channel,
              },
            },
            update: {
              allocatedBudget: alloc.allocation,
              updatedAt: new Date(),
            },
            create: {
              campaignId,
              channel: alloc.channel,
              allocatedBudget: alloc.allocation,
            },
          }),
        ),
      );

      return budgetAllocations;
    }

    // Default allocation: Equal split across channels
    const channels = [CampaignChannel.EMAIL, CampaignChannel.SOCIAL];
    const allocPerChannel = totalBudget / channels.length;

    const budgetAllocations = await Promise.all(
      channels.map((channel) =>
        this.prisma.budgetAllocation.upsert({
          where: {
            campaignId_channel: {
              campaignId,
              channel,
            },
          },
          update: {
            allocatedBudget: allocPerChannel,
            updatedAt: new Date(),
          },
          create: {
            campaignId,
            channel,
            allocatedBudget: allocPerChannel,
          },
        }),
      ),
    );

    return budgetAllocations;
  }

  /**
   * Create workflow steps for campaign execution
   * Defines the sequence of actions: design, schedule, publish, analyze
   */
  async createCampaignWorkflows(campaignId: string): Promise<any[]> {
    const steps = [
      { step: 1, action: 'VALIDATE', description: 'Validate campaign content' },
      {
        step: 2,
        action: 'SCHEDULE',
        description: 'Schedule content publishing',
      },
      { step: 3, action: 'PUBLISH', description: 'Publish to channels' },
      { step: 4, action: 'MONITOR', description: 'Monitor performance' },
    ];

    const workflows = await Promise.all(
      steps.map((s) =>
        this.prisma.campaignWorkflow.create({
          data: {
            campaignId,
            step: s.step,
            action: s.action,
            status: 'PENDING',
            metadata: { description: s.description },
          },
        }),
      ),
    );

    return workflows;
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(
    campaignId: string,
    pauseDto: PauseCampaignDto,
  ): Promise<any> {
    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'PAUSED',
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `[Ava] Campaign paused: ${campaignId} - Reason: ${pauseDto.reason || 'None'}`,
    );

    return campaign;
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`[Ava] Campaign resumed: ${campaignId}`);

    return campaign;
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<any> {
    const metrics = await this.prisma.campaignMetric.findMany({
      where: { campaignId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Calculate aggregates
    const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalConversions = metrics.reduce(
      (sum, m) => sum + m.conversions,
      0,
    );
    const totalSpend = metrics.reduce((sum, m) => {
      const spend = parseFloat(m.spend?.toString() || '0');
      return sum + spend;
    }, 0);
    const totalRevenue = metrics.reduce((sum, m) => {
      const revenue = parseFloat(m.revenue?.toString() || '0');
      return sum + revenue;
    }, 0);

    return {
      metrics,
      aggregates: {
        totalImpressions,
        totalClicks,
        totalConversions,
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate:
          totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      },
    };
  }

  /**
   * Optimize campaign budget allocation based on performance
   */
  async optimizeCampaign(
    campaignId: string,
    optimizeDto: OptimizeCampaignDto,
  ): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { budgetAllocations: true },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    // Get current performance metrics
    const metrics = await this.getCampaignMetrics(campaignId);
    const { aggregates } = metrics;

    // Simple optimization logic: increase budget to best performing channels
    const recommendations = [];

    for (const allocation of campaign.budgetAllocations) {
      const channelMetrics = metrics.metrics.filter(
        (m) => m.channel === allocation.channel,
      );

      if (channelMetrics.length > 0) {
        const channelROI =
          aggregates.totalSpend > 0
            ? ((aggregates.totalRevenue - aggregates.totalSpend) /
                aggregates.totalSpend) *
              100
            : 0;

        recommendations.push({
          channel: allocation.channel,
          currentBudget: allocation.allocatedBudget,
          recommendedBudget:
            channelROI > (optimizeDto.targetROI || 100)
              ? allocation.allocatedBudget * 1.2
              : allocation.allocatedBudget * 0.9,
          reason: `Channel ROI: ${channelROI.toFixed(2)}%`,
        });
      }
    }

    return {
      campaignId,
      currentMetrics: aggregates,
      recommendations,
      suggestion: 'Review recommendations and apply to budget allocations',
    };
  }

  /**
   * Complete a campaign
   */
  async completeCampaign(campaignId: string): Promise<any> {
    // Finalize all workflows
    await this.prisma.campaignWorkflow.updateMany({
      where: { campaignId, status: 'RUNNING' },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update campaign status
    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`[Ava] Campaign completed: ${campaignId}`);

    return campaign;
  }

  /**
   * Get campaign execution status
   */
  async getCampaignStatus(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignWorkflows: true,
        budgetAllocations: true,
        campaignMetrics: { take: 5, orderBy: { date: 'desc' } },
      },
    });

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    // Calculate workflow progress
    const totalSteps = campaign.campaignWorkflows.length;
    const completedSteps = campaign.campaignWorkflows.filter(
      (w) => w.status === 'COMPLETED',
    ).length;
    const progress =
      totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
        budget: campaign.budgetTotal,
      },
      workflow: {
        totalSteps,
        completedSteps,
        progress: parseFloat(progress.toFixed(2)),
        nextStep:
          campaign.campaignWorkflows.find((w) => w.status === 'PENDING')
            ?.action || 'All steps completed',
      },
      budgetAllocations: campaign.budgetAllocations,
      recentMetrics: campaign.campaignMetrics,
    };
  }
}
