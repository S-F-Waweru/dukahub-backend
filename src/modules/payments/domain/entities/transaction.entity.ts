import { BaseEntity } from '../../../../shared/domain/base.entity';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exeption';

import {
  PaymentCompletedEvent,
  PaymentFailedEvent,
} from '../events/payment-completed.event';
import { PaymentMethod, TransactionStatus } from '../enums/payament.enum';

export class Transaction extends BaseEntity {
  private readonly _orderId: string;
  private readonly _merchantId: string;
  private readonly _method: PaymentMethod;
  private readonly _amount: number;
  private _status: TransactionStatus;

  // Maps to payments table columns:
  private _providerTransactionId?: string; // → transaction_id
  private _providerReceiptNumber?: string; // → mpesa_receipt_number
  private _providerResponse?: string; // → provider_response (raw JSON)
  private _failureReason?: string; // → failure_reason

  private _paidAt?: Date;

  private _domainEvents: object[] = [];

  private constructor(props: {
    id?: string;
    orderId: string;
    merchantId: string;
    method: PaymentMethod;
    amount: number;
    status?: TransactionStatus;
    providerTransactionId?: string;
    providerReceiptNumber?: string;
    providerResponse?: string;
    failureReason?: string;
    paidAt?: Date;
  }) {
    super(props.id);
    this._orderId = props.orderId;
    this._merchantId = props.merchantId;
    this._method = props.method;
    this._amount = props.amount;
    this._status = props.status ?? TransactionStatus.PENDING;
    this._providerTransactionId = props.providerTransactionId;
    this._providerReceiptNumber = props.providerReceiptNumber;
    this._providerResponse = props.providerResponse;
    this._failureReason = props.failureReason;
    this._paidAt = props.paidAt;
    this.validate();
  }

  // ─── Factory Methods ─────────────────────────────────────────────────

  /**
   * Used for all async providers (M-Pesa STK, Airtel, Card).
   * Created PENDING — transitions to COMPLETED or FAILED via callback.
   */
  static initiate(props: {
    orderId: string;
    merchantId: string;
    method: PaymentMethod;
    amount: number;
    providerTransactionId: string;
  }): Transaction {
    return new Transaction({ ...props, status: TransactionStatus.PENDING });
  }

  /**
   * Used for CASH only.
   * Immediately COMPLETED — no external provider involved.
   */
  static completeCash(props: {
    orderId: string;
    merchantId: string;
    amount: number;
  }): Transaction {
    const tx = new Transaction({
      ...props,
      method: PaymentMethod.CASH,
      status: TransactionStatus.COMPLETED,
      paidAt: new Date(),
    });
    tx._domainEvents.push(
      new PaymentCompletedEvent(
        tx._id,
        tx._orderId,
        tx._merchantId,
        tx._amount,
        'CASH',
      ),
    );
    return tx;
  }

  /**
   * Rehydrate from DB row — used by repository.
   */
  static fromPersistence(props: {
    id: string;
    orderId: string;
    merchantId: string;
    method: PaymentMethod;
    amount: number;
    status: TransactionStatus;
    providerTransactionId?: string;
    providerReceiptNumber?: string;
    providerResponse?: string;
    failureReason?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    const tx = new Transaction(props);
    tx._createdAt = props.createdAt;
    tx._updatedAt = props.updatedAt;
    return tx;
  }

  // ─── Business Logic ───────────────────────────────────────────────────

  /**
   * Called by HandleCallbackUseCase when provider confirms success.
   */
  markAsCompleted(receiptNumber: string, rawResponse: string): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new DomainException(
        `Cannot complete transaction in status: ${this._status}`,
      );
    }
    this._status = TransactionStatus.COMPLETED;
    this._providerReceiptNumber = receiptNumber;
    this._providerResponse = rawResponse;
    this._paidAt = new Date();
    this.touch();

    this._domainEvents.push(
      new PaymentCompletedEvent(
        this._id,
        this._orderId,
        this._merchantId,
        this._amount,
        receiptNumber,
      ),
    );
  }

  /**
   * Called by HandleCallbackUseCase when provider reports failure.
   */
  markAsFailed(reason: string, rawResponse?: string): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new DomainException(
        `Cannot fail transaction in status: ${this._status}`,
      );
    }
    this._status = TransactionStatus.FAILED;
    this._failureReason = reason;
    this._providerResponse = rawResponse;
    this.touch();

    this._domainEvents.push(
      new PaymentFailedEvent(this._id, this._orderId, this._merchantId, reason),
    );
  }

  /**
   * Called when the order is cancelled before payment completes.
   * e.g. Owner cancels the order while STK Push is still pending.
   */
  cancel(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new DomainException(
        `Cannot cancel transaction in status: ${this._status}`,
      );
    }
    this._status = TransactionStatus.CANCELLED;
    this.touch();
  }

  // ─── Validation ───────────────────────────────────────────────────────

  private validate(): void {
    if (!this._orderId) {
      throw new DomainException('Order ID is required');
    }
    if (!this._merchantId) {
      throw new DomainException('Merchant ID is required');
    }
    if (this._amount <= 0) {
      throw new DomainException('Amount must be greater than zero');
    }
    if (
      this._method !== PaymentMethod.CASH &&
      this._status === TransactionStatus.PENDING &&
      !this._providerTransactionId
    ) {
      throw new DomainException(
        'Non-cash transactions require a providerTransactionId',
      );
    }
  }

  // ─── Getters ──────────────────────────────────────────────────────────

  get orderId(): string {
    return this._orderId;
  }
  get merchantId(): string {
    return this._merchantId;
  }
  get method(): PaymentMethod {
    return this._method;
  }
  get amount(): number {
    return this._amount;
  }
  get status(): TransactionStatus {
    return this._status;
  }
  get providerTransactionId(): string | undefined {
    return this._providerTransactionId;
  }
  get providerReceiptNumber(): string | undefined {
    return this._providerReceiptNumber;
  }
  get providerResponse(): string | undefined {
    return this._providerResponse;
  }
  get failureReason(): string | undefined {
    return this._failureReason;
  }
  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get isPending(): boolean {
    return this._status === TransactionStatus.PENDING;
  }
  get isCompleted(): boolean {
    return this._status === TransactionStatus.COMPLETED;
  }
  get isFailed(): boolean {
    return this._status === TransactionStatus.FAILED;
  }
  get isCancelled(): boolean {
    return this._status === TransactionStatus.CANCELLED;
  }

  get domainEvents(): object[] {
    return [...this._domainEvents];
  }
  clearEvents(): void {
    this._domainEvents.length = 0;
  }
}
