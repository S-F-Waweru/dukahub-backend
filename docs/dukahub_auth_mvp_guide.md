# DukaHub Authentication System - Complete Clean Architecture Guide (MVP)

## 🎯 Project Goal
Build a production-ready Authentication System for DukaHub that demonstrates Clean Architecture principles with NestJS, TypeScript, and PostgreSQL. This is your MVP - secure, scalable, and ready to extend.

---

## 📚 What You'll Learn

### Clean Architecture Concepts:
- Domain Layer (User, Role, Permission entities + Business Rules)
- Application Layer (Use Cases: Register, Login, Assign Roles)
- Infrastructure Layer (TypeORM Repositories, JWT, Email)
- Presentation Layer (REST Controllers, Guards, Decorators)
- Dependency Injection & Inversion of Control

### NestJS Concepts:
- Modular architecture
- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- Guards & Decorators
- TypeORM for PostgreSQL
- Email integration
- Password hashing with bcrypt

### Security Concepts:
- JWT + Refresh Token pattern
- HttpOnly cookies
- Password hashing (bcrypt)
- Multi-tenancy (merchant isolation)
- Permission-based authorization

---

## 🗂️ Project Structure

```
src/
├── auth/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts              # User entity with business rules
│   │   │   ├── role.entity.ts              # Role entity
│   │   │   ├── permission.entity.ts        # Permission entity
│   │   │   └── refresh-token.entity.ts     # Token management
│   │   └── interfaces/
│   │       ├── user.repository.interface.ts
│   │       ├── role.repository.interface.ts
│   │       └── refresh-token.repository.interface.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login-user.use-case.ts
│   │   │   ├── refresh-token.use-case.ts
│   │   │   ├── verify-email.use-case.ts
│   │   │   ├── assign-role.use-case.ts
│   │   │   └── check-permission.use-case.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── assign-role.dto.ts
│   │   └── services/
│   │       ├── password-hasher.service.ts
│   │       └── token-generator.service.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── role.repository.ts
│   │   │   └── refresh-token.repository.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── roles.controller.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       ├── roles.decorator.ts
│   │       └── permissions.decorator.ts
│   │
│   └── auth.module.ts
│
├── shared/
│   └── domain/
│       └── base.entity.ts
│
└── app.module.ts
```

---

## 🚀 Step-by-Step Implementation

### **Phase 1: Setup (30 minutes)**

#### Step 1.1: Install NestJS CLI
```bash
npm i -g @nestjs/cli
nest new dukahub-backend
cd dukahub-backend
```

#### Step 1.2: Install Dependencies
```bash
# Core Dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install bcrypt uuid
npm install class-validator class-transformer
npm install cookie-parser

# Email (optional for MVP, can skip initially)
npm install @sendgrid/mail

# Dev Dependencies
npm install -D @types/passport-jwt @types/bcrypt @types/uuid @types/cookie-parser
```

#### Step 1.3: Setup Database (PostgreSQL)
```bash
# Using Docker (recommended)
docker run --name dukahub-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dukahub \
  -p 5432:5432 \
  -d postgres:15

# Or install PostgreSQL locally and create database
createdb dukahub
```

#### Step 1.4: Setup Environment Variables
Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dukahub

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
```

---

### **Phase 2: Understanding Clean Architecture Foundations (Read First!)**

#### What is Domain Layer?
**Definition:** The core business logic and rules. Independent of frameworks, databases, or UI.

**Contains:**
- **Entities:** User, Role, Permission (with business rules)
- **Value Objects:** Email, Password (with validation)
- **Domain Services:** Complex rules involving multiple entities
- **Repository Interfaces:** Contracts that infrastructure must fulfill

**Key Rule:** Domain depends on NOTHING. It's pure business logic.

**Example:** User entity knows:
- ✅ "Password must be 8+ characters"
- ✅ "Email must be verified before login"
- ❌ How to save to database (that's infrastructure!)
- ❌ How to send emails (that's infrastructure!)

---

#### What is Application Layer?
**Definition:** Orchestrates the flow of data. Implements use cases (what the app DOES).

**Contains:**
- **Use Cases:** RegisterUser, LoginUser, AssignRole
- **DTOs:** Data shape for requests/responses
- **Application Services:** Token generation, password hashing

**Key Rule:** Depends only on Domain. Doesn't know about HTTP or databases.

**Example:** RegisterUser use case:
1. Validate input (DTO)
2. Check if user exists (repository)
3. Create user entity (domain)
4. Hash password (application service)
5. Save user (repository)
6. Send verification email (application service)

---

#### What is Infrastructure Layer?
**Definition:** Technical implementation details. How we save data, send emails, etc.

**Contains:**
- **Repositories:** Implement domain interfaces
- **TypeORM Entities:** Database schemas
- **External Services:** Email, SMS, file storage
- **Guards:** JWT verification

**Key Rule:** Implements Domain interfaces. Depends on Domain contracts.

---

#### What is Presentation Layer?
**Definition:** User-facing interface. Receives HTTP requests, returns responses.

**Contains:**
- **Controllers:** HTTP endpoints
- **Guards:** Route protection
- **Decorators:** Extract user info, check roles

**Key Rule:** Depends on Application layer. Knows about HTTP, but Application doesn't!

---

## 📝 COMPLETE CODE IMPLEMENTATION

### **Phase 3: Build Shared Foundation**

#### Step 3.1: Create Base Entity
**File:** `src/shared/domain/base.entity.ts`

```typescript
export abstract class BaseEntity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id?: string) {
    this._id = id || crypto.randomUUID();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
```

**🎯 Key Concepts:**
- All entities inherit common fields (id, timestamps)
- `touch()` updates `updatedAt` when entity changes
- Protected properties with public getters (encapsulation)

---

### **Phase 4: Build Domain Layer (Core Business Logic)**

#### Step 4.1: Create Directory Structure
```bash
mkdir -p src/auth/domain/entities
mkdir -p src/auth/domain/interfaces
mkdir -p src/auth/domain/enums
mkdir -p src/auth/domain/value-objects
```

#### Step 4.2: Domain Enums
**File:** `src/auth/domain/enums/user-status.enum.ts`

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
```

**File:** `src/auth/domain/enums/auth-provider.enum.ts`

```typescript
export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}
```

---

#### Step 4.3: Value Objects (Email & Password)
**File:** `src/auth/domain/value-objects/email.vo.ts`

```typescript
export class Email {
  private readonly _value: string;

  constructor(email: string) {
    this._value = email.toLowerCase().trim();
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
```

**File:** `src/auth/domain/value-objects/password.vo.ts`

```typescript
export class Password {
  private readonly _value: string;

  constructor(password: string, isHashed: boolean = false) {
    this._value = password;
    if (!isHashed) {
      this.validate();
    }
  }

  private validate(): void {
    if (this._value.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    
    const hasUpperCase = /[A-Z]/.test(this._value);
    const hasLowerCase = /[a-z]/.test(this._value);
    const hasNumber = /\d/.test(this._value);
    const hasSpecialChar = /[@$!%*?&]/.test(this._value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }
  }

  get value(): string {
    return this._value;
  }
}
```

**🎯 Key Concepts:**
- Value Objects encapsulate validation rules
- Immutable (no setters)
- Business rules live here, not in entities
- Can be reused across entities

---

#### Step 4.4: Domain Entity - User
**File:** `src/auth/domain/entities/user.entity.ts`

```typescript
import { BaseEntity } from '@/shared/domain/base.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserStatus } from '../enums/user-status.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

export class User extends BaseEntity {
  private _email: Email;
  private _password?: Password;
  private _firstName: string;
  private _lastName: string;
  private _merchantId: string;
  private _authProvider: AuthProvider;
  private _isEmailVerified: boolean;
  private _status: UserStatus;
  private _lastLoginAt?: Date;

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

  // Factory method - controls how Users are created
  static async create(
    email: string,
    plainPassword: string,
    firstName: string,
    lastName: string,
    merchantId: string,
  ): Promise<User> {
    const emailVO = new Email(email);
    const passwordVO = new Password(plainPassword);

    return new User({
      email: emailVO,
      password: passwordVO,
      firstName,
      lastName,
      merchantId,
    });
  }

  // Reconstitute from database
  static fromPersistence(props: {
    id: string;
    email: string;
    hashedPassword?: string;
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
      email: new Email(props.email),
      password: props.hashedPassword 
        ? new Password(props.hashedPassword, true) 
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

  public updateLastLogin(): void {
    this._lastLoginAt = new Date();
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
  get email(): Email { return this._email; }
  get password(): Password | undefined { return this._password; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get merchantId(): string { return this._merchantId; }
  get authProvider(): AuthProvider { return this._authProvider; }
  get isEmailVerified(): boolean { return this._isEmailVerified; }
  get status(): UserStatus { return this._status; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }
}
```

**🎯 Key Concepts:**
- Private constructor = controlled creation
- Factory methods (`create`, `fromPersistence`)
- Business rules as methods (`verifyEmail()`, `canLogin()`)
- Immutable properties (only getters, no setters)
- All validation in one place

---

#### Step 4.5: Domain Entity - Role
**File:** `src/auth/domain/entities/role.entity.ts`

```typescript
import { BaseEntity } from '@/shared/domain/base.entity';
import { Permission } from './permission.entity';

export class Role extends BaseEntity {
  private _name: string;
  private _displayName: string;
  private _description?: string;
  private _isSystemRole: boolean;
  private _merchantId?: string;
  private _permissions: Permission[];

  private constructor(props: {
    id?: string;
    name: string;
    displayName: string;
    description?: string;
    isSystemRole?: boolean;
    merchantId?: string;
    permissions?: Permission[];
  }) {
    super(props.id);
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description;
    this._isSystemRole = props.isSystemRole || false;
    this._merchantId = props.merchantId;
    this._permissions = props.permissions || [];

    this.validate();
  }

  static create(
    name: string,
    displayName: string,
    description?: string,
    merchantId?: string,
  ): Role {
    return new Role({
      name: name.toUpperCase(),
      displayName,
      description,
      merchantId,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    isSystemRole: boolean;
    merchantId?: string;
    permissions?: Permission[];
  }): Role {
    return new Role(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Role name is required');
    }
    if (!this._displayName || this._displayName.trim().length === 0) {
      throw new BadRequestException('Role display name is required');
    }
  }

  // Business Rules
  public addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.name)) {
      this._permissions.push(permission);
      this.touch();
    }
  }

  public removePermission(permissionName: string): void {
    this._permissions = this._permissions.filter(
      p => p.name !== permissionName
    );
    this.touch();
  }

  public hasPermission(permissionName: string): boolean {
    return this._permissions.some(p => p.name === permissionName);
  }

  public canBeDeleted(): boolean {
    return !this._isSystemRole;
  }

  // Getters
  get name(): string { return this._name; }
  get displayName(): string { return this._displayName; }
  get description(): string | undefined { return this._description; }
  get isSystemRole(): boolean { return this._isSystemRole; }
  get merchantId(): string | undefined { return this._merchantId; }
  get permissions(): Permission[] { return this._permissions; }
}
```

---

#### Step 4.6: Domain Entity - Permission
**File:** `src/auth/domain/entities/permission.entity.ts`

```typescript
import { BaseEntity } from '@/shared/domain/base.entity';

export class Permission extends BaseEntity {
  private _name: string;
  private _resource: string;
  private _action: string;
  private _description?: string;

  private constructor(props: {
    id?: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
  }) {
    super(props.id);
    this._name = props.name;
    this._resource = props.resource;
    this._action = props.action;
    this._description = props.description;

    this.validate();
  }

  static create(
    resource: string,
    action: string,
    description?: string,
  ): Permission {
    const name = `${resource}_${action}`;
    return new Permission({
      name,
      resource,
      action,
      description,
    });
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
  }): Permission {
    return new Permission(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BadRequestException('Permission name is required');
    }
    if (!this._resource || this._resource.trim().length === 0) {
      throw new BadRequestException('Resource is required');
    }
    if (!this._action || this._action.trim().length === 0) {
      throw new BadRequestException('Action is required');
    }
    // Naming convention: resource_action
    if (this._name !== `${this._resource}_${this._action}`) {
      throw new BadRequestException('Permission name must follow format: resource_action');
    }
  }

  // Getters
  get name(): string { return this._name; }
  get resource(): string { return this._resource; }
  get action(): string { return this._action; }
  get description(): string | undefined { return this._description; }
}
```

---

#### Step 4.7: Repository Interfaces
**File:** `src/auth/domain/interfaces/user.repository.interface.ts`

```typescript
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByMerchantId(merchantId: string): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
}

export const IUserRepository = Symbol('IUserRepository');
```

**File:** `src/auth/domain/interfaces/role.repository.interface.ts`

```typescript
import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  save(role: Role): Promise<Role>;
  getUserRoles(userId: string): Promise<Role[]>;
  assignToUser(userId: string, roleId: string): Promise<void>;
  removeFromUser(userId: string, roleId: string): Promise<void>;
}

export const IRoleRepository = Symbol('IRoleRepository');
```

**🎯 Key Concepts:**
- Domain defines WHAT it needs (contract)
- Domain doesn't care HOW it's implemented
- Infrastructure will implement these interfaces
- Symbol allows NestJS dependency injection

---

### **Phase 5: Build Application Layer (Use Cases)**

#### Step 5.1: Create Directory Structure
```bash
mkdir -p src/auth/application/use-cases
mkdir -p src/auth/application/dto
mkdir -p src/auth/application/services
```

#### Step 5.2: DTOs
**File:** `src/auth/application/dto/register.dto.ts`

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsUUID()
  merchantId: string;
}
```

**File:** `src/auth/application/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
```

---

#### Step 5.3: Application Services
**File:** `src/auth/application/services/password-hasher.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasherService {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, 10);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

**File:** `src/auth/application/services/token-generator.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenGeneratorService {
  generate(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
```

---

#### Step 5.4: Register User Use Case
**File:** `src/auth/application/use-cases/register-user.use-case.ts`

```typescript
import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/auth/domain/interfaces/user.repository.interface';
import { User } from '@/auth/domain/entities/user.entity';
import { Email } from '@/auth/domain/value-objects/email.vo';
import { Password } from '@/auth/domain/value-objects/password.vo';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenGeneratorService } from '../services/token-generator.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenGenerator: TokenGeneratorService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ id: string; email: string }> {
    // 1. Check if user already exists
    const email = new Email(dto.email);
    const exists = await this.userRepository.exists(email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create user entity (validates business rules!)
    const user = await User.create(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.merchantId,
    );

    // 3. Hash password
    const hashedPassword = await this.passwordHasher.hash(user.password!.value);
    const securePassword = new Password(hashedPassword, true);
    
    // Update user with hashed password
    const userWithHashedPassword = User.fromPersistence({
      id: user.id,
      email: user.email.value,
      hashedPassword: securePassword.value,
      firstName: user.firstName,
      lastName: user.lastName,
      merchantId: user.merchantId,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
    });

    // 4. Save user
    const savedUser = await this.userRepository.save(userWithHashedPassword);

    // 5. Generate email verification token (store this in a verification tokens table)
    const verificationToken = this.tokenGenerator.generate();
    // TODO: Save token and send email (we'll add this later)

    return {
      id: savedUser.id,
      email: savedUser.email.value,
    };
  }
}
```

**🎯 Key Concepts:**
- Use case orchestrates the flow
- Business validation happens in entity creation
- Technical concerns (hashing) in application service
- Returns simple DTO, not domain entity

---

#### Step 5.5: Login User Use Case
**File:** `src/auth/application/use-cases/login-user.use-case.ts`

```typescript
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@/auth/domain/interfaces/user.repository.interface';
import { IRoleRepository } from '@/auth/domain/interfaces/role.repository.interface';
import { Email } from '@/auth/domain/value-objects/email.vo';
import { PasswordHasherService } from '../services/password-hasher.service';
import { LoginDto } from '../dto/login.dto';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    merchantId: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    // 1. Find user by email
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if user can login (business rule in entity!)
    if (!user.canLogin()) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Email not verified');
      }
      throw new UnauthorizedException('Account is not active');
    }

    // 3. Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password?.value || '',
    );

    if (!is
