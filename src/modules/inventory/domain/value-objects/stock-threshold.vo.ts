export class StockThreshold {
  constructor(private readonly value: number) {}
  isBreached(currentQuantity: number) {}
  equals(other: StockThreshold) {}
}
