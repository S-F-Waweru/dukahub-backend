// src/modules/auth/application/use-cases/register-user.use-case.ts

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenGeneratorService } from '../services/token-generator.service';
import { IEmailSenderService } from '../services/email-sender.service';

import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IEmailVerificationTokenRepository')
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    @Inject(IEmailSenderService) // âœ… Inject email service
    private readonly emailService: IEmailSenderService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenGenerator: TokenGeneratorService, // âœ… Inject token generator
  ) {}

  async execute(
    dto: RegisterDto,
  ): Promise<{ id: string; email: string; message: string }> {
    try {
      console.log('debug:(register)', dto);

      // Validate UUID format
      if (!this.isValidUUID(dto.merchantId)) {
        throw new BadRequestException('Invalid merchant ID format');
      }

      // 1. Check if user already exists
      const email = new Email(dto.email);
      const exists = await this.userRepository.exists(email);

      if (exists) {
        throw new ConflictException('User with this email already exists');
      }

      // 2. Create user entity
      const user = User.create(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.merchantId,
      );

      // 3. Hash password
      const hashedPassword = await this.passwordHasher.hash(
        user.password!.value,
      );
      const securePassword = new Password(hashedPassword, true);

      // Update user with hashed password
      const userWithHashedPassword = User.fromPersistence({
        id: user.id,
        email: dto.email,
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

      // 5. Generate email verification token âœ…
      const verificationTokenString = this.tokenGenerator.generate(32); // 64 hex characters

      const verificationToken = EmailVerificationToken.create(
        verificationTokenString,
        savedUser.id,
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      );

      // 6. Save verification token âœ…
      await this.emailVerificationTokenRepository.save(verificationToken);

      // 7. Send verification email âœ…
      await this.emailService.sendVerificationEmail(
        savedUser.email,
        verificationTokenString, // Send plain token, NOT hash
      );

      return {
        id: savedUser.id,
        email: savedUser.email.value,
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error: any) {
      // Handle known business exceptions
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle database errors
      if (error?.message?.includes('invalid input syntax for type uuid')) {
        throw new BadRequestException('Invalid merchant ID format');
      }

      if (error?.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }

      // Log unexpected errors
      console.error('Unexpected error during user registration:', error);
      throw new InternalServerErrorException(
        'Registration failed. Please try again.',
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
