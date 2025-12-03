import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsLatitude, IsLongitude, Min, Max } from 'class-validator';

export class UpdateDriverLocationDto {
  @ApiProperty({ description: 'Latitude', example: 40.7128 })
  @IsNumber()
  @IsLatitude()
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -74.006 })
  @IsNumber()
  @IsLongitude()
  lng: number;

  @ApiPropertyOptional({ description: 'Heading in degrees (0-360)', example: 180 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ description: 'Speed in km/h', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;
}

export class CalculateETADto {
  @ApiProperty({ description: 'Origin latitude', example: 40.7128 })
  @IsNumber()
  originLat: number;

  @ApiProperty({ description: 'Origin longitude', example: -74.006 })
  @IsNumber()
  originLng: number;

  @ApiProperty({ description: 'Destination latitude', example: 40.758 })
  @IsNumber()
  destLat: number;

  @ApiProperty({ description: 'Destination longitude', example: -73.9855 })
  @IsNumber()
  destLng: number;
}

export class AssignDriverDto {
  @ApiProperty({ description: 'Driver ID to assign' })
  @IsString()
  driverId: string;
}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New delivery status',
    enum: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Optional note about the status change' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class LocationDto {
  @ApiProperty({ description: 'Address', example: '123 Main St' })
  address: string;

  @ApiProperty({ description: 'Latitude', example: 40.7128 })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -74.006 })
  lng: number;

  @ApiProperty({ description: 'Location name', example: 'DryJets Cleaners' })
  name: string;
}

export class DriverInfoDto {
  @ApiProperty({ description: 'Driver ID' })
  id: string;

  @ApiProperty({ description: 'Driver name' })
  name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Current location' })
  currentLocation?: {
    lat: number;
    lng: number;
  } | null;

  @ApiPropertyOptional({ description: 'Last location update time' })
  lastLocationUpdate?: Date;
}

export class ETAResponseDto {
  @ApiProperty({ description: 'Estimated time in minutes', example: 15 })
  minutes: number;

  @ApiProperty({ description: 'Distance as string', example: '2.5 km' })
  distance: string;

  @ApiProperty({ description: 'Distance in meters', example: 2500 })
  distanceMeters: number;

  @ApiProperty({ description: 'Estimated arrival time' })
  estimatedArrival: Date;
}

export class TimelineEventDto {
  @ApiProperty({ description: 'Status at this event' })
  status: string;

  @ApiProperty({ description: 'Event timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Event label' })
  label: string;

  @ApiPropertyOptional({ description: 'Optional note' })
  note?: string;
}

export class DeliveryTrackingDto {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Short code for display', example: 'DJ-1234' })
  shortCode: string;

  @ApiProperty({ description: 'Current delivery status' })
  status: string;

  @ApiProperty({ description: 'Pickup location', type: LocationDto })
  pickup: LocationDto;

  @ApiProperty({ description: 'Dropoff location', type: LocationDto })
  dropoff: LocationDto;

  @ApiPropertyOptional({ description: 'Assigned driver info', type: DriverInfoDto })
  driver: DriverInfoDto | null;

  @ApiPropertyOptional({ description: 'ETA info', type: ETAResponseDto })
  eta: ETAResponseDto | null;

  @ApiProperty({ description: 'Delivery timeline', type: [TimelineEventDto] })
  timeline: TimelineEventDto[];
}

export class AvailableDriverDto {
  @ApiProperty({ description: 'Driver ID' })
  id: string;

  @ApiProperty({ description: 'Driver name' })
  name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({ description: 'Driver rating', example: 4.8 })
  rating: number;

  @ApiProperty({ description: 'Distance from location', example: '1.5 km' })
  distance: string;

  @ApiProperty({ description: 'Current location' })
  location: {
    lat: number;
    lng: number;
  };
}
