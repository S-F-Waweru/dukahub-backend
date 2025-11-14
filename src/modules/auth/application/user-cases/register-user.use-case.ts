import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenGeneratorService } from '../services/token-generator.service';
import { RegisterDto } from '../dto/register.dto';
import { Email } from '../../domain/value-objects/email.vo';

import { Password } from '../../domain/value-objects/password.vo';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenGenerator: TokenGeneratorService,
  ) {}

  async execute(dto: RegisterDto) {
    try {
      console.log('debug:(register)', dto);

      // Validate a UUID format before proceeding
      if (!this.isValidUUID(dto.merchantId)) {
        throw new BadRequestException('Invalid merchant ID format');
      }

      // 1. Check if user already exists
      const email = new Email(dto.email);
      const exists = await this.userRepository.exists(email);

      if (exists) {
        throw new ConflictException('User with this email already exists');
      }

      // 2. Create user entity (validates business rules!)
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

      return {
        id: savedUser.id,
        email: savedUser.email.value,
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
        // Unique constraint violation
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
