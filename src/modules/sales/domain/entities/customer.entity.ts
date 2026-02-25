import { Email } from '../value-objects/email.vo';
import { PhoneNumber } from '../value-objects/phone-number.vo';
import { Money } from '../value-objects/money.vo';
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exeption';

export class Customer extends BaseEntity {
  private readonly _merchantId: string;
  private readonly _phoneNumber: PhoneNumber;
  private readonly _email?: Email;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private _totalSpent: Money;
  private _orderCount: number;
  private _firstOrderAt?: Date;
  private _lastOrderAt?: Date;

  private constructor(props: {
    id?: string;
    merchantId: string;
    phoneNumber: PhoneNumber;
    firstName: string;
    lastName: string;
    email?: Email;
    totalSpent?: Money;
    orderCount?: number;
    firstOrderAt?: Date;
    lastOrderAt?: Date;
  }) {
    super(props.id);
    this._merchantId = props.merchantId;
    this._phoneNumber = props.phoneNumber;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._totalSpent = props.totalSpent || Money.zero();
    this._orderCount = props.orderCount || 0;
    this._firstOrderAt = props.firstOrderAt;
    this._lastOrderAt = props.lastOrderAt;

    this.validate();
  }

  static create(props: {
    merchantId: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
  }): Customer {
    return new Customer({
      merchantId: props.merchantId,
      phoneNumber: new PhoneNumber(props.phoneNumber),
      firstName: props.firstName,
      lastName: props.lastName,
      email: props.email ? new Email(props.email) : undefined,
    });
  }

  static fromPersistence(props: {
    id: string;
    merchantId: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    totalSpent: number;
    orderCount: number;
    firstOrderAt?: Date;
    lastOrderAt?: Date;
  }): Customer {
    return new Customer({
      id: props.id,
      merchantId: props.merchantId,
      phoneNumber: new PhoneNumber(props.phoneNumber),
      firstName: props.firstName,
      lastName: props.lastName,
      email: props.email ? new Email(props.email) : undefined,
      totalSpent: new Money(props.totalSpent),
      orderCount: props.orderCount,
      firstOrderAt: props.firstOrderAt,
      lastOrderAt: props.lastOrderAt,
    });
  }

  private validate(): void {
    if (!this._merchantId) {
      throw new DomainException('Merchant ID is required');
    }
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new DomainException('First name is required');
    }
    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new DomainException('Last name is required');
    }
  }

  // Business Logic
  public recordOrder(orderTotal: Money): void {
    this._totalSpent = this._totalSpent.add(orderTotal);
    this._orderCount += 1;
    this._lastOrderAt = new Date();
    if (!this._firstOrderAt) {
      this._firstOrderAt = new Date();
    }
    this.touch();
  }

  public getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public isReturningCustomer(): boolean {
    return this._orderCount > 1;
  }

  public getLifetimeValue(): number {
    return this._totalSpent.value;
  }

  public getDaysSinceLastOrder(): number | null {
    if (!this._lastOrderAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this._lastOrderAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Getters
  get merchantId(): string {
    return this._merchantId;
  }
  get phoneNumber(): PhoneNumber {
    return this._phoneNumber;
  }
  get email(): Email | undefined {
    return this._email;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get totalSpent(): Money {
    return this._totalSpent;
  }
  get orderCount(): number {
    return this._orderCount;
  }
  get firstOrderAt(): Date | undefined {
    return this._firstOrderAt;
  }
  get lastOrderAt(): Date | undefined {
    return this._lastOrderAt;
  }
}
