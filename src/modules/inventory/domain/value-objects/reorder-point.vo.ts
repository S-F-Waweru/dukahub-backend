// domain/value-objects/reorder-point.vo.ts

import { DomainException } from "src/shared/domain/exceptions/domain.exeption";

export class ReorderPoint {
  private readonly _value: number;

  constructor(value: number) {
    this._value = Math.floor(value);
    this.validate();
  }

  private validate(): void {
    if (this._value < 0) {
      throw new DomainException('Reorder point cannot be negative');
    }
  }

  get value(): number {
    return this._value;
  }
}
