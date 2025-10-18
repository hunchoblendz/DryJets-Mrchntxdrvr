import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums matching Prisma schema
export enum OrderType {
  ON_DEMAND = 'ON_DEMAND',
  SCHEDULED = 'SCHEDULED',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  AWAITING_CUSTOMER_DROPOFF = 'AWAITING_CUSTOMER_DROPOFF',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT_TO_MERCHANT = 'IN_TRANSIT_TO_MERCHANT',
  RECEIVED_BY_MERCHANT = 'RECEIVED_BY_MERCHANT',
  IN_PROCESS = 'IN_PROCESS',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  READY_FOR_CUSTOMER_PICKUP = 'READY_FOR_CUSTOMER_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  PICKED_UP_BY_CUSTOMER = 'PICKED_UP_BY_CUSTOMER',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum FulfillmentMode {
  FULL_SERVICE = 'FULL_SERVICE',
  CUSTOMER_DROPOFF_PICKUP = 'CUSTOMER_DROPOFF_PICKUP',
  CUSTOMER_DROPOFF_DRIVER_DELIVERY = 'CUSTOMER_DROPOFF_DRIVER_DELIVERY',
  DRIVER_PICKUP_CUSTOMER_PICKUP = 'DRIVER_PICKUP_CUSTOMER_PICKUP',
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'clxxx123' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 'Dress Shirt' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiPropertyOptional({ example: 'Blue cotton dress shirt' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Light starch on collar' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'clxxx123' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'clxxx456' })
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ example: 'clxxx789' })
  @IsString()
  @IsNotEmpty()
  merchantLocationId: string;

  @ApiProperty({ example: 'clxxx111' })
  @IsString()
  @IsNotEmpty()
  pickupAddressId: string;

  @ApiProperty({ example: 'clxxx222' })
  @IsString()
  @IsNotEmpty()
  deliveryAddressId: string;

  @ApiProperty({ enum: OrderType, example: OrderType.ON_DEMAND })
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType;

  @ApiProperty({ enum: FulfillmentMode, example: FulfillmentMode.FULL_SERVICE })
  @IsEnum(FulfillmentMode)
  @IsOptional()
  fulfillmentMode?: FulfillmentMode;

  @ApiPropertyOptional({ example: '2024-10-20T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledPickupAt?: string;

  @ApiPropertyOptional({ example: '2024-10-22T15:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledDeliveryAt?: string;

  @ApiPropertyOptional({ example: 'Please ring doorbell' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.IN_PROCESS })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Started processing items' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 37.7749 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: -122.4194 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ example: 'clxxx123' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'clxxx456' })
  @IsString()
  @IsOptional()
  merchantId?: string;

  @ApiPropertyOptional({ example: 'clxxx789' })
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING_PAYMENT })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class AssignDriverDto {
  @ApiProperty({ example: 'clxxx999' })
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty({ enum: ['pickup', 'delivery'], example: 'pickup' })
  @IsEnum(['pickup', 'delivery'])
  assignmentType: 'pickup' | 'delivery';
}

export class ConfirmDropoffDto {
  @ApiPropertyOptional({ example: 'Dropped off 3 bags at front desk' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string' },
    example: ['https://storage.example.com/dropoff-photo1.jpg']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class ConfirmPickupDto {
  @ApiPropertyOptional({ example: 'Picked up 3 bags' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string' },
    example: ['https://storage.example.com/pickup-photo1.jpg']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
