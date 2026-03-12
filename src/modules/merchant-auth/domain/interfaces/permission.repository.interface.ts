import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: string): Promise<Permission[]>; // Array
  findByAction(action: string): Promise<Permission[]>; // Array

  save(permission: Permission): Promise<Permission>; // Return entity
  update(permission: Permission): Promise<Permission>; // Return entity
  delete(id: string): Promise<void>;

  findAll(): Promise<Permission[]>;
  findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission[]>;
  exists(name: string): Promise<boolean>;
}

export const IPermissionRepository = Symbol('IPermissionRepository');
