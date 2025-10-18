import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: ['CUSTOMER', 'DRIVER', 'MERCHANT'],
    example: 'CUSTOMER',
  })
  @IsEnum(['CUSTOMER', 'DRIVER', 'MERCHANT'])
  role: 'CUSTOMER' | 'DRIVER' | 'MERCHANT';

  // Common fields
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName?: string;

  // Merchant specific
  @ApiProperty({ example: 'Clean & Fresh Laundry' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ enum: ['DRY_CLEANER', 'LAUNDROMAT', 'BOTH'] })
  @IsOptional()
  @IsEnum(['DRY_CLEANER', 'LAUNDROMAT', 'BOTH'])
  businessType?: 'DRY_CLEANER' | 'LAUNDROMAT' | 'BOTH';

  // Driver specific
  @ApiProperty({ enum: ['CAR', 'VAN', 'TRUCK', 'MOTORCYCLE', 'BICYCLE'] })
  @IsOptional()
  @IsEnum(['CAR', 'VAN', 'TRUCK', 'MOTORCYCLE', 'BICYCLE'])
  vehicleType?: 'CAR' | 'VAN' | 'TRUCK' | 'MOTORCYCLE' | 'BICYCLE';

  @ApiProperty({ example: 'ABC123' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiProperty({ example: 'DL123456' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: Date;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;
}
