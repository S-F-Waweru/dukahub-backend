import { Injectable, Inject } from '@nestjs/common';
import { PaymentProviderRegistry } from '../services/payment-provider.registry';
import { ITransactionRepository } from '../../domain/repositories/transcation.repository.interface';



@Injectable()
export class ReconcilePaymentUseCase {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  /**
   * merchantId = specific merchant (manual trigger by OWNER)
   * merchantId = null (Bull background job — checks all merchants)
   */
  async execute(merchantId: string | null, staleMins = 10): Promise<void> {
    const stale = await this.transactionRepo.findStalePending(
      merchantId,
      staleMins,
    );

    for (const transaction of stale) {
      const provider = this.registry.get(transaction.method);

      // Only providers with queryStatus support reconciliation
      if (!provider.queryStatus || !transaction.providerTransactionId) continue;

      const result = await provider.queryStatus(
        transaction.providerTransactionId,
      );

      if (result.success) {
        transaction.markAsCompleted(
          result.providerReceiptNumber!,
          JSON.stringify(result.rawPayload),
        );
      } else if (result.failureReason) {
        transaction.markAsFailed(
          result.failureReason,
          JSON.stringify(result.rawPayload),
        );
      }
      // If status still unknown, leave as PENDING for next cycle

      await this.transactionRepo.update(transaction);
    }
  }
}
