import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailOutput {
  success: boolean;
  message: string;
  userId: string;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,

    @Inject(IEmailVerificationTokenRepository)
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
  ) {}

  async execute(input: VerifyEmailInput) {
    const { token } = input;
    // 1. Find verification token by token string
    const tokenEntity =
      await this.emailVerificationTokenRepository.findByToken(token);
    // 2. Check if token exists  |  // 3. Check if token is expired |  // 4. Check if token is already used
    if (
      !tokenEntity ||
      tokenEntity.expiresAt < new Date() ||
      tokenEntity.isUsed
    ) {
      throw new UnauthorizedException('Invalid Token');
    }

    // 5. Find user by token's userId
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user) throw new NotFoundException('User not found');
    // 6. Check if user already verified
    if (user?.isEmailVerified) {
      throw new ConflictException('User is already verified');
    }
    // 7. Verify user's email
    user?.verifyEmail();
    // 8. Mark token as used
    tokenEntity.markAsUsed();
    await this.userRepository.save(user);
    await this.emailVerificationTokenRepository.save(tokenEntity);
    // 9. Delete all user's verification tokens
    await this.emailVerificationTokenRepository.deleteByUserId(
      tokenEntity.userId,
    );
    // 11. Return success response

    return {
      success: true,
      message: 'Email verified',
      userId: tokenEntity.userId,
    };
  }
}
