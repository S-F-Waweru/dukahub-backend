import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { CheckUserPermissionDto } from '../dto/check-user-permission.dto';

@Injectable()
export class CheckUserPermissionUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository,
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,
    ) {}

    async execute(dto : CheckUserPermissionDto){
// 1. Find user by userId, throw if not found
   const user = await this.userRepository.findById(dto.userId);
   if (!user) {
     throw new NotFoundException('User not found');
   }
// 2. Get all user roles using roleRepository.getUserRoles()
    const userRoles =  await this.roleRepository.getUserRoles(dto.userId);
// 3. Check if any role has the target permission
    const hasPermission = userRoles.some(role => role.hasPermission(dto.permission));
// 4. Return hasPermission boolean and user roles
    return {
        userId: user.id,
        hasPermission,
        roles: userRoles.map(role => ({ id: role.id, name: role.name })),
    }
    
}
}