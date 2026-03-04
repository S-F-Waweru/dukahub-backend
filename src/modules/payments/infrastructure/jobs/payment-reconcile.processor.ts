import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ReconcilePaymentUseCase } from '../../application/use-cases/reconcile-payment.use-case';

@Processor('payment-reconcile')
export class PaymentReconcileProcessor {
  constructor(private readonly reconcileUseCase: ReconcilePaymentUseCase) {}

  /**
   * Runs every 5 minutes (configured in payment.module.ts BullModule).
   * merchantId = null → checks ALL merchants (background sweep).
   */
  @Process('reconcile-stale')
  async handle(job: Job): Promise<void> {
    await this.reconcileUseCase.execute(null, 10);
  }
}
