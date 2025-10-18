import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum CycleType {
  WASH = 'WASH',
  DRY = 'DRY',
  STEAM = 'STEAM',
  PRESS = 'PRESS',
}

export class SubmitTelemetryDto {
  @ApiProperty({ description: 'Equipment ID or IoT Device ID' })
  @IsString()
  equipmentId: string;

  @ApiPropertyOptional({ description: 'Power consumption in watts' })
  @IsOptional()
  @IsNumber()
  powerWatts?: number;

  @ApiPropertyOptional({ description: 'Water usage in liters' })
  @IsOptional()
  @IsNumber()
  waterLiters?: number;

  @ApiPropertyOptional({ description: 'Temperature in Celsius' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Vibration level (0-10)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  vibration?: number;

  @ApiPropertyOptional({ enum: CycleType, description: 'Type of cycle running' })
  @IsOptional()
  @IsEnum(CycleType)
  cycleType?: CycleType;

  @ApiPropertyOptional({ description: 'Whether machine is currently running' })
  @IsOptional()
  @IsBoolean()
  isRunning?: boolean;

  @ApiPropertyOptional({ description: 'When current cycle started' })
  @IsOptional()
  @IsDateString()
  cycleStartedAt?: string;

  @ApiPropertyOptional({ description: 'Estimated cycle end time' })
  @IsOptional()
  @IsDateString()
  cycleEstimatedEnd?: string;
}

export class GetTelemetryHistoryDto {
  @ApiPropertyOptional({ description: 'Start date for history query' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for history query' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Limit number of results', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class EnableIotDto {
  @ApiProperty({ description: 'Unique IoT device identifier' })
  @IsString()
  iotDeviceId: string;

  @ApiPropertyOptional({ description: 'Equipment manufacturer' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Equipment model number' })
  @IsOptional()
  @IsString()
  model?: string;
}

export class TelemetryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  equipmentId: string;

  @ApiPropertyOptional()
  powerWatts?: number;

  @ApiPropertyOptional()
  waterLiters?: number;

  @ApiPropertyOptional()
  temperature?: number;

  @ApiPropertyOptional()
  vibration?: number;

  @ApiPropertyOptional()
  cycleType?: string;

  @ApiProperty()
  isRunning: boolean;

  @ApiPropertyOptional()
  cycleStartedAt?: Date;

  @ApiPropertyOptional()
  cycleEstimatedEnd?: Date;

  @ApiProperty()
  cycleCount: number;

  @ApiProperty({ description: 'Equipment health score (0-100)' })
  healthScore: number;

  @ApiProperty({ description: 'Efficiency score (0-100)' })
  efficiencyScore: number;

  @ApiProperty()
  updatedAt: Date;
}
