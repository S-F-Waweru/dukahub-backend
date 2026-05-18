import { IsString, IsOptional, Matches, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMerchantDto {
    @ApiPropertyOptional({ example: "John's Updated Bookstore" })
    @IsOptional()
    @IsString()
    @MinLength(2)
    businessName?: string;

    @ApiPropertyOptional({ example: 'New Street, Nairobi' })
    @IsOptional()
    @IsString()
    physicalAddress?: string;

    @ApiPropertyOptional({ example: 'A000000000X' })
    @IsOptional()
    @IsString()
    @Matches(/^[A-Z]\d{9}[A-Z]$/)
    kraPin?: string;
}