import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../domain/enums/sales-module.enums';

// Order Item DTO
class OrderItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

// Create POS Order DTO
export class CreatePOSOrderDto {
  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: 'Customer requested gift wrap' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Fulfillment Info DTO
class FulfillmentInfoDto {
  @ApiProperty({ example: '+254712345678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Apartment 5B, Riverside Drive' })
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Near Sarit Centre' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Nairobi County' })
  @IsString()
  region: string;

  @ApiPropertyOptional({ example: 'Green gate' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: 'Ring bell twice' })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;
}

// Create Online Order DTO
export class CreateOnlineOrderDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: FulfillmentInfoDto })
  @ValidateNested()
  @Type(() => FulfillmentInfoDto)
  fulfillmentInfo: FulfillmentInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// Cancel Order DTO
export class CancelOrderDto {
  @ApiProperty({ example: 'Customer requested cancellation' })
  @IsString()
  reason: string;
}

// Mark as Paid DTO
export class MarkAsPaidDto {
  @ApiProperty({ example: 'payment-uuid' })
  @IsUUID()
  paymentId: string;
}

// List Orders Query DTO
export class ListOrdersQueryDto {
  @ApiPropertyOptional({
    // enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;
}
