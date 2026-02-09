import { IsUUID, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
    @ApiProperty({ example: 'uuid', description: 'Product Variant UUID' })
    @IsUUID()
    variantId: string;

    @ApiProperty({ example: 48, description: 'New stock quantity (absolute value)' })
    @IsNumber()
    @Min(0)
    newQuantity: number;

    @ApiProperty({ example: 'Physical count correction after stocktake' })
    @IsString()
    reason: string;
}