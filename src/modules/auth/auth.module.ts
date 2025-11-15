// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Use Cases
import { RegisterUserUseCase } from './application/user-cases/register-user.use-case';
import { LoginUserUseCase } from './application/user-cases/login-user-use-case.service';
import { RefreshTokenUseCase } from './application/user-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/user-cases/logout-user.use-case';
import { VerifyEmailUseCase } from './application/user-cases/verify-email-use-case';
import { ResendVerificationUseCase } from './application/user-cases/resend-verification.use-case';
import { ChangePasswordUseCase } from './application/user-cases/password/change-password-use-case.service';
import { RequestPasswordResetUseCase } from './application/user-cases/password/request-password-reset-use-case.service';
import { ResetPasswordUseCase } from './application/user-cases/password/reset-password.use-case';

// Services
import { PasswordHasherService } from './application/services/password-hasher.service';
import { JwtService } from './application/services/jwt.service';
import { TokenGeneratorService } from './application/services/token-generator.service';
import { IEmailSenderService } from './application/services/email-sender.service'; // âœ… Add interface

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';

// Infrastructure - Repositories
import UserRepository from './infrastructure/repositories/user.repository';
import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository';
import { EmailVerificationTokenRepository } from './infrastructure/repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from './infrastructure/repositories/password-reset-token.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { PermissionRepository } from './infrastructure/repositories/permission.repository';

// Infrastructure - Adapters
import { GmailEmailService } from './infrastructure/email/gmail.email.service';

// Schemas
import { UserSchema } from './infrastructure/persistence/schemas/user.schema';
import { RefreshTokenSchema } from './infrastructure/persistence/schemas/refresh.token.schema';
import { EmailVerificationTokenSchema } from './infrastructure/persistence/schemas/email-verification-token.schema';
import { PasswordResetTokenSchema } from './infrastructure/persistence/schemas/password-reset-token.schema';
import { RoleSchema } from './infrastructure/persistence/schemas/role.schema';
import { PermissionSchema } from './infrastructure/persistence/schemas/permission.schema';
import { UserRoleSchema } from './infrastructure/persistence/schemas/user-role.schema';

// Presentation
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PublicGuard } from './presentation/guards/public.guard';

// Interfaces (Repository Tokens)
import { IUserRepository } from './domain/interfaces/user.repository.interface';
import { IRefreshTokenRepository } from './domain/interfaces/refresh-token.interface';
import { IEmailVerificationTokenRepository } from './domain/interfaces/email-verification-token.repository.interface';
import { IPasswordResetTokenRepository } from './domain/interfaces/password-reset-token.repository.interface';
import { IRoleRepository } from './domain/interfaces/role.repository.interface';
import { IPermissionRepository } from './domain/interfaces/permission.repository.interface';

@Module({
  imports: [
    ConfigModule, // âœ… Make sure ConfigModule is imported
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserSchema,
      RefreshTokenSchema,
      EmailVerificationTokenSchema,
      PasswordResetTokenSchema,
      RoleSchema,
      PermissionSchema,
      UserRoleSchema,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    // Strategies & Guards
    JwtStrategy,
    JwtAuthGuard,
    PublicGuard,

    // Application Services
    PasswordHasherService,
    JwtService,
    TokenGeneratorService,

    // âœ… Email Service Binding (NEW)
    {
      provide: IEmailSenderService,
      useClass: GmailEmailService,
    },

    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
    ChangePasswordUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,

    // Repository Implementations
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IRefreshTokenRepository,
      useClass: RefreshTokenRepository,
    },
    {
      provide: IEmailVerificationTokenRepository,
      useClass: EmailVerificationTokenRepository,
    },
    {
      provide: IPasswordResetTokenRepository,
      useClass: PasswordResetTokenRepository,
    },
    {
      provide: IRoleRepository,
      useClass: RoleRepository,
    },
    {
      provide: IPermissionRepository,
      useClass: PermissionRepository,
    },
  ],
  exports: [
    JwtAuthGuard,
    PublicGuard,
    JwtStrategy,
    IUserRepository,
    IRoleRepository,
    IPermissionRepository,
    IEmailSenderService, // âœ… Export if other modules need it
  ],
})
export class AuthModule {}
