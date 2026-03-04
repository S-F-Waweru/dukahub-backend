import { Injectable, Inject } from '@nestjs/common';

import { TransactionNotFoundException } from '../../domain/exceptions/payment.exceptions';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(transactionId: string, merchantId: string) {
    // merchantId enforces tenant isolation — can't see other merchants' transactions
    const transaction = await this.transactionRepo.findById(
      transactionId,
      merchantId,
    );
    if (!transaction) throw new TransactionNotFoundException(transactionId);
    return transaction;
  }
}
