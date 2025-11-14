import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: AssignRoleDto) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const userRoles = await this.roleRepository.getUserRoles(dto.userId);
    const alreadyHasRole = userRoles.some((role) => role.id === dto.roleId);
    if (alreadyHasRole) {
      throw new ConflictException('user already has this role');
    }
    await this.roleRepository.assignToUser(user.id, role.id, dto.assignedBy);

    return {
      role: role.id,
      user: user.id,
      assignedBy: dto.assignedBy,
    };
  }
}
