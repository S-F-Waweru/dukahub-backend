import { BaseEntity } from 'src/shared/domain/base.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { AuthProvider } from '../enums/auth-provier.enums';
import { UserStatus } from '../enums/user-status.enums';
import { BadRequestException } from '@nestjs/common';

export class User extends BaseEntity {
  private _email: Email;
  private _password: Password | undefined;
  private _firstName: string;
  private _lastName: string;
  private _merchantId: string;
  private _authProvider: AuthProvider;
  private _isEmailVerified: boolean;
  private _status: UserStatus;
  private _lastLoginAt: Date | undefined;

  private constructor(props: {
    id?: string;
    email: Email;
    password?: Password;
    firstName: string;
    lastName: string;
    merchantId: string;
    authProvider?: AuthProvider;
    isEmailVerified?: boolean;
    status?: UserStatus;
    lastLoginAt?: Date;
  }) {
    super(props.id);
    this._email = props.email;
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._merchantId = props.merchantId;
    this._authProvider = props.authProvider || AuthProvider.LOCAL;
    this._isEmailVerified = props.isEmailVerified || false;
    this._status = props.status || UserStatus.ACTIVE;
    this._lastLoginAt = props.lastLoginAt;

    this.validate();
  }

  static create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    merchantId: string,
  ): User {
    if (password === undefined || password === null) {
      throw new BadRequestException('Password cannot be undefined or null');
    }

    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    return new User({
      email: emailVO,
      password: passwordVO,
      firstName,
      lastName,
      merchantId,
    });
  }

  static fromPersistence(props: {
    id: string;
    email: string; // ✅ Change to string (from database)
    hashedPassword?: string; // ✅ Also change to string
    firstName: string;
    lastName: string;
    merchantId: string;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    status: UserStatus;
    lastLoginAt?: Date;
  }): User {
    return new User({
      id: props.id,
      email: new Email(props.email), // ✅ Now props.email is string
      password: props.hashedPassword
        ? new Password(props.hashedPassword, true) // ✅ Now props.hashedPassword is string
        : undefined,
      firstName: props.firstName,
      lastName: props.lastName,
      merchantId: props.merchantId,
      authProvider: props.authProvider,
      isEmailVerified: props.isEmailVerified,
      status: props.status,
      lastLoginAt: props.lastLoginAt,
    });
  }

  private validate(): void {
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new BadRequestException('First name is required');
    }
    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new BadRequestException('Last name is required');
    }
    if (!this._merchantId) {
      throw new BadRequestException('Merchant ID is required');
    }
    if (this._authProvider === AuthProvider.LOCAL && !this._password) {
      throw new BadRequestException('Password is required for local authentication');
    }
  }

  // Business Rules
  public verifyEmail(): void {
    this._isEmailVerified = true;
    this.touch();
  }

  public changePassword(newPassword: Password): void {
    this._password = newPassword;
    this.touch();
  }

  public activate(): void {
    this._status = UserStatus.ACTIVE;
    this.touch();
  }

  public deactivate(): void {
    this._status = UserStatus.INACTIVE;
    this.touch();
  }

  public suspend(): void {
    this._status = UserStatus.SUSPENDED;
    this.touch();
  }

  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  public canLogin(): boolean {
    return this._status === UserStatus.ACTIVE && this._isEmailVerified;
  }

  public getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  // Getters
  get email(): Email {
    return this._email;
  }
  get password(): Password | undefined {
    return this._password;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get merchantId(): string {
    return this._merchantId;
  }
  get authProvider(): AuthProvider {
    return this._authProvider;
  }
  get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }
  get status(): UserStatus {
    return this._status;
  }
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }
}
