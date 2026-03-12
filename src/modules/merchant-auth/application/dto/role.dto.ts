import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  displayName: string;

  @IsString()
  @IsOptional()
  description: string;
  @IsUUID()
  @IsOptional()
  merchantId?: string;
}
