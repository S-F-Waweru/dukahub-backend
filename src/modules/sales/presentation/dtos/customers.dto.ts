import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: '+254712345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'Sarah' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Wanjiru' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'sarah@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
