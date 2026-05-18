import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class StockLevel {
  private readonly _value: number;

  constructor(value: number) {
    this._value = Math.floor(value);
    this.validate();
  }

  private validate(): void {
    if (this._value < 0) {
      throw new DomainException('Stock cannot be negative');
    }
  }

  increase(quantity: number): StockLevel {
    return new StockLevel(this._value + quantity);
  }

  decrease(quantity: number): StockLevel {
    if (this._value < quantity) {
      throw new DomainException('Insufficient stock');
    }
    return new StockLevel(this._value - quantity);
  }

  get value(): number {
    return this._value;
  }
}
