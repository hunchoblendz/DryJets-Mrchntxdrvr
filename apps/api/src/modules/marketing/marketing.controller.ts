import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Roles } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MarketingService } from './marketing.service';
import { OrchestratorService } from './ai/orchestrator.service';
import { CampaignOrchestrationService } from './services/campaign-orchestration.service';
import { MultiChannelCoordinatorService } from './services/multi-channel-coordinator.service';
import { CampaignWorkflowService } from './services/campaign-workflow.service';
import { BudgetOptimizerService } from './services/budget-optimizer.service';
import { LeoCreativeDirectorService } from './services/leo-creative-director.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { LaunchCampaignDto, PauseCampaignDto, OptimizeCampaignDto } from './dto/launch-campaign.dto';

@Controller('marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly orchestratorService: OrchestratorService,
    private readonly campaignOrchestrationService: CampaignOrchestrationService,
    private readonly multiChannelCoordinator: MultiChannelCoordinatorService,
    private readonly campaignWorkflowService: CampaignWorkflowService,
    private readonly budgetOptimizer: BudgetOptimizerService,
    private readonly leoCreativeDirector: LeoCreativeDirectorService,
  ) {}

  // ============================================
  // CAMPAIGNS
  // ============================================

  @Post('campaigns')
  @Roles('ADMIN')
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.marketingService.createCampaign(createCampaignDto);
  }

  @Get('campaigns')
  async listCampaigns(@Query('status') status?: string) {
    return this.marketingService.listCampaigns(status);
  }

  @Get('campaigns/:id')
  async getCampaign(@Param('id') id: string) {
    return this.marketingService.getCampaignById(id);
  }

  @Patch('campaigns/:id/status')
  @Roles('ADMIN')
  async updateCampaignStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateCampaignStatus(id, body.status);
  }

  // ============================================
  // BLOG POSTS
  // ============================================

  @Post('blog/generate')
  @Roles('ADMIN')
  async generateBlog(@Body() createBlogPostDto: CreateBlogPostDto) {
    // Route to Haiku orchestrator which will call Sonnet for generation
    return this.orchestratorService.routeToAgent('mira', 'GENERATE_BLOG', createBlogPostDto);
  }

  @Post('blog')
  @Roles('ADMIN')
  async createBlogPost(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.marketingService.createBlogPost(createBlogPostDto);
  }

  @Get('blog')
  async listBlogPosts(@Query('status') status?: string, @Query('take') take: number = 20) {
    return this.marketingService.listBlogPosts(status, take);
  }

  @Get('blog/:idOrSlug')
  async getBlogPost(@Param('idOrSlug') idOrSlug: string) {
    return this.marketingService.getBlogPost(idOrSlug);
  }

  @Patch('blog/:id/content')
  @Roles('ADMIN')
  async updateBlogPostContent(@Param('id') id: string, @Body() updates: CreateBlogPostDto) {
    return this.marketingService.updateBlogPostContent(id, updates);
  }

  @Patch('blog/:id/status')
  @Roles('ADMIN')
  async updateBlogPostStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateBlogPostStatus(id, body.status);
  }

  // ============================================
  // CONTENT & REPURPOSING
  // ============================================

  @Post('content/repurpose')
  @Roles('ADMIN')
  async repurposeContent(@Body() body: { blogPostId: string; platforms?: string[] }) {
    // Route to Leo creative director agent
    return this.orchestratorService.routeToAgent('leo', 'REPURPOSE_CONTENT', body);
  }

  // ============================================
  // ANALYTICS & INSIGHTS
  // ============================================

  @Get('analytics/seo/:blogPostId')
  async getSEOMetrics(@Param('blogPostId') blogPostId: string) {
    return this.marketingService.getSEOMetrics(blogPostId);
  }

  @Patch('analytics/seo/:blogPostId')
  @Roles('ADMIN')
  async updateSEOMetric(
    @Param('blogPostId') blogPostId: string,
    @Body() data: { date: string; impressions?: number; clicks?: number; ctr?: number; avgPosition?: number; keywordsRanked?: number },
  ) {
    const date = new Date(data.date);
    return this.marketingService.upsertSEOMetric(blogPostId, date, {
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.ctr,
      avgPosition: data.avgPosition,
      keywordsRanked: data.keywordsRanked,
    });
  }

  @Get('analytics/insights')
  @Roles('ADMIN')
  async getAnalyticsInsights() {
    // Route to Rin analytics agent
    return this.orchestratorService.routeToAgent('rin', 'ANALYZE_CAMPAIGNS', {});
  }

  // ============================================
  // AI AGENT LOGS
  // ============================================

  @Get('logs')
  async getAgentLogs(
    @Query('agent') agent?: string,
    @Query('action') action?: string,
    @Query('take') take: number = 50,
  ) {
    return this.marketingService.getAgentLogs(agent, action, take);
  }

  // ============================================
  // WORKFLOW MANAGEMENT
  // ============================================

  @Get('workflows')
  async listWorkflows(@Query('name') name?: string, @Query('status') status?: string) {
    return this.marketingService.getWorkflowRuns(name, status);
  }

  @Post('workflows/:name/trigger')
  @Roles('ADMIN')
  async triggerWorkflow(
    @Param('name') name: string,
    @Body() body: { triggerType?: string; data?: any },
  ) {
    const workflowRun = await this.marketingService.createWorkflowRun({
      workflowName: name,
      triggerType: body.triggerType || 'MANUAL',
    });

    // Trigger the workflow (this would be handled by n8n webhook in production)
    // For now, just return the run record
    return workflowRun;
  }

  // ============================================
  // CAMPAIGN ORCHESTRATION (Phase 3)
  // ============================================

  @Post('campaigns/:id/launch')
  @Roles('ADMIN')
  async launchCampaign(
    @Param('id') campaignId: string,
    @Body() launchDto: LaunchCampaignDto,
  ) {
    return this.campaignOrchestrationService.launchCampaign(campaignId, launchDto);
  }

  @Post('campaigns/:id/pause')
  @Roles('ADMIN')
  async pauseCampaign(@Param('id') campaignId: string, @Body() pauseDto: PauseCampaignDto) {
    return this.campaignOrchestrationService.pauseCampaign(campaignId, pauseDto);
  }

  @Post('campaigns/:id/resume')
  @Roles('ADMIN')
  async resumeCampaign(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.resumeCampaign(campaignId);
  }

  @Post('campaigns/:id/complete')
  @Roles('ADMIN')
  async completeCampaign(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.completeCampaign(campaignId);
  }

  @Get('campaigns/:id/status')
  async getCampaignStatus(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.getCampaignStatus(campaignId);
  }

  @Get('campaigns/:id/metrics')
  async getCampaignMetrics(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.getCampaignMetrics(campaignId);
  }

  // ============================================
  // MULTI-CHANNEL COORDINATION
  // ============================================

  @Post('campaigns/:id/coordinate')
  @Roles('ADMIN')
  async coordinateChannels(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.coordinateChannels(campaignId);
  }

  @Get('campaigns/:id/channel-performance')
  async getChannelPerformance(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.monitorChannelPerformance(campaignId);
  }

  @Post('campaigns/:id/rebalance-budget')
  @Roles('ADMIN')
  async rebalanceBudget(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.rebalanceBudget(campaignId);
  }

  // ============================================
  // CAMPAIGN WORKFLOW
  // ============================================

  @Post('campaigns/:id/execute-workflow')
  @Roles('ADMIN')
  async executeWorkflow(@Param('id') campaignId: string) {
    return this.campaignWorkflowService.executeNextStep(campaignId);
  }

  @Get('campaigns/:id/workflow-status')
  async getWorkflowStatus(@Param('id') campaignId: string) {
    return this.campaignWorkflowService.getWorkflowStatus(campaignId);
  }

  @Post('campaigns/:id/workflow/:step/retry')
  @Roles('ADMIN')
  async retryWorkflowStep(@Param('id') campaignId: string, @Param('step') step: string) {
    return this.campaignWorkflowService.retryFailedStep(campaignId, parseInt(step));
  }

  // ============================================
  // BUDGET OPTIMIZATION
  // ============================================

  @Get('campaigns/:id/budget-efficiency')
  async getBudgetEfficiency(@Param('id') campaignId: string) {
    return this.budgetOptimizer.analyzeBudgetEfficiency(campaignId);
  }

  @Get('campaigns/:id/budget-status')
  async getBudgetStatus(@Param('id') campaignId: string) {
    return this.budgetOptimizer.getBudgetStatus(campaignId);
  }

  @Get('campaigns/:id/budget-recommendations')
  async getBudgetRecommendations(@Param('id') campaignId: string) {
    return this.budgetOptimizer.recommendBudgetReallocation(campaignId);
  }

  @Post('campaigns/:id/budget-reallocation')
  @Roles('ADMIN')
  async applyBudgetReallocation(
    @Param('id') campaignId: string,
    @Body() body: { allocations: Array<{ channel: string; amount: number }> },
  ) {
    return this.budgetOptimizer.applyBudgetReallocation(campaignId, body.allocations);
  }

  @Get('campaigns/:id/roi-forecast')
  async forecastROI(
    @Param('id') campaignId: string,
    @Query('days') days: number = 30,
  ) {
    return this.budgetOptimizer.forecastROI(campaignId, days);
  }

  @Post('campaigns/:id/optimize')
  @Roles('ADMIN')
  async optimizeCampaign(@Param('id') campaignId: string, @Body() optimizeDto: OptimizeCampaignDto) {
    return this.campaignOrchestrationService.optimizeCampaign(campaignId, optimizeDto);
  }

  // ============================================
  // CONTENT REPURPOSING (Leo Agent - Week 7)
  // ============================================

  @Post('content/repurpose/:blogPostId')
  @Roles('ADMIN')
  async repurposeBlogPost(
    @Param('blogPostId') blogPostId: string,
    @Body() body: { platforms?: string[]; campaignId?: string },
  ) {
    return this.leoCreativeDirector.repurposeBlogPost(
      blogPostId,
      body.platforms || ['linkedin', 'instagram', 'email'],
      body.campaignId,
    );
  }

  @Get('content/repurposed/:blogPostId')
  async getRepurposedContent(@Param('blogPostId') blogPostId: string) {
    return this.leoCreativeDirector.getRepurposedContent(blogPostId);
  }

  @Post('content/variations')
  @Roles('ADMIN')
  async generateVariations(
    @Body()
    body: { content: string; count?: number; platform?: string },
  ) {
    return this.leoCreativeDirector.generateVariations(
      body.content,
      body.count || 3,
      body.platform,
    );
  }

  @Post('content/optimize-length')
  @Roles('ADMIN')
  async optimizeContentLength(
    @Body() body: { content: string; maxLength: number; platform?: string },
  ) {
    return this.leoCreativeDirector.optimizeForLength(
      body.content,
      body.maxLength,
      body.platform,
    );
  }

  @Get('content/recommendations')
  async getPlatformRecommendations(@Query('content') content: string) {
    return this.leoCreativeDirector.getPlatformRecommendations(content);
  }

  @Patch('content/repurposed/:contentId/status')
  @Roles('ADMIN')
  async updateRepurposedContentStatus(
    @Param('contentId') contentId: string,
    @Body() body: { status: string; metadata?: any },
  ) {
    return this.leoCreativeDirector.updateRepurposedContentStatus(
      contentId,
      body.status,
      body.metadata,
    );
  }
}
