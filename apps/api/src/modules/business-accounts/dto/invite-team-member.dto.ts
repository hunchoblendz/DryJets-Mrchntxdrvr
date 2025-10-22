import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteTeamMemberDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'MANAGER', description: 'ADMIN | MANAGER | MEMBER' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canPlaceOrders?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canViewInvoices?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageTeam?: boolean;
}
