export class PaymentCompletedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly orderId: string,
    public readonly merchantId: string,
    public readonly amount: number,
    public readonly receiptNumber: string,
  ) {}
}

// src/modules/payment/domain/events/payment-failed.event.ts
export class PaymentFailedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly orderId: string,
    public readonly merchantId: string,
    public readonly reason: string,
  ) {}
}
