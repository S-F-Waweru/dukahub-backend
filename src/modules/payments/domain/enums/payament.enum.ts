export enum PaymentMethod {
  // MVP — build these
  MPESA_STK = 'MPESA_STK', // Daraja STK Push — local Kenya
  CASH = 'CASH', // Walk-in, no provider

  // Phase 2 — add adapter file + register, nothing else changes
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  MPESA_GLOBAL = 'MPESA_GLOBAL', // M-Pesa Global (diaspora)

  // Phase 3
  CARD = 'CARD', // Flutterwave / Stripe
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  /**
   * CANCELLED: used when the order itself is cancelled
   * before payment completes (e.g. owner cancels order
   * while M-Pesa STK is still pending).
   */
  CANCELLED = 'CANCELLED',
}