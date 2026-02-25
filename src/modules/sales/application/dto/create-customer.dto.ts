import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'sarah@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
