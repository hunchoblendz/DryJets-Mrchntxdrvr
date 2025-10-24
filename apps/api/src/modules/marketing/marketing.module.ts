import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { OrchestratorService } from './ai/orchestrator.service';
import { SonnetService } from './ai/sonnet.service';
import { PrismaModule } from '../../../src/common/prisma/prisma.module';
import { CampaignOrchestrationService } from './services/campaign-orchestration.service';
import { MultiChannelCoordinatorService } from './services/multi-channel-coordinator.service';
import { CampaignWorkflowService } from './services/campaign-workflow.service';
import { BudgetOptimizerService } from './services/budget-optimizer.service';
import { LeoCreativeDirectorService } from './services/leo-creative-director.service';
import { SocialSchedulerService } from './services/social-scheduler.service';
import { SocialPlatformIntegrationService } from './services/social-platform-integration.service';
import { EmailDesignerService } from './services/email-designer.service';
import { AnalyticsService } from './services/analytics.service';
import { AvaOrchestratorService } from './services/ava-orchestrator.service';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [
    MarketingService,
    OrchestratorService,
    SonnetService,
    CampaignOrchestrationService,
    MultiChannelCoordinatorService,
    CampaignWorkflowService,
    BudgetOptimizerService,
    LeoCreativeDirectorService,
    SocialSchedulerService,
    SocialPlatformIntegrationService,
    EmailDesignerService,
    AnalyticsService,
    AvaOrchestratorService,
  ],
  exports: [
    MarketingService,
    OrchestratorService,
    CampaignOrchestrationService,
    MultiChannelCoordinatorService,
    CampaignWorkflowService,
    BudgetOptimizerService,
    LeoCreativeDirectorService,
    SocialSchedulerService,
    SocialPlatformIntegrationService,
    EmailDesignerService,
    AnalyticsService,
    AvaOrchestratorService,
  ],
})
export class MarketingModule {}
