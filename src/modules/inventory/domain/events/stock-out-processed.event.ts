export class StockOutProcessedEvent {
  constructor(
    public readonly variantId: string,
    public readonly merchantId: string,
    public readonly quantity: number,
    public readonly totalValue: number, // For KES 10k trigger
    public readonly timestamp: Date = new Date(),
  ) {}
}
