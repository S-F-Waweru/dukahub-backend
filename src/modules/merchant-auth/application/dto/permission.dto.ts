import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z_]+$/, {
    message: 'Resource must be lowercase with underscores',
  })
  resource: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+$/, { message: 'Action must be lowercase letters' })
  action: string;

  @IsString()
  @IsOptional()
  description?: string;
}
