import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export enum CampaignChannel {
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  ADS = 'ADS',
}

export class BudgetAllocationDto {
  @IsEnum(CampaignChannel)
  channel: CampaignChannel;

  @IsNumber()
  @Min(0)
  allocation: number;

  @IsOptional()
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;
}

export class LaunchCampaignDto {
  @IsString()
  campaignId: string;

  @IsArray()
  @IsOptional()
  channelAllocations?: BudgetAllocationDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  autoOptimizePercentage?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

export class PauseCampaignDto {
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class OptimizeCampaignDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsNumber()
  targetROI?: number;

  @IsOptional()
  @IsNumber()
  budgetFlexibility?: number;

  @IsOptional()
  @IsObject()
  constraints?: any;
}
