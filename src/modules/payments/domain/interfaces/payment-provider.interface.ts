import { PaymentMethod } from '../enums/payament.enum';

export interface PaymentInitiateRequest {
  orderId: string;
  merchantId: string;
  amount: number; // KES, always
  phoneNumber?: string; // Required for mobile money
  accountReference: string; // Shown on M-Pesa prompt (e.g. 'ORD-2026-0042')
  callbackUrl?: string; // Override default if needed
}

export interface PaymentInitiateResponse {
  providerTransactionId: string; // e.g. ws_CO_XXXXXX (CheckoutRequestID)
  checkoutUrl?: string; // Card redirect flows only
  instructions?: string; // e.g. 'Enter your M-Pesa PIN'
  rawResponse: Record<string, unknown>;
}

export interface PaymentCallbackResult {
  success: boolean;
  stillProcessing?: boolean;
  providerReceiptNumber?: string; // e.g. QJK2XXXXXX from M-Pesa
  failureReason?: string;
  rawPayload: Record<string, unknown>;
}

/** Contract every provider adapter must implement */
export interface IPaymentProvider {
  readonly method: PaymentMethod;

  initiate(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  parseCallback(
    payload: Record<string, unknown>,
  ): Promise<PaymentCallbackResult>;
  queryStatus?(providerTransactionId: string): Promise<PaymentCallbackResult>;
}
