import { BaseEntity } from 'src/shared/domain/base.entity';
import { BadRequestException } from '@nestjs/common';

export class EmailVerificationToken extends BaseEntity {
  private _tokenHash: string;
  private _userId: string;
  private _expiresAt: Date;
  private _isUsed: boolean;
  private _usedAt?: Date;

  // ✅ Change to private constructor
  private constructor(props: {
    id?: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    isUsed?: boolean;
    usedAt?: Date;
  }) {
    super(props.id);
    this._tokenHash = props.tokenHash;
    this._userId = props.userId;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed || false;
    this._usedAt = props.usedAt;

    this.validate();
  }

  // ✅ Add factory method for new tokens
  static create(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
  ): EmailVerificationToken {
    return new EmailVerificationToken({
      tokenHash,
      userId,
      expiresAt,
    });
  }

  // ✅ Add fromPersistence for database reconstitution
  static fromPersistence(props: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
  }): EmailVerificationToken {
    return new EmailVerificationToken({
      id: props.id,
      tokenHash: props.tokenHash,
      userId: props.userId,
      expiresAt: props.expiresAt,
      isUsed: props.isUsed,
      usedAt: props.usedAt,
    });
  }

  private validate(): void {
    if (!this._tokenHash) {
      throw new BadRequestException('Token hash is required');
    }
    if (!this._userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!this._expiresAt) {
      throw new BadRequestException('Expiration date is required');
    }
    if (this._expiresAt <= new Date()) {
      throw new BadRequestException('Token must have a future expiration date');
    }
  }

  // Business methods
  public markAsUsed(): void {
    this._isUsed = true;
    this._usedAt = new Date();
    this.touch();
  }

  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  public isValid(): boolean {
    return !this._isUsed && !this.isExpired();
  }

  // Getters
  get tokenHash(): string {
    return this._tokenHash;
  }
  get userId(): string {
    return this._userId;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get isUsed(): boolean {
    return this._isUsed;
  }
  get usedAt(): Date | undefined {
    return this._usedAt;
  }
}
