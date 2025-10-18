import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsEmail,
  IsPhoneNumber,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export enum BusinessType {
  DRY_CLEANER = 'DRY_CLEANER',
  LAUNDROMAT = 'LAUNDROMAT',
  BOTH = 'BOTH',
}

export enum MerchantTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export class CreateMerchantDto {
  @ApiProperty({ example: 'Sparkle Dry Cleaners' })
  @IsString()
  businessName: string;

  @ApiProperty({ enum: BusinessType, example: BusinessType.DRY_CLEANER })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiPropertyOptional({ example: '12-3456789' })
  @IsOptional()
  @IsString()
  taxId?: string;
}

export class UpdateMerchantDto {
  @ApiPropertyOptional({ example: 'Sparkle Dry Cleaners' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @ApiPropertyOptional({ example: '12-3456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ enum: MerchantTier })
  @IsOptional()
  @IsEnum(MerchantTier)
  tier?: MerchantTier;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class MerchantQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'CA' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ example: 'Sparkle' })
  @IsOptional()
  @IsString()
  search?: string;
}

// Merchant Location DTOs
export class CreateMerchantLocationDto {
  @ApiProperty({ example: 'Downtown Location' })
  @IsString()
  name: string;

  @ApiProperty({ example: '321 Mission Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  state: string;

  @ApiProperty({ example: '94105' })
  @IsString()
  zipCode: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string = 'USA';

  @ApiProperty({ example: 37.7899 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -122.3999 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: '+14155552345' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ example: 'downtown@sparkledry.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean = false;

  @ApiPropertyOptional({
    example: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
    },
  })
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, any>;
}

export class UpdateMerchantLocationDto {
  @ApiPropertyOptional({ example: 'Downtown Location' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '321 Mission Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'CA' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '94105' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 37.7899 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: -122.3999 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: '+14155552345' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ example: 'downtown@sparkledry.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, any>;
}

// Service DTOs
export enum ServiceType {
  DRY_CLEANING = 'DRY_CLEANING',
  WASH_AND_FOLD = 'WASH_AND_FOLD',
  LAUNDRY = 'LAUNDRY',
  PRESSING = 'PRESSING',
  ALTERATIONS = 'ALTERATIONS',
  SHOE_REPAIR = 'SHOE_REPAIR',
  OTHER = 'OTHER',
}

export enum PricingModel {
  PER_ITEM = 'PER_ITEM',
  PER_POUND = 'PER_POUND',
  FLAT_RATE = 'FLAT_RATE',
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Dry Cleaning - Shirt' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Professional dry cleaning for dress shirts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.DRY_CLEANING })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({ enum: PricingModel, example: PricingModel.PER_ITEM })
  @IsEnum(PricingModel)
  pricingModel: PricingModel;

  @ApiProperty({ example: 5.99 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 2880 })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Dry Cleaning - Shirt' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Professional dry cleaning for dress shirts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceType })
  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  @ApiPropertyOptional({ enum: PricingModel })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiPropertyOptional({ example: 5.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 2880 })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
