// src/modules/payment/presentation/dto/initiate-payment.dto.ts
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentMethod } from '../../domain/enums/payament.enum';

export class InitiatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsString()
  orderNumber: string; // e.g. ORD-2026-0042 — shown on M-Pesa prompt

  @IsEnum(PaymentMethod)
  method: PaymentMethod; // MPESA_STK | AIRTEL_MONEY | CARD

  @IsNumber()
  @Min(1)
  amount: number;

  // Required for mobile money, optional for CARD (redirect flow)
  @IsOptional()
  @IsString()
  @Matches(/^(07|01|\+2547|\+2541|2547|2541)\d{8}$/, {
    message: 'Must be a valid Kenyan phone number e.g. 0712345678',
  })
  @Transform(({ value }) => formatKenyanPhone(value)) // normalise to 2547XXXXXXXX
  phoneNumber?: string;

  // merchantId is NOT taken from body — injected from JWT in use case
}

function formatKenyanPhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  return cleaned;
}
