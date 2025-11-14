import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from 'src/modules/auth/domain/interfaces/user.repository.interface';

import { PasswordHasherService } from '../../services/password-hasher.service';

import { Password } from 'src/modules/auth/domain/value-objects/password.vo';
import { IPasswordResetTokenRepository } from '../../../domain/interfaces/password-reset-token.repository.interface';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,

    @Inject(IPasswordResetTokenRepository) // ✅ Fixed interface name
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,

    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(input: ResetPasswordInput) {
    const { token, newPassword } = input;

    // 1. Find the reset token
    const tokenEntity =
      await this.passwordResetTokenRepository.findByToken(token);
    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid password reset token');
    }

    // 2. Check if token is expired or already used (use entity methods)
    if (!tokenEntity.isValid()) {
      // ✅ Use the entity's business method
      throw new BadRequestException('Token expired or already used');
    }

    // 3. Find the user
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 4. Hash the new password and update the user
    const hashedPassword = await this.passwordHasherService.hash(newPassword);
    const securePassword = new Password(hashedPassword, true); // ✅ Mark as hashed
    user.changePassword(securePassword);
    await this.userRepository.update(user); // ✅ Use update instead of save

    // 5. Mark the token as used (using entity method)
    tokenEntity.markAsUsed(); // ✅ Use entity business method
    await this.passwordResetTokenRepository.update(tokenEntity); // ✅ Update the entity

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
