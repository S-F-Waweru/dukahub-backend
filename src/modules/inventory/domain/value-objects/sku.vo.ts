import { DomainException } from "src/shared/domain/exceptions/domain.exeption";

export class SKU {
  private readonly _value: string;
  constructor(value: string) {
    this._value = value.toUpperCase().trim();
    this.validate();
  }

  private validate(): void {
    if (!this._value || this._value.length === 0) {
      throw new DomainException('SKU cannot be empty');
    }
    if (this._value.length > 50) {
      throw new DomainException('SKU too long (max 50 chars)');
    }
    // Allow alphanumeric and dashes
    if (!/^[A-Z0-9-]+$/.test(this._value)) {
      throw new DomainException(
        'SKU can only contain letters, numbers, and dashes',
      );
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: SKU): boolean {
    return this._value === other._value;
  }
}
