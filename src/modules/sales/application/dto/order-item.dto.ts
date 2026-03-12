import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Money } from '../../domain/value-objects/money.vo';
import { Quantity } from '../../domain/value-objects/quantity.vo';

export class OrderItemDto {
  @ApiProperty({ example: '' })
  @IsString()
  orderId: string;
  @ApiProperty({ example: '' })
  @IsString()
  variantId: string;
  @ApiProperty({ example: '' })
  @IsString()
  productName: string;
  @ApiProperty({ example: '' })
  @IsString()
  sku: string;
  @ApiProperty({ example: '' })
  unitPrice: Money;
  @ApiProperty({ example: '' })
  quantity: Quantity;
  @ApiProperty({ example: '' })
  subtotal: Money;
  @ApiProperty({ example: '' })
  taxAmount?: Money;
}
