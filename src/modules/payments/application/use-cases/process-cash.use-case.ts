import { Injectable, Inject } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import { PaymentAlreadyCompletedException } from '../../domain/exceptions/payment.exceptions';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';
// import { EventBus } from '../../../../shared/infrastructure/messaging/event-bus.service';

export interface ProcessCashDto {
  orderId: string;
  merchantId: string; // from JWT
  amount: number;
}

@Injectable()
export class ProcessCashUseCase {
  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
    // private readonly eventBus: EventBus,
  ) {}

  async execute(dto: ProcessCashDto) {
    const existing = await this.transactionRepo.findByOrderId(dto.orderId);
    if (existing?.isCompleted) {
      throw new PaymentAlreadyCompletedException(dto.orderId);
    }

    const transaction = Transaction.completeCash({
      orderId: dto.orderId,
      merchantId: dto.merchantId,
      amount: dto.amount,
    });

    await this.transactionRepo.save(transaction);

    //todo
    // Publish domain events → Sales Module marks order PAID
    // for (const event of transaction.domainEvents) {
    //   await this.eventBus.publish(event);
    // }
    // transaction.clearEvents();

    return { transactionId: transaction.id, status: transaction.status };
  }
}
