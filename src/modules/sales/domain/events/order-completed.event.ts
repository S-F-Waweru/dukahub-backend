export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly merchantId: string,
    public readonly customerId?: string,
    public readonly totalAmount: number,
  ) {}
}
