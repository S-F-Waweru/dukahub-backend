import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantType } from '../../domain/enums/merchant-type.enum';
import { MerchantStatus } from '../../domain/enums/merchant-status.enum';

export class MerchantResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: "John's Bookstore" })
    businessName: string;

    @ApiProperty({ enum: MerchantType, example: MerchantType.BOOKSTORE })
    type: MerchantType;

    @ApiProperty({ example: '+254712345678' })
    phoneNumber: string;

    @ApiProperty({ example: 'john@bookstore.ke' })
    email: string;

    @ApiPropertyOptional({ example: 'Kimathi Street, Nairobi' })
    physicalAddress?: string;

    @ApiPropertyOptional({ example: 'A000000000X' })
    kraPin?: string;

    @ApiPropertyOptional({ example: '123456' })
    mpesaTill?: string;

    @ApiPropertyOptional({ example: '+254712345678' })
    airtelMoneyNumber?: string;

    @ApiProperty({ enum: MerchantStatus, example: MerchantStatus.ACTIVE })
    status: MerchantStatus;

    @ApiProperty({ example: 'FREE' })
    subscriptionTier: string;

    @ApiProperty({ example: '2026-01-01T00:00:00Z' })
    onboardedAt: Date;

    @ApiProperty({ example: '2026-01-23T10:30:00Z' })
    createdAt: Date;
}