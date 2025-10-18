import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 2500, description: 'Amount in cents' })
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({ example: 'usd' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'customer-123', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    example: 'Payment for Order #DRY-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: { orderId: 'order-123' }, required: false })
  @IsOptional()
  metadata?: Record<string, string>;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_1234567890' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiProperty({ example: 'pm_1234567890', required: false })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}

export class CreateRefundDto {
  @ApiProperty({ example: 'payment-123' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ example: 2500, description: 'Amount in cents', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'Customer requested refund', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class PaymentQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 20;
}

export class StripeWebhookDto {
  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  payload: string;
}

export class MerchantOnboardingDto {
  @ApiProperty({ example: 'merchant-123' })
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ example: 'john@merchant.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'http://localhost:3002/onboarding/return' })
  @IsString()
  @IsNotEmpty()
  returnUrl: string;

  @ApiProperty({ example: 'http://localhost:3002/onboarding/refresh' })
  @IsString()
  @IsNotEmpty()
  refreshUrl: string;
}
