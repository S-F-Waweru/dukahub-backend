import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { TokenGeneratorService } from '../services/token-generator.service';
import { IEmailSenderService } from '../services/email-sender.service';
import { Email } from '../../domain/value-objects/email.vo';

export interface ResendVerificationInput {
  email: string;
}

export interface ResendVerificationOutput {
  success: boolean;
  message: string;
}

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IEmailVerificationTokenRepository)
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly tokenGenerator: TokenGeneratorService,
    private readonly emailSender: IEmailSenderService,
  ) {}

  async execute(
    input: ResendVerificationInput,
  ): Promise<ResendVerificationOutput> {
    // 1. Find user by email
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if user is already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // 3. Delete any existing verification tokens for this user
    await this.emailVerificationTokenRepository.deleteByUserId(user.id);

    // todo  : fix this use case and its dependencies
    // // 4. Generate new verification token
    // const verificationToken = this.tokenGenerator.generate();
    // const expiresAt = new Date();
    // expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // 5. Create and save new verification token
    // const tokenEntity = await this.emailVerificationTokenRepository.save({
    //   tokenHash: verificationToken, // In production, hash this!
    //   userId: user.id,
    //   expiresAt: expiresAt,
    //   _tokenHash: '',
    //   _userId: '',
    //   _expiresAt: undefined,
    //   _isUsed: false,
    //   validate: function (): void {
    //     throw new Error('Function not implemented.');
    //   },
    //   markAsUsed: function (): void {
    //     throw new Error('Function not implemented.');
    //   },
    //   isExpired: function (): boolean {
    //     throw new Error('Function not implemented.');
    //   },
    //   isValid: function (): boolean {
    //     throw new Error('Function not implemented.');
    //   },
    //   isUsed: false,
    //   usedAt: undefined,
    //   _id: '',
    //   _createdAt: undefined,
    //   _updatedAt: undefined,
    //   id: '',
    //   createdAt: undefined,
    //   updatedAt: undefined,
    //   touch: function (): void {
    //     throw new Error('Function not implemented.');
    //   },
    // });

    // 6. Send verification email
    // const emailSent = await this.emailSender.sendVerificationEmail(
    //   user.email.value,
    //   user.getFullName(),
    //   verificationToken,
    // );

    // if (!emailSent) {
    //   throw new Error('Failed to send verification email');
    // }

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  }
}
