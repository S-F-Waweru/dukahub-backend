import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../../../domain/interfaces/permission.repository.interface';
import { CreatePermissionDto } from '../../dto/permission.dto';
import { Permission } from '../../../domain/entities/permission.entity';
@Injectable()
export class CreatePermissionUSeCase {
  constructor(
    @Inject(IPermissionRepository)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(input: CreatePermissionDto) {
    const resource = input.resource;
    const action = input.action;
    const description = input.description;
    const permission = Permission.create(resource, action, description);
    const exist = await this.permissionRepository.exists(permission.name);
    if (exist) {
      throw new ConflictException('Permission already exist');
    }

    await this.permissionRepository.save(permission);

    return {
      resource,
      action,
      description,
    };
  }
}
