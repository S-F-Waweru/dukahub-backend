import { BaseEntity } from 'src/shared/domain/base.entity';
import { DomainException } from 'src/shared/domain/exceptions/domain.exeption';

export class StockMovement extends BaseEntity {
  private _variantId: string;
  private _merchantId: string;
  private _movementType: MovementType;
  private _quantity: number;
  private _previousStock: number;
  private _newStock: number;
  private _unitCost?: number;
  private _referenceType?: string; // 'ORDER', 'PURCHASE', 'MANUAL'
  private _referenceId?: string;
  private _performedBy: string; // userId
  private _notes?: string;

  private constructor(props: {
    id?: string;
    variantId: string;
    merchantId: string;
    movementType: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    performedBy: string;
    notes?: string;
  }) {
    super(props.id);
    Object.assign(this, props);
    this.validate();
  }

  static create(
    variantId: string,
    merchantId: string,
    movementType: MovementType,
    quantity: number,
    previousStock: number,
    newStock: number,
    performedBy: string,
    unitCost?: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
  ): StockMovement {
    return new StockMovement({
      variantId,
      merchantId,
      movementType,
      quantity,
      previousStock,
      newStock,
      unitCost,
      referenceType,
      referenceId,
      performedBy,
      notes,
    });
  }

  private validate(): void {
    if (this._quantity <= 0) {
      throw new DomainException('Movement quantity must be positive');
    }
  }

  get variantId(): string {
    return this._variantId;
  }
  get merchantId(): string {
    return this._merchantId;
  }
  get movementType(): MovementType {
    return this._movementType;
  }
  get quantity(): number {
    return this._quantity;
  }
  get previousStock(): number {
    return this._previousStock;
  }
  get newStock(): number {
    return this._newStock;
  }
  get performedBy(): string {
    return this._performedBy;
  }
}

export enum MovementType {
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
}
