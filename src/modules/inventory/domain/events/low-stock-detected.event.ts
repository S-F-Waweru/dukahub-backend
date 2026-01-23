export class LowStockDetectedEvent {
  constructor(
    public readonly variantId: string,
    public readonly productId: string,
    public readonly merchantId: string,
    public readonly currentStock: number,
    public readonly reorderPoint: number,
    public readonly sku: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}