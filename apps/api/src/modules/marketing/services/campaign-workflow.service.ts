import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * CampaignWorkflowService
 *
 * Manages campaign workflow execution
 * Handles step progression, error recovery, and completion
 */
@Injectable()
export class CampaignWorkflowService {
  private logger = new Logger('CampaignWorkflowService');

  constructor(private prisma: PrismaService) {}

  /**
   * Execute next pending workflow step
   */
  async executeNextStep(campaignId: string): Promise<any> {
    this.logger.log(`[Workflow] Executing next step for campaign: ${campaignId}`);

    // Get next pending step
    const nextStep = await this.prisma.campaignWorkflow.findFirst({
      where: {
        campaignId,
        status: 'PENDING',
      },
      orderBy: { step: 'asc' },
    });

    if (!nextStep) {
      this.logger.log(`[Workflow] No pending steps for campaign: ${campaignId}`);
      return { message: 'All workflow steps completed' };
    }

    // Mark as running
    await this.prisma.campaignWorkflow.update({
      where: { id: nextStep.id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      // Execute based on action type
      const result = await this.executeAction(nextStep.action, campaignId, nextStep.metadata);

      // Mark as completed
      await this.prisma.campaignWorkflow.update({
        where: { id: nextStep.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: result,
        },
      });

      this.logger.log(`[Workflow] Step completed: ${nextStep.action}`);

      return {
        stepNumber: nextStep.step,
        action: nextStep.action,
        status: 'COMPLETED',
        result,
      };
    } catch (error) {
      // Mark as failed
      await this.prisma.campaignWorkflow.update({
        where: { id: nextStep.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      this.logger.error(`[Workflow] Step failed: ${nextStep.action}`, error.message);

      return {
        stepNumber: nextStep.step,
        action: nextStep.action,
        status: 'FAILED',
        error: error.message,
      };
    }
  }

  /**
   * Execute workflow action
   */
  private async executeAction(
    action: string,
    campaignId: string,
    metadata: any,
  ): Promise<any> {
    switch (action) {
      case 'VALIDATE':
        return this.validateCampaignContent(campaignId);

      case 'SCHEDULE':
        return this.scheduleCampaignContent(campaignId);

      case 'PUBLISH':
        return this.publishCampaignContent(campaignId);

      case 'MONITOR':
        return this.monitorCampaignPerformance(campaignId);

      default:
        throw new Error(`Unknown workflow action: ${action}`);
    }
  }

  /**
   * Validate campaign content
   */
  private async validateCampaignContent(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignContents: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const validation = {
      totalContent: campaign.campaignContents.length,
      validContent: 0,
      invalidContent: 0,
      issues: [] as string[],
    };

    for (const content of campaign.campaignContents) {
      if (this.validateContent(content)) {
        validation.validContent++;
      } else {
        validation.invalidContent++;
        validation.issues.push(`Invalid content for channel: ${content.channel}`);
      }
    }

    if (validation.invalidContent > 0) {
      throw new Error(`Content validation failed: ${validation.issues.join(', ')}`);
    }

    return validation;
  }

  /**
   * Validate individual content
   */
  private validateContent(content: any): boolean {
    // Basic validation
    if (!content.channel) return false;
    if (!content.content) return false;

    // Channel-specific validation
    if (content.channel === 'EMAIL') {
      const emailContent = content.content as any;
      return !!emailContent.subject && !!emailContent.html;
    }

    if (content.channel === 'SOCIAL') {
      const socialContent = content.content as any;
      return !!socialContent.content;
    }

    return true;
  }

  /**
   * Schedule campaign content
   */
  private async scheduleCampaignContent(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignContents: true, socialQueue: true, emailCampaigns: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const scheduling = {
      campaignId,
      scheduledAt: new Date(),
      socialPostsScheduled: 0,
      emailsScheduled: 0,
      totalScheduled: 0,
    };

    // Schedule social content
    const socialContent = campaign.campaignContents.filter((c) => c.channel === 'SOCIAL');
    if (socialContent.length > 0) {
      // Social content is already queued by multi-channel coordinator
      scheduling.socialPostsScheduled = campaign.socialQueue.length;
    }

    // Schedule email content
    const emailContent = campaign.campaignContents.filter((c) => c.channel === 'EMAIL');
    if (emailContent.length > 0) {
      // Email campaigns are already created
      scheduling.emailsScheduled = campaign.emailCampaigns.filter(
        (e) => e.status === 'SCHEDULED',
      ).length;
    }

    scheduling.totalScheduled = scheduling.socialPostsScheduled + scheduling.emailsScheduled;

    return scheduling;
  }

  /**
   * Publish campaign content
   */
  private async publishCampaignContent(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { socialQueue: true, emailCampaigns: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const publishing = {
      campaignId,
      publishedAt: new Date(),
      socialPostsPublished: 0,
      emailsSent: 0,
      totalPublished: 0,
    };

    // In a real implementation, this would:
    // 1. Call social media APIs to schedule posts
    // 2. Call email service to queue sends
    // For now, we just mark them as published

    // Mark social posts as published
    const publishedSocial = await this.prisma.socialQueue.updateMany({
      where: { campaignId, status: 'QUEUED' },
      data: {
        status: 'PUBLISHED',
        publishedTime: new Date(),
      },
    });

    publishing.socialPostsPublished = publishedSocial.count;

    // Mark emails as sent
    const sentEmails = await this.prisma.emailCampaign.updateMany({
      where: { campaignId, status: 'SCHEDULED' },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    publishing.emailsSent = sentEmails.count;
    publishing.totalPublished = publishing.socialPostsPublished + publishing.emailsSent;

    return publishing;
  }

  /**
   * Monitor campaign performance
   */
  private async monitorCampaignPerformance(campaignId: string): Promise<any> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignMetrics: { orderBy: { date: 'desc' }, take: 10 },
        socialQueue: { where: { status: 'PUBLISHED' } },
        emailCampaigns: { where: { status: 'SENT' } },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Calculate metrics
    const totalImpressions = campaign.campaignMetrics.reduce(
      (sum, m) => sum + m.impressions,
      0,
    );
    const totalClicks = campaign.campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalConversions = campaign.campaignMetrics.reduce(
      (sum, m) => sum + m.conversions,
      0,
    );

    return {
      campaignId,
      monitoringStarted: new Date(),
      socialPostsMonitored: campaign.socialQueue.length,
      emailsMonitored: campaign.emailCampaigns.length,
      metrics: {
        totalImpressions,
        totalClicks,
        totalConversions,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      },
    };
  }

  /**
   * Get workflow status for a campaign
   */
  async getWorkflowStatus(campaignId: string): Promise<any> {
    const workflows = await this.prisma.campaignWorkflow.findMany({
      where: { campaignId },
      orderBy: { step: 'asc' },
    });

    const totalSteps = workflows.length;
    const completedSteps = workflows.filter((w) => w.status === 'COMPLETED').length;
    const failedSteps = workflows.filter((w) => w.status === 'FAILED').length;
    const runningSteps = workflows.filter((w) => w.status === 'RUNNING').length;
    const pendingSteps = workflows.filter((w) => w.status === 'PENDING').length;

    return {
      campaignId,
      totalSteps,
      progress: {
        completed: completedSteps,
        running: runningSteps,
        pending: pendingSteps,
        failed: failedSteps,
      },
      progressPercentage: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      workflows,
      nextStep: workflows.find((w) => w.status === 'PENDING'),
      status: failedSteps > 0 ? 'FAILED' : completedSteps === totalSteps ? 'COMPLETED' : 'IN_PROGRESS',
    };
  }

  /**
   * Retry failed workflow step
   */
  async retryFailedStep(campaignId: string, stepNumber: number): Promise<any> {
    const workflow = await this.prisma.campaignWorkflow.findFirst({
      where: {
        campaignId,
        step: stepNumber,
        status: 'FAILED',
      },
    });

    if (!workflow) {
      throw new Error('Failed workflow step not found');
    }

    // Reset to pending
    await this.prisma.campaignWorkflow.update({
      where: { id: workflow.id },
      data: {
        status: 'PENDING',
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      },
    });

    this.logger.log(`[Workflow] Retrying step: ${workflow.action}`);

    return { message: 'Step retry scheduled', step: stepNumber, action: workflow.action };
  }
}
