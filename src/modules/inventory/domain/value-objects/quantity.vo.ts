export class Quantity {
  constructor(private readonly value: number) {}
  increase(amount: number) {}
  decrease(amount: number) {}
  equals(other: Quantity) {}
  isZero() {}
}
