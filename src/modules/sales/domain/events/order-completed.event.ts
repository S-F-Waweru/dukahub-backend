export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly merchantId: string,
    public readonly totalAmount: number | undefined,
    public readonly customerId?: string,
  ) {}
}
