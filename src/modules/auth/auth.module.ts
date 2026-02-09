import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Use Cases

// Services
import { PasswordHasherService } from './application/services/password-hasher.service';
import { JwtService } from './application/services/jwt.service';
import { TokenGeneratorService } from './application/services/token-generator.service';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';

// Infrastructure

import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository';
import { EmailVerificationTokenRepository } from './infrastructure/repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from './infrastructure/repositories/password-reset-token.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { PermissionRepository } from './infrastructure/repositories/permission.repository';

// Schemas

// Presentation
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PublicGuard } from './presentation/guards/public.guard';
import { UserSchema } from './infrastructure/persistence/schemas/user.schema';
import { RefreshTokenSchema } from './infrastructure/persistence/schemas/refresh.token.schema';
import { EmailVerificationTokenSchema } from './infrastructure/persistence/schemas/email-verification-token.schema';
import { PasswordResetTokenSchema } from './infrastructure/persistence/schemas/password-reset-token.schema';
import { RoleSchema } from './infrastructure/persistence/schemas/role.schema';
import { PermissionSchema } from './infrastructure/persistence/schemas/permission.schema';
import { RegisterUserUseCase } from './application/user-cases/register-user.use-case';
import { RefreshTokenUseCase } from './application/user-cases/refresh-token.use-case';
import { VerifyEmailUseCase } from './application/user-cases/verify-email-use-case';
import { ResendVerificationUseCase } from './application/user-cases/resend-verification.use-case';
import { ResetPasswordUseCase } from './application/user-cases/password/reset-password.use-case';
import { IRefreshTokenRepository } from './domain/interfaces/refresh-token.interface';
import { IEmailVerificationTokenRepository } from './domain/interfaces/email-verification-token.repository.interface';
import { IPasswordResetTokenRepository } from './domain/interfaces/password-reset-token.repository.interface';
import { IRoleRepository } from './domain/interfaces/role.repository.interface';
import { IPermissionRepository } from './domain/interfaces/permission.repository.interface';
import {IEventPublisher} from './domain/interfaces/event-publisher.interface'
import { IUserRepository } from './domain/interfaces/user.repository.interface';
import { UserRoleSchema } from './infrastructure/persistence/schemas/user-role.schema';
import { LoginUserUseCase } from './application/user-cases/login-user-use-case.service';
import { LogoutUseCase } from './application/user-cases/logout-user.use-case';
import { RequestPasswordResetUseCase } from './application/user-cases/password/request-password-reset-use-case.service';
import { ChangePasswordUseCase } from './application/user-cases/password/change-password-use-case.service';
import UserRepository from './infrastructure/repositories/user.repository';
import { GmailEmailService } from './infrastructure/email/gmail.email.service';
import { IEmailSenderService } from './application/services/email-sender.service';
import { NestEventPublisher } from './application/services/nest-event-publisher.service';
import { SendVerificationEmailHanlder } from './application/handlers/send-verification-email.handler';

// Interfaces

@Module({
  imports: [
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

    // Services
    PasswordHasherService,
    JwtService,
    TokenGeneratorService,
    GmailEmailService,

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

    //hanlders
    SendVerificationEmailHanlder,
    //event Handlers
    {
      provide: IEventPublisher,
      useClass: NestEventPublisher,
    },

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
    {
      provide: IEmailSenderService,
      useClass: GmailEmailService,
    },
  ],
  exports: [
    JwtAuthGuard,
    PublicGuard,
    JwtStrategy,
    IUserRepository,
    IRoleRepository,
    IPermissionRepository,
  ],
})
export class AuthModule {}
