// src/modules/payments/presentation/dto/mpesa-callback.dto.ts
import { IsObject } from 'class-validator';

/**
 * Daraja sends a deeply nested payload we cannot fully validate
 * with class-validator decorators without risking stripping/rejecting
 * valid fields (global ValidationPipe has whitelist: true).
 *
 * Strategy:
 *  - Accept the top-level `Body` object loosely
 *  - Store the entire raw payload in providerResponse (DB audit trail)
 *  - Parse and validate the contents inside MpesaStkAdapter.parseCallback()
 *    where we control the logic and can handle missing fields gracefully
 */

// ─── Nested shape classes (for documentation + partial type safety) ─────────
// These are NOT strictly validated — they document what Daraja sends.

class CallbackMetadataItem {
  Name: string; // "Amount" | "MpesaReceiptNumber" | "Balance" | "TransactionDate" | "PhoneNumber"
  Value?: string | number; // Balance item comes with no Value — always use optional
}

class CallbackMetadata {
  Item: CallbackMetadataItem[];
}

class StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number; // 0 = success, anything else = failure
  ResultDesc: string;
  CallbackMetadata?: CallbackMetadata; // ONLY present on success (ResultCode 0)
}

class MpesaCallbackBody {
  stkCallback: StkCallback;
}

// ─── Main DTO ─────────────────────────────────────────────────────────────────

export class MpesaCallbackDto {
  @IsObject()
  Body: MpesaCallbackBody;
}
