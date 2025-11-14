 import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface';
import { IPermissionRepository } from '../../domain/repositories/permission.repository.interface';
import { AssignPermissionToRoleDto } from '../dto/Assign-permission-to-role.dto';
 
 @Injectable()
 export class AssignPermissionToRoleUseCase {
    constructor(
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,
        @Inject(IPermissionRepository)
        private readonly permissionRepository: IPermissionRepository,
    ) {}

    async execute(dto: AssignPermissionToRoleDto) {
        const role = await this.roleRepository.findById(dto.roleId);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        const permission = await this.permissionRepository.findById(dto.permissionId);
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        if (role.hasPermission(permission.name)) {
        throw new ConflictException('Role already has this permission');
        }
        role.addPermission(permission)
        await this.roleRepository.save(role)
        
        return {
            success : true,
       message: "Permission assigned to role successfully"
        }
    }

        

    
 }