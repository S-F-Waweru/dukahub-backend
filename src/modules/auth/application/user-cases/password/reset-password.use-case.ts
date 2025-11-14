import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from 'src/modules/auth/domain/interfaces/user.repository.interface';
import { IPassswordTokenRepository } from 'src/modules/auth/domain/repositories/password-reset-token.repository.interface';
import { PasswordHasherService } from '../../services/password-hasher.service';
import { PasswordResetToken } from 'src/modules/auth/domain/entities/password-reset-token.entity';
import { Password } from 'src/modules/auth/domain/value-objects/password.vo';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,

    @Inject(IPassswordTokenRepository)
    private readonly passwordResetTokenRepository: IPassswordTokenRepository,

    private readonly passwordHasherService: PasswordHasherService,
  ) {}
  async execute(input: ResetPasswordInput) {
    const { token, newPassword } = input;
    // 1. Find the reset token
    const tokenEntity: PasswordResetToken | null =
      await this.passwordResetTokenRepository.findByToken(token);
    if (!tokenEntity) {
      throw new UnauthorizedException('invalid password reset Token');
    }

    // 2. Check if token is expired or already used
    if (tokenEntity.isUsed || tokenEntity.expiresAt < new Date()) {
      throw new BadRequestException('Token expired or already used');
    }

    // 3. Find the user
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    // 4. Hash the new password and update the user
    const hashedPassword = await this.passwordHasherService.hash(newPassword);
    const newHashedPassword = new Password(hashedPassword);
    user.changePassword(newHashedPassword);
    await this.userRepository.save(user);

    //   5. Mark the token as used
    await this.passwordResetTokenRepository.markAsUsed(token);
  }
}
