import {
    IsUUID,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// todo check on th reference type
enum ReferenceType {
    ORDER = 'ORDER',
    MANUAL = 'MANUAL',
    WASTAGE = 'WASTAGE',
    RETURN = 'RETURN',
}

export class StockOutDto {
    @ApiProperty({ example: 'uuid', description: 'Product Variant UUID' })
    @IsUUID()
    variantId: string;

    @ApiProperty({ example: 5, description: 'Quantity to remove' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ enum: ReferenceType, example: 'ORDER' })
    @IsOptional()
    @IsEnum(ReferenceType)
    referenceType?: ReferenceType;

    @ApiPropertyOptional({ example: 'uuid', description: 'Related order/transaction ID' })
    @IsOptional()
    @IsUUID()
    referenceId?: string;

    @ApiPropertyOptional({ example: 'Sold via e-commerce' })
    @IsOptional()
    @IsString()
    notes?: string;
}