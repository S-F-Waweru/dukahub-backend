export class ProductCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly merchantId: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
