import { Injectable, Inject } from '@nestjs/common';
import { PaymentProviderRegistry } from '../services/payment-provider.registry';

import { CallbackTransactionNotFoundException } from '../../domain/exceptions/payment.exceptions';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';
import { PaymentMethod } from '../../domain/enums/payament.enum';

export interface HandleCallbackDto {
  method: PaymentMethod;
  rawPayload: Record<string, unknown>;
}

@Injectable()
export class HandleCallbackUseCase {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(dto: HandleCallbackDto): Promise<void> {
    // 1. Parse via correct provider adapter
    const provider = this.registry.get(dto.method);
    const result = await provider.parseCallback(dto.rawPayload);

    // 2. Find the transaction by providerTransactionId
    //    (each provider embeds their transaction ref in the callback)
    const providerTransactionId = this.extractProviderTransactionId(
      dto.rawPayload,
      dto.method,
    );
    const transaction = await this.transactionRepo.findByProviderTransactionId(
      providerTransactionId,
    );

    if (!transaction) {
      throw new CallbackTransactionNotFoundException(providerTransactionId);
    }

    // 3. Transition domain entity state
    if (result.success) {
      transaction.markAsCompleted(
        result.providerReceiptNumber!,
        JSON.stringify(result.rawPayload),
      );
    } else {
      transaction.markAsFailed(
        result.failureReason ?? 'Payment failed',
        JSON.stringify(result.rawPayload),
      );
    }

    // 4. Persist
    await this.transactionRepo.update(transaction);


    // 5. todo => Publish domain events → Sales Module reacts
    // for (const event of transaction.domainEvents) {
    //   await this.eventBus.publish(event);
    // }
    // transaction.clearEvents();
  }

  private extractProviderTransactionId(
    payload: Record<string, unknown>,
    method: PaymentMethod,
  ): string {
    // Each provider puts their reference in a different field
    switch (method) {
      case PaymentMethod.MPESA_STK:
        return (payload as any)?.Body?.stkCallback?.CheckoutRequestID;
      case PaymentMethod.AIRTEL_MONEY:
        return (payload as any)?.transaction?.id;
      default:
        return (payload as any)?.id ?? (payload as any)?.reference;
    }
  }
}
