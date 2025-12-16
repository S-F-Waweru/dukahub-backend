export class Price {
  constructor(private readonly amount: number) {}
  equals(other: Price) {}
  add(value: Price) {}
  subtract(value: Price) {}
  multiply(factor: number) {}
}
