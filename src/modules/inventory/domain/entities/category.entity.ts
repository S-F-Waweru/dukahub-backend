// domain/entities/category.entity.ts

import { BaseEntity } from "src/shared/domain/base.entity";

export enum CategoryType {
  BOOKS = 'BOOKS',
  CLOTHING = 'CLOTHING',
  JEWELRY = 'JEWELRY',
  CUSTOM = 'CUSTOM',
}

export class Category extends BaseEntity {
  private _name: string;
  private _type: CategoryType;
  private _merchantId?: string; // null = system category
  private _isActive: boolean;

  // FIXED VERSION:
  constructor(props: {
    id?: string;
    name: string;
    type: CategoryType;
    merchantId?: string;
    isActive: boolean; // Fixed: 'boolean' not 'boolen'
  }) {
    super(props.id);

    // Fixed: Proper assignment syntax
    this._name = props.name;
    this._type = props.type;
    this._isActive = props.isActive;

    // Optional: Handle merchantId if it exists
    if (props.merchantId) {
      this._merchantId = props.merchantId;
    }
  }
  // FIXED STATIC CREATE METHOD:
  static create(
    name: string,
    type: CategoryType,
    merchantId?: string,
    isActive: boolean = true, // ✅ Added default value (recommended)
  ): Category {
    return new Category({
      name,
      type,
      merchantId,
      isActive,
    });
  }

  get name(): string {
    return this._name;
  }
  get type(): CategoryType {
    return this._type;
  }
  get isSystemCategory(): boolean {
    return !this._merchantId;
  }
}
