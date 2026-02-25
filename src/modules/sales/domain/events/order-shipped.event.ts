export class OrderShippedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly deliveryAddress: any,
  ) {}
}
