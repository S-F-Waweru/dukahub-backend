import { isNotEmpty, IsNotEmpty, IsString, IsUUID } from "class-validator"

 export class CheckUserPermissionDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string

    @IsString()
    @IsNotEmpty()
    permission : string
 }