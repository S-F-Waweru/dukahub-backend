export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly merchantId: string,
    public readonly paymentId: string,
    public readonly amount: number,
  ) {}
}
