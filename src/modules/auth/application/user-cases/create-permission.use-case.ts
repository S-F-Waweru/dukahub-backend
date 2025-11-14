import { Inject } from "@nestjs/common";
import { IPermissionRepository } from "../../domain/repositories/permission.repository.interface";
import { CreatePermissionDto } from "../dto/permission.dto";
import { Permission } from "../../domain/entities/permission.entity";

// export class CreatePermissionUSeCase {
//     constructor(
//         Inject(IPermissionRepository)
//         private readonly permissionRepository: IPermissionRepository) {
        
// }
//     async execute(input: CreatePermissionDto) {
//     // 1. Validate permission name follows resource 
//     if(Input == )
// // 2. Check if permission with same name already exists  
// // 3. Create new Permission entity with input data
// // 4. Save permission to repository
// // 5. Return success response with created permission details
//     }
// }