import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * MultiChannelCoordinatorService
 *
 * Coordinates campaign execution across multiple channels (EMAIL, SOCIAL, ADS)
 * Ensures consistency while optimizing for channel-specific best practices
 */
@Injectable()
export class MultiChannelCoordinatorService {
  private logger = new Logger('MultiChannelCoordinatorService');

  constructor(private prisma: PrismaService) {}

  /**
   * Coordinate content delivery across all channels
   */
  async coordinateChannels(campaignId: string): Promise<any> {
    this.logger.log(`[Coordinator] Starting multi-channel coordination: ${campaignId}`);

    // Get campaign with all content
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignContents: true,
        budgetAllocations: true,
        socialQueue: true,
        emailCampaigns: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const coordination = {
      campaignId,
      channels: [] as any[],
      scheduledAt: new Date(),
      totalContent: campaign.campaignContents.length,
    };

    // Coordinate each channel
    for (const content of campaign.campaignContents) {
      if (content.channel === 'EMAIL') {
        coordination.channels.push(
          await this.coordinateEmailChannel(campaign, content),
        );
      } else if (content.channel === 'SOCIAL') {
        coordination.channels.push(
          await this.coordinateSocialChannel(campaign, content),
        );
      } else if (content.channel === 'ADS') {
        coordination.channels.push(
          await this.coordinateAdsChannel(campaign, content),
        );
      }
    }

    this.logger.log(
      `[Coordinator] Coordinated ${coordination.channels.length} channels`,
    );

    return coordination;
  }

  /**
   * Coordinate EMAIL channel
   * - Create email campaign
   * - Set up segmentation
   * - Schedule sending
   */
  private async coordinateEmailChannel(campaign: any, content: any): Promise<any> {
    this.logger.log(`[Email] Coordinating email channel for campaign: ${campaign.id}`);

    // Parse email-specific content
    const emailContent = content.content as any;

    // Create email campaign
    const emailCampaign = await this.prisma.emailCampaign.create({
      data: {
        campaignId: campaign.id,
        subject: emailContent.subject || `Campaign: ${campaign.name}`,
        previewText: emailContent.preview || emailContent.subject,
        htmlContent: emailContent.html || '',
        status: 'SCHEDULED',
      },
    });

    return {
      channel: 'EMAIL',
      status: 'SCHEDULED',
      entityId: emailCampaign.id,
      subject: emailCampaign.subject,
      scheduledFor: 'Next available send window',
    };
  }

  /**
   * Coordinate SOCIAL channel
   * - Create social posts for each platform
   * - Optimize timing
   * - Add to publishing queue
   */
  private async coordinateSocialChannel(
    campaign: any,
    content: any,
  ): Promise<any> {
    this.logger.log(`[Social] Coordinating social channel for campaign: ${campaign.id}`);

    const socialContent = content.content as any;
    const platforms = socialContent.platforms || ['facebook', 'instagram', 'linkedin'];

    // Calculate optimal posting times
    const postingSchedule = this.calculateOptimalPostingTimes(platforms);

    // Add to social queue for each platform
    const queuedPosts = await Promise.all(
      platforms.map((platform, index) =>
        this.prisma.socialQueue.create({
          data: {
            campaignId: campaign.id,
            platform,
            content: socialContent[platform] || socialContent.content,
            scheduledTime: postingSchedule[index],
            status: 'QUEUED',
          },
        }),
      ),
    );

    return {
      channel: 'SOCIAL',
      status: 'QUEUED',
      platformsScheduled: platforms.length,
      postsQueued: queuedPosts.length,
      firstPostAt: postingSchedule[0],
      lastPostAt: postingSchedule[postingSchedule.length - 1],
    };
  }

  /**
   * Coordinate ADS channel
   * - Create ad campaigns
   * - Set targeting
   * - Prepare for ad networks
   */
  private async coordinateAdsChannel(campaign: any, content: any): Promise<any> {
    this.logger.log(`[Ads] Coordinating ads channel for campaign: ${campaign.id}`);

    const adsContent = content.content as any;

    // Get budget allocation for ads
    const budgetAllocation = await this.prisma.budgetAllocation.findUnique({
      where: {
        campaignId_channel: {
          campaignId: campaign.id,
          channel: 'ADS',
        },
      },
    });

    return {
      channel: 'ADS',
      status: 'DRAFT',
      budgetAllocated: budgetAllocation?.allocatedBudget || 0,
      adFormats: adsContent.formats || ['display', 'search'],
      targetingOptions: campaign.targetAudience || {},
      readyForActivation: true,
    };
  }

  /**
   * Calculate optimal posting times for social platforms
   * Based on platform-specific engagement patterns
   */
  private calculateOptimalPostingTimes(platforms: string[]): Date[] {
    const now = new Date();
    const times: Date[] = [];

    const optimalHours: Record<string, number> = {
      facebook: 13, // 1 PM
      instagram: 11, // 11 AM
      linkedin: 8, // 8 AM
      twitter: 10, // 10 AM
      tiktok: 6, // 6 PM
    };

    platforms.forEach((platform, index) => {
      const postTime = new Date(now);
      const hour = optimalHours[platform.toLowerCase()] || 12;
      postTime.setHours(hour, 0, 0, 0);

      // Stagger posts by adding days if needed
      if (postTime < now) {
        postTime.setDate(postTime.getDate() + 1);
      }

      // Offset each platform by a few minutes to avoid bunching
      postTime.setMinutes(postTime.getMinutes() + index * 5);

      times.push(postTime);
    });

    return times;
  }

  /**
   * Monitor channel performance in real-time
   */
  async monitorChannelPerformance(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignMetrics: {
          where: { channel: { not: null } },
          orderBy: { date: 'desc' },
        },
        socialQueue: {
          where: { status: 'PUBLISHED' },
        },
        emailCampaigns: {
          where: { status: 'SENT' },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const channelPerformance: Record<string, any> = {
      EMAIL: {
        sent: campaign.emailCampaigns.length,
        opens: campaign.emailCampaigns.reduce((sum, e) => sum + e.opens, 0),
        clicks: campaign.emailCampaigns.reduce((sum, e) => sum + e.clicks, 0),
        conversions: campaign.emailCampaigns.reduce(
          (sum, e) => sum + e.conversions,
          0,
        ),
      },
      SOCIAL: {
        published: campaign.socialQueue.length,
        totalReach: 0,
        engagement: 0,
      },
      ADS: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    };

    // Aggregate metrics by channel
    campaign.campaignMetrics.forEach((metric) => {
      if (metric.channel && channelPerformance[metric.channel]) {
        channelPerformance[metric.channel].impressions =
          (channelPerformance[metric.channel].impressions || 0) + metric.impressions;
        channelPerformance[metric.channel].clicks =
          (channelPerformance[metric.channel].clicks || 0) + metric.clicks;
        channelPerformance[metric.channel].conversions =
          (channelPerformance[metric.channel].conversions || 0) + metric.conversions;
      }
    });

    return {
      campaignId,
      monitoredAt: new Date(),
      channels: channelPerformance,
    };
  }

  /**
   * Rebalance budget based on channel performance
   */
  async rebalanceBudget(campaignId: string): Promise<any> {
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

    const channelPerformance = new Map<string, number>();

    // Calculate ROI for each channel
    campaign.campaignMetrics.forEach((metric) => {
      const channel = metric.channel || 'UNKNOWN';
      const revenue = parseFloat(metric.revenue?.toString() || '0');
      const spend = parseFloat(metric.spend?.toString() || '0');
      const roi = spend > 0 ? (revenue - spend) / spend : 0;

      channelPerformance.set(channel, roi);
    });

    // Rebalance budget based on performance
    const totalBudget = campaign.budgetTotal || 0;
    const updates: any[] = [];

    for (const allocation of campaign.budgetAllocations) {
      const roi = channelPerformance.get(allocation.channel) || 0;
      const performanceMultiplier = 1 + roi; // Higher ROI = more budget

      const newBudget = (totalBudget / campaign.budgetAllocations.length) * performanceMultiplier;

      const updated = await this.prisma.budgetAllocation.update({
        where: {
          campaignId_channel: {
            campaignId,
            channel: allocation.channel,
          },
        },
        data: {
          recommendedAllocation: parseFloat(newBudget.toFixed(2)),
        },
      });

      updates.push(updated);
    }

    return {
      campaignId,
      rebalancedAt: new Date(),
      updatedAllocations: updates,
      message: 'Budget rebalancing recommendations generated',
    };
  }
}
