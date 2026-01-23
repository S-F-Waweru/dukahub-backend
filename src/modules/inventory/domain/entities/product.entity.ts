import { BaseEntity } from 'src/shared/domain/base.entity';
import { Price } from '../value-objects/price.vo';
import { ReorderPoint } from '../value-objects/reorder-point.vo';
import { ProductVariant } from './product-variant.entity';
import { DomainException } from 'src/shared/domain/exceptions/domain.exeption';

export class Product extends BaseEntity {
  private _name: string;
  private _description?: string;
  private _merchantId: string;
  private _categoryId: string;
  private _hasVariants: boolean;
  private _basePrice: Price;
  private _reorderPoint: ReorderPoint;
  private _isActive: boolean;
  private _variants: ProductVariant[] = [];

  private constructor(props: {
    id?: string;
    name: string;
    description?: string;
    merchantId: string;
    categoryId: string;
    hasVariants: boolean;
    basePrice: Price;
    reorderPoint: ReorderPoint;
    isActive?: boolean;
    variants?: ProductVariant[];
  }) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._merchantId = props.merchantId;
    this._categoryId = props.categoryId;
    this._hasVariants = props.hasVariants;
    this._basePrice = props.basePrice;
    this._reorderPoint = props.reorderPoint;
    this._isActive = props.isActive ?? true;
    this._variants = props.variants || [];

    this.validate();
  }

  static create(
    name: string,
    merchantId: string,
    categoryId: string,
    basePrice: number,
    reorderPoint: number,
    hasVariants: boolean = false,
    description?: string,
  ): Product {
    return new Product({
      name,
      merchantId,
      categoryId,
      basePrice: new Price(basePrice),
      reorderPoint: new ReorderPoint(reorderPoint),
      hasVariants,
      description,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    description?: string;
    merchantId: string;
    categoryId: string;
    hasVariants: boolean;
    basePrice: number;
    reorderPoint: number;
    isActive: boolean;
    variants?: ProductVariant[];
  }): Product {
    return new Product({
      id: props.id,
      name: props.name,
      description: props.description,
      merchantId: props.merchantId,
      categoryId: props.categoryId,
      hasVariants: props.hasVariants,
      basePrice: new Price(props.basePrice),
      reorderPoint: new ReorderPoint(props.reorderPoint),
      isActive: props.isActive,
      variants: props.variants,
    });
  }


  validate() {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainException('Product name is required');
    }

    if (!this._merchantId) {
      throw new DomainException('Merchant ID is required');
    }
  }

  public addVariant(variant: ProductVariant): void {
    if (!this._hasVariants) {
      throw new DomainException('Product does not support variants');
    }
    this._variants.push(variant);
    this.touch();
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public canBeDeleted(): boolean {
    return (
      this._variants.length === 0 ||
      this._variants.every((v) => v.currentStock === 0)
    );
  }

  public getTotalStock(): number {
    if (!this._hasVariants) return 0;
    return this._variants.reduce((sum, v) => sum + v.currentStock, 0);
  }

  public hasLowStock(): boolean {
    const totalStock = this.getTotalStock();
    return totalStock <= this._reorderPoint.value;
  }

  // Getters
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get merchantId(): string {
    return this._merchantId;
  }
  get categoryId(): string {
    return this._categoryId;
  }
  get hasVariants(): boolean {
    return this._hasVariants;
  }
  get basePrice(): Price {
    return this._basePrice;
  }
  get reorderPoint(): ReorderPoint {
    return this._reorderPoint;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get variants(): ProductVariant[] {
    return this._variants;
  }

  public update(props: {
    name?: string;
    description?: string;
    categoryId?: string;
    basePrice?: number;
    reorderPoint?: number;
  }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }

    if (props.description !== undefined) {
      this._description = props.description;
    }

    if (props.categoryId !== undefined) {
      this._categoryId = props.categoryId;
    }

    if (props.basePrice !== undefined) {
      this._basePrice = new Price(props.basePrice);
    }

    if (props.reorderPoint !== undefined) {
      this._reorderPoint = new ReorderPoint(props.reorderPoint);
    }

    this.validate();
    this.touch();
  }

}
