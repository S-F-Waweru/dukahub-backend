import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class Price {
  private readonly _value: number;

  constructor(value: number) {
    this._value = Math.round(value * 100) / 100; // 2 decimal places
    this.validate();
  }

  private validate(): void {
    if (this._value < 0) {
      throw new DomainException('Price cannot be negative');
    }
    if (this._value > 10000000) {
      throw new DomainException('Price exceeds maximum allowed');
    }
  }

  get value(): number {
    return this._value;
  }
}
