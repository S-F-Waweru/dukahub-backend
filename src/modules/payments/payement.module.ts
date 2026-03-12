import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionSchema } from './infrastructure/persistence/typeorm/transaction.schema';

// MVP Adapters

// Phase 2: import { AirtelMoneyAdapter } from './infrastructure/adapters/airtel-money.adapter';
// Phase 2: import { MpesaGlobalAdapter } from './infrastructure/adapters/mpesa-global.adapter';
// Phase 3: import { CardFlutterwaveAdapter } from './infrastructure/adapters/card-flutterwave.adapter';

import { PaymentProviderRegistry } from './application/services/payment-provider.registry';
import { InitiatePaymentUseCase } from './application/use-cases/initiate-payment.use-case';
import { ProcessCashUseCase } from './application/use-cases/process-cash.use-case';
import { HandleCallbackUseCase } from './application/use-cases/handle-callback.use-case';
import { GetPaymentStatusUseCase } from './application/use-cases/get-payment-status.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { ReconcilePaymentUseCase } from './application/use-cases/reconcile-payment.use-case';
import { PaymentController } from './presentation/controllers/payment.controller';
import { ITransactionRepository } from './domain/repositories/transcation.repository.interface';
import { MpesaStkAdapter } from './infrastructure/adapters/mpesa-stk.adapter';
import { TransactionRepository } from './infrastructure/repositories/transaction.repository';
import { HttpModule } from '@nestjs/axios';

const useCases = [
  InitiatePaymentUseCase,
  ProcessCashUseCase,
  HandleCallbackUseCase,
  GetPaymentStatusUseCase,
  GetTransactionsUseCase,
  GetTransactionUseCase,
  ReconcilePaymentUseCase,
];

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TransactionSchema])],
  controllers: [PaymentController],
  providers: [
    PaymentProviderRegistry,
    MpesaStkAdapter,
    // AirtelMoneyAdapter,     // Phase 2
    // MpesaGlobalAdapter,     // Phase 2
    // CardFlutterwaveAdapter, // Phase 3
    ...useCases,

    {
      provide: ITransactionRepository,
      useClass: TransactionRepository,
    },
  ],
  exports: [InitiatePaymentUseCase, ProcessCashUseCase],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly mpesaStk: MpesaStkAdapter,
    // private readonly airtel: AirtelMoneyAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.mpesaStk);
    // this.registry.register(this.airtel); // Phase 2
  }
}
