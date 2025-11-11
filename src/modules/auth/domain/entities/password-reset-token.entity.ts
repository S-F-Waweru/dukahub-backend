import { BaseEntity } from 'src/shared/domain/base.entity';

export class PasswordResetToken extends BaseEntity {
  private _token: string;
  private _userId: string;
  private _expiresAt: Date;
  private _isUsed: boolean;
  private _usedAt?: Date;

  constructor(props: {
    id?: string;
    token: string;
    userId: string;
    expiresAt: Date;
    isUsed?: boolean;
    usedAt?: Date;
  }) {
    super(props.id);
    this._token = props.token;
    this._userId = props.userId;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed || false;
    this._usedAt = props.usedAt;
    this.validate();
  }

  private validate(): void {
    if (!this._token) throw new Error('Token cannot be empty');
    if (this._expiresAt <= new Date())
      throw new Error('Token cannot be expired');
  }

  markAsUsed(): void {
    this._isUsed = true;
    this._usedAt = new Date();
  }

  get token(): string {
    return this._token;
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
