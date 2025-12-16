import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface';
import { Role } from '../../domain/entities/role.entity';

import { Permission } from '../../domain/entities/permission.entity';
import { RoleSchema } from '../persistence/schemas/role.schema';
import { PermissionSchema } from '../persistence/schemas/permission.schema';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleSchema)
    private readonly roleRepository: Repository<RoleSchema>,
    @InjectRepository(PermissionSchema)
    private readonly permissionRepository: Repository<PermissionSchema>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const schema = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const schema = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    return schema ? this.toDomain(schema) : null;
  }

  async findByMerchantId(merchantId: string): Promise<Role[]> {
    const schemas = await this.roleRepository.find({
      where: { merchantId },
      relations: ['permissions'],
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async findSystemRoles(): Promise<Role[]> {
    const schemas = await this.roleRepository.find({
      where: { isSystemRole: true },
      relations: ['permissions'],
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  async save(role: Role): Promise<Role> {
    const schema = this.toSchema(role);
    const saved = await this.roleRepository.save(schema);

    const reloaded = await this.roleRepository.findOne({
      where: { id: saved.id },
      relations: ['permissions'],
    });
    return this.toDomain(reloaded!);
  }

  async update(role: Role): Promise<Role> {
    const schema = this.toSchema(role);
    await this.roleRepository.update(role.id, schema);

    const updated = await this.roleRepository.findOne({
      where: { id: role.id },
      relations: ['permissions'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignToUser(
    userId: string,
    roleId: string,
    assignedBy?: string,
  ): Promise<void> {
    await this.roleRepository.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
      [userId, roleId, assignedBy],
    );
  }

  async removeFromUser(userId: string, roleId: string): Promise<void> {
    await this.roleRepository.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    // ✅ Fix: Add proper typing for query result
    const schemas: RoleSchema[] = await this.roleRepository.query(
      `SELECT r.* FROM roles r
                           INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    // ✅ Fix: Load permissions with proper typing
    const rolesWithPermissions = await Promise.all(
      schemas.map(async (schema) => {
        const roleWithPermissions = await this.roleRepository.findOne({
          where: { id: schema.id },
          relations: ['permissions'],
        });
        return roleWithPermissions;
      }),
    );

    // ✅ Fix: Filter out null values and map
    return rolesWithPermissions
      .filter((schema): schema is RoleSchema => schema !== null)
      .map((schema) => this.toDomain(schema));
  }

  async exists(name: string): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { name } });
    return count > 0;
  }

  // ✅ Fix: Use Permission.fromPersistence instead of constructor
  private toDomain(schema: RoleSchema): Role {
    const permissions =
      schema.permissions?.map((permissionSchema) =>
        Permission.fromPersistence({
          id: permissionSchema.id,
          name: permissionSchema.name,
          resource: permissionSchema.resource,
          action: permissionSchema.action,
          description: permissionSchema.description,
        }),
      ) || [];

    return Role.fromPersistence({
      id: schema.id,
      name: schema.name,
      displayName: schema.displayName,
      description: schema.description,
      isSystemRole: schema.isSystemRole,
      merchantId: schema.merchantId,
      permissions: permissions,
    });
  }

  // ✅ Fix: Proper typing for return value
  private toSchema(role: Role): Partial<RoleSchema> {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystemRole: role.isSystemRole,
      merchantId: role.merchantId,
    };
  }
}
