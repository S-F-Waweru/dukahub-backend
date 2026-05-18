import { BusinessName } from '../value-objects/business-name.vo';
import { MerchantType } from '../enums/merchant-type.enum';
import { KraPin } from '../value-objects/kra-pin.vo';
import { MerchantStatus } from '../enums/merchant-status.enum';
import { BaseEntity } from '../../../../shared/domain/base.entity';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class Merchant extends BaseEntity {
  // todo : remove the payment configuration
  // todo remove the  payment configuration to its own service  and store for multiple stores

  private _businessName: BusinessName;
  private _type: MerchantType;
  private _phoneNumber: string;
  private _email: string;
  private _physicalAddress?: string;
  private _kraPin?: KraPin;
  private _mpesaTill?: string;
  private _airtelMoneyNumber?: string;
  private _status: MerchantStatus;
  private _subscriptionTier: string;
  private _onboardedAt: Date;

  private constructor(props: {
    id?: string;
    businessName: BusinessName;
    type: MerchantType;
    phoneNumber: string;
    email: string;
    physicalAddress?: string;
    kraPin?: KraPin;
    mpesaTill?: string;
    airtelMoneyNumber?: string;
    status?: MerchantStatus;
    subscriptionTier?: string;
    onboardedAt?: Date;
  }) {
    super(props.id);
    this._businessName = props.businessName;
    this._type = props.type;
    this._phoneNumber = props.phoneNumber;
    this._email = props.email;
    this._physicalAddress = props.physicalAddress;
    this._kraPin = props.kraPin;
    this._mpesaTill = props.mpesaTill;
    this._airtelMoneyNumber = props.airtelMoneyNumber;
    this._status = props.status || MerchantStatus.ACTIVE;
    this._subscriptionTier = props.subscriptionTier || 'FREE';
    this._onboardedAt = props.onboardedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this._phoneNumber) {
      throw new DomainException('Phone number is required');
    }

    if (!this._email) {
      throw new DomainException('Email is required');
    }

    // Kenyan phone number validation
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(this._phoneNumber)) {
      throw new DomainException('Invalid Kenyan phone number format');
    }
  }

  static create(
    businessName: string,
    type: MerchantType,
    phoneNumber: string,
    email: string,
    id?: string,
  ): Merchant {
    return new Merchant({
      id: id ? id : undefined,
      businessName: new BusinessName(businessName),
      type,
      phoneNumber,
      email,
    });
  }

  static fromPersistence(props: {
    id: string;
    businessName: string;
    type: MerchantType;
    phoneNumber: string;
    email: string;
    physicalAddress?: string;
    kraPin?: string;
    mpesaTill?: string;
    airtelMoneyNumber?: string;
    status: MerchantStatus;
    subscriptionTier: string;
    onboardedAt: Date;
  }): Merchant {
    return new Merchant({
      id: props.id,
      businessName: new BusinessName(props.businessName),
      type: props.type,
      phoneNumber: props.phoneNumber,
      email: props.email,
      physicalAddress: props.physicalAddress,
      kraPin: props.kraPin ? new KraPin(props.kraPin) : undefined,
      mpesaTill: props.mpesaTill,
      airtelMoneyNumber: props.airtelMoneyNumber,
      status: props.status,
      subscriptionTier: props.subscriptionTier,
      onboardedAt: props.onboardedAt,
    });
  }

  // Business Rules
  public activate(): void {
    if (this._status === MerchantStatus.ACTIVE) {
      throw new DomainException('Merchant is already active');
    }
    this._status = MerchantStatus.ACTIVE;
    this.touch();
  }

  public suspend(reason?: string): void {
    if (this._status === MerchantStatus.SUSPENDED) {
      throw new DomainException('Merchant is already suspended');
    }
    this._status = MerchantStatus.SUSPENDED;
    this.touch();
  }

  public deactivate(): void {
    this._status = MerchantStatus.INACTIVE;
    this.touch();
  }

  public isActive(): boolean {
    return this._status === MerchantStatus.ACTIVE;
  }

  public updatePaymentInfo(mpesaTill?: string, airtelMoney?: string): void {
    this._mpesaTill = mpesaTill;
    this._airtelMoneyNumber = airtelMoney;
    this.touch();
  }

  public updateBusinessInfo(
    businessName?: string,
    physicalAddress?: string,
    kraPin?: string,
  ): void {
    if (businessName) {
      this._businessName = new BusinessName(businessName);
    }
    if (physicalAddress !== undefined) {
      this._physicalAddress = physicalAddress;
    }
    if (kraPin !== undefined) {
      this._kraPin = kraPin ? new KraPin(kraPin) : undefined;
    }
    this.touch();
  }

  public upgradeSubscription(tier: string): void {
    const validTiers = ['FREE', 'BASIC', 'PREMIUM'];
    if (!validTiers.includes(tier)) {
      throw new DomainException('Invalid subscription tier');
    }
    this._subscriptionTier = tier;
    this.touch();
  }

  public hasPaymentMethod(): boolean {
    return !!(this._mpesaTill || this._airtelMoneyNumber);
  }

  public isEtimsReady(): boolean {
    return !!this._kraPin;
  }

  // Getters
  get businessName(): BusinessName {
    return this._businessName;
  }
  get type(): MerchantType {
    return this._type;
  }
  get phoneNumber(): string {
    return this._phoneNumber;
  }
  get email(): string {
    return this._email;
  }
  get physicalAddress(): string | undefined {
    return this._physicalAddress;
  }
  get kraPin(): KraPin | undefined {
    return this._kraPin;
  }
  get mpesaTill(): string | undefined {
    return this._mpesaTill;
  }
  get airtelMoneyNumber(): string | undefined {
    return this._airtelMoneyNumber;
  }
  get status(): MerchantStatus {
    return this._status;
  }
  get subscriptionTier(): string {
    return this._subscriptionTier;
  }
  get onboardedAt(): Date {
    return this._onboardedAt;
  }
}
