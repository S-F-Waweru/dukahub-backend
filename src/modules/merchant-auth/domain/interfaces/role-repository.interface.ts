import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByMerchantId(merchantId: string): Promise<Role[]>;
  findSystemRoles(): Promise<Role[]>;
  save(role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
  exists(name: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<Role[]>;
}

export const IRoleRepository = Symbol('IRoleRepository');
