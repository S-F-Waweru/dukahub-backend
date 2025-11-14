import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  save(role: Role): Promise<Role>;
  getUserRoles(userId: string): Promise<Role[]>;
  assignToUser(
    userId: string,
    roleId: string,
    assignedBy?: string,
  ): Promise<void>;
  removeFromUser(userId: string, roleId: string): Promise<void>;
}

export const IRoleRepository = Symbol('IRoleRepository');
