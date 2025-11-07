import { BaseEntity } from 'src/shared/domain/base.entity';

export class Permission extends BaseEntity {
  private _name: string;
  private _resource: string;
  private _action: string;
  private _description?: string;

  private constructor(props: {
    id?: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
  }) {
    super(props.id);
    this._name = props.name;
    this._resource = props.resource;
    this._action = props.action;
    this._description = props.description;

    this.validate();
  }

  static create(
    resource: string,
    action: string,
    description?: string,
  ): Permission {
    const name = `${resource}_${action}`;
    return new Permission({
      name,
      resource,
      action,
      description,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
  }): Permission {
    return new Permission(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Permission name is required');
    }
    if (!this._resource || this._resource.trim().length === 0) {
      throw new Error('Resource is required');
    }
    if (!this._action || this._action.trim().length === 0) {
      throw new Error('Action is required');
    }
    // Naming convention: resource_action
    if (this._name !== `${this._resource}_${this._action}`) {
      throw new Error('Permission name must follow format: resource_action');
    }
  }

  // Getters
  get name(): string {
    return this._name;
  }
  get resource(): string {
    return this._resource;
  }
  get action(): string {
    return this._action;
  }
  get description(): string | undefined {
    return this._description;
  }
}
