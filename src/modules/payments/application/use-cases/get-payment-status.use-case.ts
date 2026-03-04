import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';

@Injectable()
export class GetPaymentStatusUseCase {
  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(orderId: string) {
    const transaction = await this.transactionRepo.findByOrderId(orderId);
    if (!transaction) return { status: 'NOT_FOUND' };

    return {
      transactionId: transaction.id,
      status: transaction.status, // PENDING | COMPLETED | FAILED
      method: transaction.method,
      receiptNumber: transaction.providerReceiptNumber,
      failureReason: transaction.failureReason,
      paidAt: transaction.paidAt,
    };
  }
}
