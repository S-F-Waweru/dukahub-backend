import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { CreateRoleUseCase } from '../../application/user-cases/roles/create-role-use-case';
import { AssignRoleUseCase } from '../../application/user-cases/roles/assign-role.use-case';
import { RemoveRoleUseCase } from '../../application/user-cases/roles/remove-role.use-case';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CreateRoleDto } from '../../application/dto/role.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AssignRoleDto } from '../../application/dto/assign-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly assignRoleUSeCase: AssignRoleUseCase,
    private readonly removeRoleUseCase: RemoveRoleUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('roles:create')
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const role = await this.createRoleUseCase.execute({
      displayName: '',
      name: dto.name,
      description: dto.description,
      merchantId,
    });
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      message: 'Role created successfully',
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('roles:assign')
  async assignRole(
    @Body() dto: AssignRoleDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    // todo fins a wy to use merchant id here
    await this.assignRoleUSeCase.execute(dto);
    return { message: 'Role assigned successfully' };
  }
}
