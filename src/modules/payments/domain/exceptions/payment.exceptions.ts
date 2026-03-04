import { DomainException } from '../../../../shared/domain/exceptions/domain.exeption';

export class TransactionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Transaction ${id} not found`);
    this.name = 'TransactionNotFoundException';
  }
}

export class PaymentAlreadyCompletedException extends DomainException {
  constructor(orderId: string) {
    super(`Order ${orderId} already has a completed payment`);
    this.name = 'PaymentAlreadyCompletedException';
  }
}

export class UnsupportedPaymentMethodException extends DomainException {
  constructor(method: string) {
    super(`No registered provider for payment method: ${method}`);
    this.name = 'UnsupportedPaymentMethodException';
  }
}

export class CallbackTransactionNotFoundException extends DomainException {
  constructor(providerTransactionId: string) {
    super(
      `Callback received for unknown transaction: ${providerTransactionId}. ` +
        `Possible duplicate or replay.`,
    );
    this.name = 'CallbackTransactionNotFoundException';
  }
}
