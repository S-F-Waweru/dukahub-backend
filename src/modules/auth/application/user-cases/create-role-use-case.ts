import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface';
import { CreateRoleDto } from '../dto/role.dto';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: CreateRoleDto) {
    /// chect if role exist
    const exist = await this.roleRepository.findByName(dto.name);
    if (exist) {
      throw new ConflictException(' Role already exists');
    }

    // create arole
    const role = Role.create(
      dto.name,
      dto.displayName,
      dto.description,
      dto.merchantId,
    );

    // ssave
    await this.roleRepository.save(role);

    return {
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      merchantId: role.merchantId,
    };
  }
}
