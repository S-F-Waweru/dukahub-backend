import { BaseEntity } from '../../../../shared/domain/base.entity';
import { Money } from '../value-objects/money.vo';
import { Quantity } from '../value-objects/quantity.vo';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class OrderItem extends BaseEntity {
  private _orderId: string;
  private _variantId: string; // Link to ProductVariant
  private _productName: string; // Snapshot at time of order
  private _sku: string; // Snapshot at time of order
  private _unitPrice: Money; // Snapshot at time of order
  private _quantity: Quantity;
  private _subtotal: Money;
  private _taxAmount?: Money;

  private constructor(props: {
    id?: string;
    orderId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: Money;
    quantity: Quantity;
    taxAmount?: Money;
  }) {
    super(props.id);
    this._orderId = props.orderId;
    this._variantId = props.variantId;
    this._productName = props.productName;
    this._sku = props.sku;
    this._unitPrice = props.unitPrice;
    this._quantity = props.quantity;
    this._taxAmount = props.taxAmount;
    this._subtotal = this.calculateSubtotal();

    this.validate();
  }

  static create(props: {
    orderId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    taxAmount?: number;
  }): OrderItem {
    return new OrderItem({
      orderId: props.orderId,
      variantId: props.variantId,
      productName: props.productName,
      sku: props.sku,
      unitPrice: new Money(props.unitPrice),
      quantity: new Quantity(props.quantity),
      taxAmount: props.taxAmount ? new Money(props.taxAmount) : undefined,
    });
  }

  static fromPersistence(props: {
    id: string;
    orderId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    taxAmount?: number;
  }): OrderItem {
    return new OrderItem({
      id: props.id,
      orderId: props.orderId,
      variantId: props.variantId,
      productName: props.productName,
      sku: props.sku,
      unitPrice: new Money(props.unitPrice),
      quantity: new Quantity(props.quantity),
      taxAmount: props.taxAmount ? new Money(props.taxAmount) : undefined,
    });
  }

  private validate(): void {
    if (!this._orderId) {
      throw new DomainException('Order ID is required');
    }
    if (!this._variantId) {
      throw new DomainException('Variant ID is required');
    }
  }

  private calculateSubtotal(): Money {
    return this._unitPrice.multiply(this._quantity.value);
  }

  // Getters
  get orderId(): string {
    return this._orderId;
  }
  get variantId(): string {
    return this._variantId;
  }
  get productName(): string {
    return this._productName;
  }
  get sku(): string {
    return this._sku;
  }
  get unitPrice(): Money {
    return this._unitPrice;
  }
  get quantity(): Quantity {
    return this._quantity;
  }
  get subtotal(): Money {
    return this._subtotal;
  }
  get taxAmount(): Money | undefined {
    return this._taxAmount;
  }
}
