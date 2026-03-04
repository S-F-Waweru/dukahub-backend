import { Injectable, Inject } from '@nestjs/common';
import {
  ITransactionRepository,
  TransactionFilters,
} from '../../domain/repositories/transcation.repository.interface';


@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(merchantId: string, filters: TransactionFilters) {
    return this.transactionRepo.findByMerchant(merchantId, filters);
  }
}
