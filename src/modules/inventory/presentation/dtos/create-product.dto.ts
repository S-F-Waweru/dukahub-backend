import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    IsUUID,
    IsNotEmpty,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VariantDto {
    @ApiProperty({ example: 'BOOK-TFA-001', description: 'Stock Keeping Unit (unique identifier)' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({
        example: { isbn: '978-3-16-148410-0', condition: 'New' },
        description: 'Variant attributes (size, color, isbn, etc.)'
    })
    @IsObject()
    attributes: Record<string, string>;

    @ApiProperty({ example: 400, description: 'Cost price per unit (KES)' })
    @IsNumber()
    @Min(0)
    costPrice: number;

    @ApiProperty({ example: 650, description: 'Selling price per unit (KES)' })
    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @ApiPropertyOptional({ example: 50, description: 'Initial stock quantity', default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    initialStock?: number;

    @ApiPropertyOptional({ example: 10, description: 'Reorder point for this variant' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    reorderPoint?: number;
}

export class CreateProductDto {
    @ApiProperty({ example: 'Things Fall Apart', description: 'Product name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Classic African literature by Chinua Achebe' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'uuid', description: 'Category UUID' })
    @IsUUID()
    categoryId: string;

    @ApiProperty({ example: 650, description: 'Base selling price (KES)' })
    @IsNumber()
    @Min(0)
    basePrice: number;

    @ApiProperty({ example: 10, description: 'Reorder point threshold' })
    @IsNumber()
    @Min(0)
    reorderPoint: number;

    @ApiProperty({ example: false, description: 'Does product have variants (size, color, etc.)' })
    @IsBoolean()
    hasVariants: boolean;

    @ApiPropertyOptional({
        type: [VariantDto],
        description: 'Product variants (required if hasVariants is true)'
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDto)
    variants?: VariantDto[];
}