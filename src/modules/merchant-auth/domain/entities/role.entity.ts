import { BaseEntity } from 'src/shared/domain/base.entity';
import { Permission } from './permission.entity';
import { BadRequestException } from '@nestjs/common';

export class Role extends BaseEntity {
  private _name: string;
  private _displayName: string;
  private _description?: string;
  private _isSystemRole: boolean;
  private _merchantId?: string;
  private _permissions: Permission[];

  private constructor(props: {
    id?: string;
    name: string;
    displayName: string;
    description?: string;
    isSystemRole?: boolean;
    merchantId?: string;
    permissions?: Permission[];
  }) {
    super(props.id);
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description;
    this._isSystemRole = props.isSystemRole || false;
    this._merchantId = props.merchantId;
    this._permissions = props.permissions || [];

    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Role name is required');
    }
    if (!this._displayName || this._displayName.trim().length === 0) {
      throw new BadRequestException('Role display name is required');
    }
  }

  // Business Rules
  static create(
    name: string,
    displayName: string,
    description?: string,
    merchantId?: string,
  ): Role {
    return new Role({
      name,
      displayName,
      description,
      merchantId,
      // isSystemRole defaults to false automatically
    });
  }
  // ✅ ADD THIS: Factory method for database reconstitution
  static fromPersistence(props: {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    isSystemRole: boolean;
    merchantId?: string;
    permissions: Permission[];
  }): Role {
    return new Role({
      id: props.id,
      name: props.name,
      displayName: props.displayName,
      description: props.description,
      isSystemRole: props.isSystemRole,
      merchantId: props.merchantId,
      permissions: props.permissions,
    });
  }

  public addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.name)) {
      this._permissions.push(permission);
      this.touch();
    }
  }

  public removePermission(permissionName: string): void {
    this._permissions = this._permissions.filter(
      (p) => p.name !== permissionName,
    );
    this.touch();
  }

  public hasPermission(permissionName: string): boolean {
    return this._permissions.some((p) => p.name === permissionName);
  }

  public canBeDeleted(): boolean {
    return !this._isSystemRole;
  }
  // Getters
  get name(): string {
    return this._name;
  }
  get displayName(): string {
    return this._displayName;
  }
  get description(): string | undefined {
    return this._description;
  }
  get isSystemRole(): boolean {
    return this._isSystemRole;
  }
  get merchantId(): string | undefined {
    return this._merchantId;
  }
  get permissions(): Permission[] {
    return this._permissions;
  }
}
