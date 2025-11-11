# DukaHub Auth MVP - Steps 5.5 to 8

## 📋 Overview

This document covers the **missing pieces** of the Auth MVP:
- **Step 5.5**: Complete Repository Implementations
- **Step 6**: TypeORM Schemas (Database Tables)
- **Step 7**: Controllers & DTOs (API Layer)
- **Step 8**: Guards & Strategies (Security Layer)

---

## 🗄️ Step 5.5: Complete Repository Implementations

### User Repository Implementation

**File:** `modules/auth/infrastructure/repositories/user.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserSchema } from '../persistence/typeorm/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repo: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const schema = await this.repo.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const schema = await this.repo.findOne({ where: { email } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByMerchantId(merchantId: string): Promise<User[]> {
    const schemas = await this.repo.find({ where: { merchantId } });
    return schemas.map(s => this.toDomain(s));
  }

  async save(user: User): Promise<User> {
    const schema = this.toSchema(user);
    const saved = await this.repo.save(schema);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  // Mapper: Domain Entity → Database Schema
  private toSchema(user: User): UserSchema {
    const schema = new UserSchema();
    schema.id = user.id;
    schema.email = user.email;
    schema.passwordHash = user.passwordHash;
    schema.merchantId = user.merchantId;
    schema.businessName = user.businessName;
    schema.phoneNumber = user.phoneNumber;
    schema.role = user.role;
    schema.isActive = user.isActive;
    return schema;
  }

  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: UserSchema): User {
    return new User({
      id: schema.id,
      email: schema.email,
      passwordHash: schema.passwordHash,
      merchantId: schema.merchantId,
      businessName: schema.businessName,
      phoneNumber: schema.phoneNumber,
      role: schema.role,
      isActive: schema.isActive,
    });
  }
}
```

### Refresh Token Repository Implementation

**File:** `modules/auth/infrastructure/repositories/refresh-token.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenSchema } from '../persistence/typeorm/refresh-token.schema';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenSchema)
    private readonly repo: Repository<RefreshTokenSchema>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    const schema = await this.repo.findOne({ where: { token } });
    return schema ? this.toDomain(schema) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const schemas = await this.repo.find({ where: { userId } });
    return schemas.map(s => this.toDomain(s));
  }

  async save(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const schema = new RefreshTokenSchema();
    schema.token = data.token;
    schema.userId = data.userId;
    schema.expiresAt = data.expiresAt;
    
    const saved = await this.repo.save(schema);
    return this.toDomain(saved);
  }

  async delete(token: string): Promise<void> {
    await this.repo.delete({ token });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  // Mapper: Database Schema → Domain Entity
  private toDomain(schema: RefreshTokenSchema): RefreshToken {
    return new RefreshToken({
      id: schema.id,
      token: schema.token,
      userId: schema.userId,
      expiresAt: schema.expiresAt,
      createdAt: schema.createdAt,
    });
  }
}
```

---

## 🗃️ Step 6: TypeORM Schemas (Database Tables)

### User Schema

**File:** `modules/auth/infrastructure/persistence/typeorm/user.schema.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['merchantId'])
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'uuid' })
  @Index()
  merchantId: string;

  @Column()
  businessName: string;

  @Column()
  phoneNumber: string;

  @Column({ default: 'OWNER' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Refresh Token Schema

**File:** `modules/auth/infrastructure/persistence/typeorm/refresh-token.schema.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
export class RefreshTokenSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 🎮 Step 7: Controllers & DTOs (API Layer)

### DTOs (Data Transfer Objects)

**File:** `modules/auth/presentation/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**File:** `modules/auth/presentation/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsString()
  @MinLength(2)
  businessName: string;

  @IsString()
  @Matches(/^(\+254|0)[17]\d{8}$/, {
    message: 'Invalid Kenyan phone number',
  })
  phoneNumber: string;
}
```

**File:** `modules/auth/presentation/dto/refresh-token.dto.ts`

```typescript
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
```

### Auth Controller

**File:** `modules/auth/presentation/controllers/auth.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    return {
      message: 'Registration successful',
      data: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute(dto);

    // Set refresh token in httpOnly cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    
    if (!refreshToken) {
      throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    // Set new refresh token in cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed',
      data: {
        accessToken: result.accessToken,
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    
    if (refreshToken) {
      await this.logoutUseCase.execute({ refreshToken });
    }

    // Clear cookie
    response.clearCookie('refreshToken');

    return {
      message: 'Logout successful',
    };
  }
}
```

---

## 🛡️ Step 8: Guards & Strategies (Security Layer)

### JWT Strategy

**File:** `modules/auth/presentation/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';

export interface JwtPayload {
  userId: string;
  merchantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // This gets attached to request.user
    return {
      userId: payload.userId,
      merchantId: payload.merchantId,
      role: payload.role,
    };
  }
}
```

### JWT Auth Guard

**File:** `modules/auth/presentation/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
```

### Roles Guard

**File:** `modules/auth/presentation/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Roles Decorator

**File:** `modules/auth/presentation/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Current User Decorator

**File:** `modules/auth/presentation/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

---

## 📦 Additional Dependencies

Install these packages:

```bash
npm install @nestjs/passport passport passport-jwt cookie-parser
npm install -D @types/passport-jwt @types/cookie-parser
```

---

## ⚙️ Enable Cookie Parser

**File:** `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser
  app.use(cookieParser());
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
```

---

## 🧪 Testing the API

### 1. Register
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "john@bookstore.ke",
  "password": "SecurePass123",
  "businessName": "John's Bookstore",
  "phoneNumber": "+254712345678"
}
```

### 2. Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@bookstore.ke",
  "password": "SecurePass123"
}
```

Response includes:
- `accessToken` in JSON body
- `refreshToken` in httpOnly cookie

### 3. Access Protected Route
```bash
GET http://localhost:3000/some-protected-route
Authorization: Bearer <access-token>
```

### 4. Refresh Token
```bash
POST http://localhost:3000/auth/refresh
# Cookie is sent automatically
```

### 5. Logout
```bash
POST http://localhost:3000/auth/logout
Authorization: Bearer <access-token>
```

---

## 🔒 Security Features Implemented

✅ **Password Security:**
- Bcrypt hashing (10 rounds)
- Password validation (length, complexity)

✅ **Token Security:**
- Short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days)
- Token rotation on refresh
- HttpOnly cookies for refresh tokens

✅ **API Security:**
- Input validation (class-validator)
- JWT authentication
- Role-based access control
- User status verification

✅ **Multi-tenancy:**
- merchantId in JWT payload
- Auto-filtering by tenant

---

## ✅ Final Checklist

**Step 5.5 - Repositories:**
- [ ] `user.repository.ts` created
- [ ] `refresh-token.repository.ts` created
- [ ] Mappers (toDomain/toSchema) implemented

**Step 6 - Schemas:**
- [ ] `user.schema.ts` with indexes
- [ ] `refresh-token.schema.ts` with indexes

**Step 7 - Controllers:**
- [ ] DTOs created (login, register, refresh)
- [ ] `auth.controller.ts` with all endpoints
- [ ] Cookie handling implemented

**Step 8 - Guards:**
- [ ] `jwt.strategy.ts` created
- [ ] `jwt-auth.guard.ts` created
- [ ] `roles.guard.ts` created
- [ ] Decorators created (@CurrentUser, @Roles)

**Configuration:**
- [ ] Cookie parser enabled
- [ ] Global validation pipe
- [ ] Dependencies installed

---

## 🚀 Next Steps

After completing Steps 5.5-8:
1. **Step 9**: Auth Module Integration
2. **Step 10**: End-to-end testing
3. Start building Inventory module!

---

**Progress:** Steps 5.5-8 Complete ✅  
**What's Left:** Module integration & testing (Steps 9-10)