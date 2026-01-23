import {
    IsUUID,
    IsNumber,
    IsOptional,
    IsObject,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockInDto {
    @ApiProperty({ example: 'uuid', description: 'Product Variant UUID' })
    @IsUUID()
    variantId: string;

    @ApiProperty({ example: 50, description: 'Quantity to add' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: 400, description: 'Unit cost price (KES)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    unitCost?: number;

    @ApiPropertyOptional({
        example: { supplier: 'ABC Books Ltd', contact: '+254712345678' },
        description: 'Supplier information'
    })
    @IsOptional()
    @IsObject()
    supplierInfo?: Record<string, any>;

    @ApiPropertyOptional({ example: 'Received from supplier ABC Books' })
    @IsOptional()
    @IsString()
    notes?: string;
}