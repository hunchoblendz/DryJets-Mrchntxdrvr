import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BusinessIndustry {
  HOSPITALITY = 'HOSPITALITY',
  FOOD_SERVICE = 'FOOD_SERVICE',
  HEALTHCARE = 'HEALTHCARE',
  BEAUTY_WELLNESS = 'BEAUTY_WELLNESS',
  FITNESS = 'FITNESS',
  RETAIL = 'RETAIL',
  CORPORATE = 'CORPORATE',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export enum BusinessSubscriptionTier {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export class CreateBusinessAccountDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Grand Hotel Ottawa' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ enum: BusinessIndustry })
  @IsEnum(BusinessIndustry)
  @IsOptional()
  industry?: BusinessIndustry;

  @ApiProperty({ example: 'billing@grandhotel.com' })
  @IsEmail()
  billingEmail: string;

  @ApiPropertyOptional({ example: '+1-613-555-0100' })
  @IsString()
  @IsOptional()
  billingPhone?: string;

  @ApiPropertyOptional({ enum: BusinessSubscriptionTier, default: BusinessSubscriptionTier.BASIC })
  @IsEnum(BusinessSubscriptionTier)
  @IsOptional()
  subscriptionTier?: BusinessSubscriptionTier;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsNumber()
  @IsOptional()
  monthlySpendLimit?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  autoPayEnabled?: boolean;
}
