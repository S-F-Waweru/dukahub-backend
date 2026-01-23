import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VariantResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'BOOK-TFA-001' })
    sku: string;

    @ApiProperty({ example: { isbn: '978-3-16-148410-0', condition: 'New' } })
    attributes: Record<string, string>;

    @ApiProperty({ example: 48 })
    currentStock: number;

    @ApiProperty({ example: 650 })
    sellingPrice: number;

    @ApiPropertyOptional({ example: 400 })
    costPrice?: number;

    @ApiPropertyOptional({ example: 10 })
    reorderPoint?: number;
}

export class ProductResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Things Fall Apart' })
    name: string;

    @ApiPropertyOptional({ example: 'Classic African literature' })
    description?: string;

    @ApiProperty({ example: 650 })
    basePrice: number;

    @ApiProperty({ example: 48 })
    totalStock: number;

    @ApiProperty({ example: false })
    hasLowStock: boolean;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ type: [VariantResponseDto] })
    variants: VariantResponseDto[];

    @ApiProperty({ example: '2026-01-23T10:30:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-01-23T15:45:00Z' })
    updatedAt: Date;
}