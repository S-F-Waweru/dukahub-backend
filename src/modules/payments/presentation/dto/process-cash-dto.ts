// src/modules/payment/presentation/dto/process-cash.dto.ts
import { IsNumber, IsUUID, Min } from 'class-validator';

export class ProcessCashDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  // merchantId NOT from body — taken from JWT in controller:
  // processCashUseCase.execute({ ...dto, merchantId: user.merchantId })
}
