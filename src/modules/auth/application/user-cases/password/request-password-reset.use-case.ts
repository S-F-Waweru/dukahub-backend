import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from 'src/modules/auth/domain/interfaces/user.reposotory.interface';
import { IPassswordTokenRepository } from 'src/modules/auth/domain/repositories/password-reset-token.repository.interface';
import { IEmailSenderService } from '../../services/email-sender.service';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { TokenGeneratorService } from '../../services/token-generator.service';
import { PasswordResetToken } from 'src/modules/auth/domain/entities/password-reset-token.entity';

export interface RequestPasswordResetInput {
  email: string;
}

@Injectable()
export class RequestPasswordResetUsecase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPassswordTokenRepository)
    private readonly passwordTokenRepository: IPassswordTokenRepository,
    private readonly emailSenderService: IEmailSenderService,
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
    const resetToken = new PasswordResetToken({
      token,
      userId: user.id,
      expiresAt,
    });
    // 3. Save token in repository

    await this.passwordTokenRepository.save({
      token: resetToken.token,
      userId: resetToken.userId,
      expiresAt: resetToken.expiresAt,
    });
    // 4. Send email with token link
    await this.emailSenderService.sendEmailPasswordEmail(user.email, token);
  }
}
