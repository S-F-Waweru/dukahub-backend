export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly merchantId: string,
    public readonly customerId?: string,
    public readonly total: number,
    public readonly channel: string,
  ) {}
}
