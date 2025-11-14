import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from 'src/modules/auth/domain/interfaces/user.repository.interface';

import { IEmailSenderService } from '../../services/email-sender.service';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { TokenGeneratorService } from '../../services/token-generator.service';
import { PasswordResetToken } from 'src/modules/auth/domain/entities/password-reset-token.entity';
import { IPasswordResetTokenRepository } from '../../../domain/interfaces/password-reset-token.repository.interface';

export interface RequestPasswordResetInput {
  email: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordResetTokenRepository)
    private readonly passwordTokenRepository: IPasswordResetTokenRepository,
    // private readonly emailSenderService: IEmailSenderService,
    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {}

  async execute(input: RequestPasswordResetInput) {
    // 1. Find user by email
    const { email } = input;
    const emailObj = new Email(email);
    const user = await this.userRepository.findByEmail(emailObj);

    if (!user) {
      // Optional: silently return to avoid exposing user existence
      throw new NotFoundException('User not found');
    }

    // 2. Generate a secure token
    const token = this.tokenGeneratorService.generate();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // 3. Create PasswordResetToken entity using factory method
    const resetToken = PasswordResetToken.create(token, user.id, expiresAt);

    // 4. Save token entity in repository
    await this.passwordTokenRepository.save(resetToken);

    // todo : fix this use case and its dependencies
    // 5. Send email with token link
    // await this.emailSenderService.sendPasswordResetEmail(
    //   user.email.value, // Use .value for string
    //   user.getFullName(),
    //   token
    // );

    return {
      success: true,
      message: 'Password reset instructions sent to your email',
    };
  }
}
