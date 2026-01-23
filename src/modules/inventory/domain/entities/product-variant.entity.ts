import { SignJsonWebKeyInput } from 'node:crypto';
import { BaseEntity } from 'src/shared/domain/base.entity';
import { Price } from '../value-objects/price.vo';
import { ReorderPoint } from '../value-objects/reorder-point.vo';
import { SKU } from '../value-objects/sku.vo';
import { StockLevel } from '../value-objects/stock-level.vo';
import { DomainException } from 'src/shared/domain/exceptions/domain.exeption';

export interface VariantAttributes {
  size?: string;
  color?: string;
  isbn?: string;
  weight?: string;
  material?: string;
  [key: string]: string | undefined;
}

export class ProductVariant extends BaseEntity {
  private _productId: string;
  private _sku: SKU;
  private _attributes: VariantAttributes;
  private _costPrice: Price;
  private _sellingPrice: Price;
  private _stockLevel: StockLevel;
  private _reorderPoint?: ReorderPoint;
  private _supplierInfo?: Record<string, any>;
  private _etimsItemCode?: string;

  private constructor(props: {
    id?: string;
    productId: string;
    sku: SKU;
    attributes: VariantAttributes;
    costPrice: Price;
    sellingPrice: Price;
    stockLevel: StockLevel;
    reorderPoint?: ReorderPoint;
    supplierInfo?: Record<string, any>;
    etimsItemCode?: string;
  }) {
    super(props.id);
    this._productId = props.productId;
    this._sku = props.sku;
    this._attributes = props.attributes;
    this._costPrice = props.costPrice;
    this._sellingPrice = props.sellingPrice;
    this._stockLevel = props.stockLevel;
    this._reorderPoint = props.reorderPoint;
    this._supplierInfo = props.supplierInfo;
    this._etimsItemCode = props.etimsItemCode;

    this.validate();
  }

  validate() {
    if (!this._productId) {
      throw new DomainException('Product Id Is required');
    }

    if (this._sellingPrice < this._costPrice) {
      throw new DomainException(
        'Selling Price cannot be less than buyyong price',
      );
    }
  }

  static create(props: {
    id?: string;
    productId: string;
    sku: SKU;
    attributes: VariantAttributes;
    costPrice: Price;
    sellingPrice: Price;
    stockLevel: StockLevel;
    reorderPoint?: ReorderPoint;
    supplierInfo?: Record<string, any>;
    etimsItemCode?: string;
  }) {
    return new ProductVariant(props);
  }

  public increaseStock(quantity: number): void {
    this._stockLevel = this._stockLevel.increase(quantity);
    this.touch();
  }

  public decreaseStock(quantity: number): void {
    this._stockLevel = this._stockLevel.decrease(quantity);
    this.touch();
  }

  public adjustStock(newQuantity: number, reason: string): void {
    this._stockLevel = new StockLevel(newQuantity);
    this.touch();
  }

  public hasLowStock(productReorderPoint?: ReorderPoint): boolean {
    const threshold = this._reorderPoint || productReorderPoint;
    if (!threshold) return false;
    return this._stockLevel.value <= threshold.value;
  }

  public isOutOfStock(): boolean {
    return this._stockLevel.value === 0;
  }

  public updatePricing(costPrice: number, sellingPrice: number): void {
    this._costPrice = new Price(costPrice);
    this._sellingPrice = new Price(sellingPrice);
    this.touch();
  }

  public getMargin(): number {
    return this._sellingPrice.value - this._costPrice.value;
  }

  public getMarginPercentage(): number {
    if (this._costPrice.value === 0) return 0;
    return (this.getMargin() / this._costPrice.value) * 100;
  }

  // Getters
  get productId(): string {
    return this._productId;
  }
  get sku(): SKU {
    return this._sku;
  }
  get attributes(): VariantAttributes {
    return this._attributes;
  }
  get costPrice(): Price {
    return this._costPrice;
  }
  get sellingPrice(): Price {
    return this._sellingPrice;
  }
  get currentStock(): number {
    return this._stockLevel.value;
  }
  get reorderPoint(): ReorderPoint | undefined {
    return this._reorderPoint;
  }
  get supplierInfo(): Record<string, any> | undefined {
    return this._supplierInfo;
  }
  get etimsItemCode(): string | undefined {
    return this._etimsItemCode;
  }

  static fromPersistence(props: {
    id: string;
    productId: string;
    sku: string;
    attributes: Record<string, string>;
    costPrice: number;
    sellingPrice: number;
    currentStock: number;
    reorderPoint?: number;
    supplierInfo?: Record<string, any>;
    etimsItemCode?: string;
  }): ProductVariant {
    return new ProductVariant({
      id: props.id,
      productId: props.productId,
      sku: new SKU(props.sku),
      attributes: props.attributes,
      costPrice: new Price(props.costPrice),
      sellingPrice: new Price(props.sellingPrice),
      stockLevel: new StockLevel(props.currentStock),
      reorderPoint: props.reorderPoint ? new ReorderPoint(props.reorderPoint) : undefined,
      supplierInfo: props.supplierInfo,
      etimsItemCode: props.etimsItemCode,
    });
  }
}
