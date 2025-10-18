import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AlertSeverity,
  AlertStatus,
  MaintenanceAlertType,
} from '@prisma/client';

export class AcknowledgeAlertDto {
  @ApiPropertyOptional({ description: 'Notes when acknowledging the alert' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ResolveAlertDto {
  @ApiProperty({ description: 'Description of how the issue was resolved' })
  @IsString()
  resolution: string;
}

export class GetAlertsQueryDto {
  @ApiPropertyOptional({ enum: AlertStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Filter by severity' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({
    enum: MaintenanceAlertType,
    description: 'Filter by alert type',
  })
  @IsOptional()
  @IsEnum(MaintenanceAlertType)
  type?: MaintenanceAlertType;

  @ApiPropertyOptional({ description: 'Filter by equipment ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string;
}

export class MaintenanceAlertResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  equipmentId: string;

  @ApiProperty()
  merchantId: string;

  @ApiProperty({ enum: MaintenanceAlertType })
  type: MaintenanceAlertType;

  @ApiProperty({ enum: AlertSeverity })
  severity: AlertSeverity;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  recommendation?: string;

  @ApiProperty({ enum: AlertStatus })
  status: AlertStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  acknowledgedAt?: Date;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  resolution?: string;

  @ApiPropertyOptional()
  equipment?: {
    id: string;
    name: string;
    type: string;
  };
}
