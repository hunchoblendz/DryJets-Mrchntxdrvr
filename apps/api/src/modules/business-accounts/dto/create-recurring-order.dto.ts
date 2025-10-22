import { IsString, IsEnum, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreateRecurringOrderDto {
  @ApiProperty({ example: 'business123' })
  @IsString()
  businessId: string;

  @ApiProperty({ enum: RecurringFrequency })
  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @ApiProperty({ example: '2025-10-23T09:00:00Z' })
  @IsDateString()
  nextScheduledDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  pickupTime: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Pick up laundry from front desk' })
  @IsString()
  @IsOptional()
  notes?: string;
}
