import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentInfoDto {
    @ApiPropertyOptional({ example: '123456', description: 'M-Pesa Till/Paybill number' })
    @IsOptional()
    @IsString()
    mpesaTill?: string;

    @ApiPropertyOptional({ example: '+254712345678', description: 'Airtel Money number' })
    @IsOptional()
    @IsString()
    airtelMoneyNumber?: string;
}