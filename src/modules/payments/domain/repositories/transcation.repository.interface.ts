import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/payament.enum';



export const ITransactionRepository = Symbol('ITransactionRepository');

export interface TransactionFilters {
  status?: TransactionStatus;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;

  findById(id: string, merchantId: string): Promise<Transaction | null>;
  findByOrderId(orderId: string): Promise<Transaction | null>;
  findByProviderTransactionId(
    providerTransactionId: string,
  ): Promise<Transaction | null>;

  findByMerchant(
    merchantId: string,
    filters?: TransactionFilters,
  ): Promise<{ data: Transaction[]; total: number }>;

  /** For reconciliation — finds PENDING transactions older than N minutes */
  findStalePending(
    merchantId: string | null, // null = all merchants (for background job)
    olderThanMinutes: number,
  ): Promise<Transaction[]>;
}
