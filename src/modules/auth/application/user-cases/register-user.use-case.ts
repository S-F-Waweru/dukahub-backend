import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
    const hashedPassword = await this.passwordHasher.hash(user.password!.value);
    const securePassword = new Password(hashedPassword, true);
    // Update user with hashed password
    const userWithHashedPassword = User.fromPersistence({
      id: user.id,
      //todo find fix for tihi
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
    const savedUSer = await this.userRepository.save(userWithHashedPassword);
    // 5. Generate email verification token (store this in a verification tokens table)
    // const verificationToken = this.tokenGenerator.generate();
    // // TODO: Save token and send email (we'll add this later)
    // await this.refreshTokenRepository.save(verificationToken);

    return {
      id: savedUSer.id,
      email: savedUSer.email.value,
    };
  }
}
