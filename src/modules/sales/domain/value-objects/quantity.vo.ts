export class Quantity {
  private readonly _value: number;

  constructor(value: number) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: number): void {
    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be a whole number');
    }
    if (value <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (value > 10000) {
      throw new Error('Quantity exceeds maximum allowed (10,000)');
    }
  }

  get value(): number {
    return this._value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  equals(other: Quantity): boolean {
    return this._value === other._value;
  }
}
