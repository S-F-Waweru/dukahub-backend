import { Injectable, Inject } from '@nestjs/common';
import { PaymentProviderRegistry } from '../services/payment-provider.registry';
import { Transaction } from '../../domain/entities/transaction.entity';
import { PaymentAlreadyCompletedException } from '../../domain/exceptions/payment.exceptions';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';
import { PaymentMethod } from '../../domain/enums/payament.enum';

export interface InitiatePaymentDto {
  orderId: string;
  merchantId: string; // from JWT (set by JwtAuthGuard for staff)
  // or from order lookup (for unauthenticated storefront)
  amount: number;
  method: PaymentMethod;
  phoneNumber?: string; // required for MPESA_STK, AIRTEL_MONEY
  orderNumber: string; // for accountReference shown on phone prompt
}

@Injectable()
export class InitiatePaymentUseCase {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(dto: InitiatePaymentDto) {
    // 1. Guard: ensure no completed payment exists for this order
    const existing = await this.transactionRepo.findByOrderId(dto.orderId);
    if (existing?.isCompleted) {
      throw new PaymentAlreadyCompletedException(dto.orderId);
    }

    // 2. Get provider — no use case change when new provider added
    const provider = this.registry.get(dto.method);

    // 3. Initiate with provider
    const result = await provider.initiate({
      orderId: dto.orderId,
      merchantId: dto.merchantId,
      amount: dto.amount,
      phoneNumber: dto.phoneNumber,
      accountReference: dto.orderNumber,
    });

    // 4. Create domain entity
    const transaction = Transaction.initiate({
      orderId: dto.orderId,
      merchantId: dto.merchantId,
      method: dto.method,
      amount: dto.amount,
      providerTransactionId: result.providerTransactionId,
    });

    await this.transactionRepo.save(transaction);

    return {
      transactionId: transaction.id,
      providerTransactionId: result.providerTransactionId,
      instructions: result.instructions,
      checkoutUrl: result.checkoutUrl,
    };
  }
}
