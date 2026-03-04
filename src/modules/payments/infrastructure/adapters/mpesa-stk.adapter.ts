import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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

  constructor(private readonly config: ConfigService) {}

  async initiate(
    req: PaymentInitiateRequest,
  ): Promise<PaymentInitiateResponse> {
    const token = await this.getAccessToken();
    const res = await axios.post(
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
        TransactionDesc: `Payment for ${req.accountReference}`,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return {
      providerTransactionId: res.data.CheckoutRequestID,
      instructions: 'Check your phone and enter your M-Pesa PIN',
      rawResponse: res.data,
    };
  }

  async parseCallback(
    payload: Record<string, unknown>,
  ): Promise<PaymentCallbackResult> {
    const cb = (payload as any)?.Body?.stkCallback;
    const success = cb?.ResultCode === 0;
    const items: any[] = cb?.CallbackMetadata?.Item ?? [];

    return {
      success,
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
    const res = await axios.post(
      `${this.config.get('MPESA_BASE_URL')}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: this.config.get('MPESA_SHORTCODE'),
        Password: this.generatePassword(),
        Timestamp: this.getTimestamp(),
        CheckoutRequestID: providerTransactionId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const success = res.data.ResultCode === '0';
    return {
      success,
      failureReason: !success ? res.data.ResultDesc : undefined,
      rawPayload: res.data,
    };
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.get('MPESA_CONSUMER_KEY')}:${this.config.get('MPESA_CONSUMER_SECRET')}`,
    ).toString('base64');
    const res = await axios.get(
      `${this.config.get('MPESA_BASE_URL')}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    return res.data.access_token;
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
      .slice(0, -3);
  }
}
