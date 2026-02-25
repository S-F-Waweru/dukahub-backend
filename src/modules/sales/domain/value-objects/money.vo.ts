export class Money {
  private readonly _value: number;
  private readonly _currency: string;

  constructor(value: number, currency: string = 'KES') {
    this.validate(value);
    this._value = Math.round(value * 100) / 100; // Round to 2 decimals
    this._currency = currency;
  }

  private validate(value: number): void {
    if (value < 0) {
      throw new Error('Money cannot be negative');
    }
    if (!Number.isFinite(value)) {
      throw new Error('Money must be a finite number');
    }
  }

  static zero(): Money {
    return new Money(0);
  }

  get value(): number {
    return this._value;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this._value + other._value, this._currency);
  }

  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this._value - other._value, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor, this._currency);
  }

  equals(other: Money): boolean {
    return this._value === other._value && this._currency === other._currency;
  }

  isGreaterThan(other: Money): boolean {
    return this._value > other._value;
  }

  isLessThan(other: Money): boolean {
    return this._value < other._value;
  }
}
