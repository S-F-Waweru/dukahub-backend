// src/modules/payments/infrastructure/adapters/mpesa-stk.adapter.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentMethod } from '../../domain/enums/payament.enum';
import {
  IPaymentProvider,
  PaymentCallbackResult,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
} from '../../domain/interfaces/payment-provider.interface';

@Injectable()
export class MpesaStkAdapter implements IPaymentProvider {
  readonly method = PaymentMethod.MPESA_STK;

  // ─── Token Cache ──────────────────────────────────────────────────
  private cachedToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  // ─── IPaymentProvider Implementation ─────────────────────────────

  async initiate(
    req: PaymentInitiateRequest,
  ): Promise<PaymentInitiateResponse> {
    const token = await this.getAccessToken();

    const { data } = await firstValueFrom(
      this.http.post(
        `${this.config.get('MPESA_BASE_URL')}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.config.get('MPESA_SHORTCODE'),
          Password: this.generatePassword(),
          Timestamp: this.getTimestamp(),
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.ceil(req.amount),
          PartyA: req.phoneNumber,
          PartyB: this.config.get('MPESA_SHORTCODE'),
          PhoneNumber: req.phoneNumber,
          CallBackURL: req.callbackUrl ?? this.config.get('MPESA_CALLBACK_URL'),
          AccountReference: req.accountReference,
          TransactionDesc: req.accountReference, // max 13 chars — use order number only
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    return {
      providerTransactionId: data.CheckoutRequestID,
      instructions: 'Check your phone and enter your M-Pesa PIN',
      rawResponse: data,
    };
  }

  async parseCallback(
    payload: Record<string, unknown>,
  ): Promise<PaymentCallbackResult> {
    const cb = (payload as any)?.Body?.stkCallback;
    const success = cb?.ResultCode === 0;

    // CallbackMetadata is ONLY present on success — never access it on failure
    const items: any[] = cb?.CallbackMetadata?.Item ?? [];

    return {
      success,
      // Always find by Name — item order from Daraja is NOT guaranteed
      providerReceiptNumber: items.find((i) => i.Name === 'MpesaReceiptNumber')
        ?.Value,
      failureReason: !success ? cb?.ResultDesc : undefined,
      rawPayload: payload,
    };
  }

  async queryStatus(
    providerTransactionId: string,
  ): Promise<PaymentCallbackResult> {
    const token = await this.getAccessToken();

    const { data } = await firstValueFrom(
      this.http.post(
        `${this.config.get('MPESA_BASE_URL')}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.config.get('MPESA_SHORTCODE'),
          Password: this.generatePassword(),
          Timestamp: this.getTimestamp(),
          CheckoutRequestID: providerTransactionId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    // "500.001.1001" means still processing — do NOT mark as failed
    const stillProcessing = data.ResultCode === '500.001.1001';
    const success = data.ResultCode === '0';

    return {
      success,
      stillProcessing,
      failureReason: !success && !stillProcessing ? data.ResultDesc : undefined,
      rawPayload: data,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (60s buffer before expiry)
    if (
      this.cachedToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date(Date.now() + 60_000)
    ) {
      return this.cachedToken!;
    }

    const auth = Buffer.from(
      `${this.config.get('MPESA_CONSUMER_KEY')}:${this.config.get('MPESA_CONSUMER_SECRET')}`,
    ).toString('base64');

    const { data } = await firstValueFrom(
      this.http.get(
        `${this.config.get('MPESA_BASE_URL')}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` } },
      ),
    );

    this.cachedToken = data.access_token;
    this.tokenExpiresAt = new Date(
      Date.now() + parseInt(data.expires_in) * 1000,
    );

    return this.cachedToken!;
  }

  private generatePassword(): string {
    const ts = this.getTimestamp();
    return Buffer.from(
      `${this.config.get('MPESA_SHORTCODE')}${this.config.get('MPESA_PASSKEY')}${ts}`,
    ).toString('base64');
  }

  private getTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
  }
}
