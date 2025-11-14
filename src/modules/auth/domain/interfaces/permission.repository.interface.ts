import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: string): Promise<Permission[]>;
  findByAction(action: string): Promise<Permission[]>;
  save(permission: Permission): Promise<Permission>;
  update(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Permission[]>;
  findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission[]>;
  exists(name: string): Promise<boolean>;
}

export const IPermissionRepository = Symbol('IPermissionRepository');
