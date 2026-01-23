import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    Matches,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantType } from '../../domain/enums/merchant-type.enum';

export class CreateMerchantDto {
    @ApiProperty({ example: "John's Bookstore", description: 'Business name' })
    @IsString()
    @MinLength(2)
    businessName: string;

    @ApiProperty({
        enum: MerchantType,
        example: MerchantType.BOOKSTORE,
        description: 'Type of business'
    })
    @IsEnum(MerchantType)
    type: MerchantType;

    @ApiProperty({ example: '+254712345678', description: 'Kenyan phone number' })
    @IsString()
    @Matches(/^(\+254|0)[17]\d{8}$/, {
        message: 'Invalid Kenyan phone number format',
    })
    phoneNumber: string;

    @ApiProperty({ example: 'john@bookstore.ke', description: 'Business email' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 'Kimathi Street, Nairobi CBD' })
    @IsOptional()
    @IsString()
    physicalAddress?: string;

    @ApiPropertyOptional({ example: 'A000000000X', description: 'KRA PIN for eTIMS' })
    @IsOptional()
    @IsString()
    @Matches(/^[A-Z]\d{9}[A-Z]$/, {
        message: 'Invalid KRA PIN format',
    })
    kraPin?: string;
}