export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly merchantId: string,
    public readonly reason: string,
  ) {}
}
