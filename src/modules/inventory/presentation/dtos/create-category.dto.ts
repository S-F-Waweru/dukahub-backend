import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../../domain/entities/category.entity';

export class CreateCategoryDto {
    @ApiProperty({ example: 'My Custom Category' })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({ enum: CategoryType })
    @IsEnum(CategoryType)
    type: CategoryType;

    @ApiPropertyOptional({ description: 'Leave empty for system category' })
    @IsOptional()
    @IsString()
    merchantId?: string;
}