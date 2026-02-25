import {
  IsString,
  IsArray,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FulfillmentInfoDto {
  @ApiProperty({ example: '+254712345678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Apartment 5B, Riverside Drive' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Near Sarit Centre', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  region: string;

  @ApiProperty({ example: 'Green gate', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: 'Ring the bell twice', required: false })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;
}

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
