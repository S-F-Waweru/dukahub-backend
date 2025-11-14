import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from 'src/modules/auth/domain/interfaces/user.repository.interface';
import { PasswordHasherService } from '../../services/password-hasher.service';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Password } from 'src/modules/auth/domain/value-objects/password.vo';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class changePasswordUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    // private readonly eventEmitter: EventEmitter,
  ) {}

  async execute(input: ChangePasswordInput) {
    // 1. Find user by ID
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UnauthorizedException('User Not Found');
    }

    // 2. Validate current password
    await this.validateCurrentPassword(user, input.currentPassword);

    // 3. Create and validate new password
    const newPassword = new Password(input.newPassword);

    // 4. Hash new password
    const hashedPassword = await this.passwordHasher.hash(newPassword.value);
    const securePassword = new Password(hashedPassword, true);

    // 5. Update user password
    user.changePassword(securePassword);

    // 6. Save updated user
    await this.userRepository.update(user);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  private async validateCurrentPassword(
    user: User,
    currentPassword: string,
  ): Promise<void> {
    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      throw new BadRequestException(
        'Password change not allowed for this account type',
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      currentPassword,
      user.password.value,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Additional security check: ensure user can perform this action
    if (!user.isActive()) {
      throw new UnauthorizedException('Account is not active');
    }
  }
}
