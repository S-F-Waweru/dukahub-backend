import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { LoginDto } from '../dto/login.dto';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHasherService } from '../services/password-hasher.service';
import { JwtService } from '../services/jwt.service';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto) {
    // 1. Find user by email in database
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email);

    // 2. Check if user exists (throw error if not found)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); // Use UnauthorizedException, not NotFoundException
    }
    // 3. Verify the provided password against stored password hash
    if (!user.password) {
      throw new NotFoundException('User password not found or invalid');
    }
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password.value,
    );

    // 4. Check if password is valid (throw error if incorrect)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials'); // Same message as step 2 (security)
    }
    // 5. Generate new access token (JWT) with user data
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      merchantId: user.merchantId,
      email: user.email.value,
    });

    // 6. Generate new refresh token (JWT) for session extension
    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id,
    });


    // 6. Hash the refresh token for storage
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // 7. Save refresh token to database for later validation
    // ✅ NEW: Create RefreshToken entity first
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshTokenEntity = RefreshToken.create(
      tokenHash, // The token string
      user.id, // User ID
      expiresAt, // Expiration date
    );
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // 8. Return tokens and user information (excluding sensitive data)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        merchantId: user.merchantId,
        // role: user.role,
      },
    };
  }
}
