import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IEmailVerificationTokenRepository } from '../../domain/repositories/email-verification-token.repository.interface';

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailOutput {
  success: boolean;
  message: string;
  userId: string;
}
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

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    // STEP 1: Find the verification token in the database
    const tokenEntity = await this.emailVerificationTokenRepository.findByToken(
      input.token,
    );

    // STEP 2: Check if token exists
    if (!tokenEntity) {
      throw new NotFoundException('Invalid verification token');
    }

    // STEP 3: Check if token has expired
    if (tokenEntity.isExpired()) {
      // Clean up expired token
      await this.emailVerificationTokenRepository.delete(tokenEntity.id);
      throw new BadRequestException('Verification token has expired');
    }

    // STEP 4: Check if token has already been used
    if (tokenEntity.isUsed) {
      throw new BadRequestException('Verification token already used');
    }

    // STEP 5: Find the user associated with this token
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // STEP 6: Check if user is already verified (idempotency check)
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // STEP 7: Verify the user's email address
    user.verifyEmail();
    await this.userRepository.update(user);

    // STEP 8: Mark the token as used to prevent reuse
    tokenEntity.markAsUsed();
    await this.emailVerificationTokenRepository.update(tokenEntity);

    // STEP 9: Clean up - delete all verification tokens for this user
    await this.emailVerificationTokenRepository.deleteByUserId(user.id);

    // STEP 11: Return success response
    return {
      success: true,
      message: 'Email verified successfully',
      userId: user.id,
    };
  }
}
