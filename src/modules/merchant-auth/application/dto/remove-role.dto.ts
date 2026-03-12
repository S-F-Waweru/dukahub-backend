import { IsUUID, IsNotEmpty } from 'class-validator';

export class RemoveRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
