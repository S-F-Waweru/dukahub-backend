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

@Injectable()
export class LoginUserUsecase {
  constructor(
    @Inject(IUserRepository)
    private readonly userReposotory: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto) {
    // 1. Find user by email in database
    const email = new Email(dto.email);
    const user = await this.userReposotory.findByEmail(email);

    // 2. Check if user exists (throw error if not found)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials'); // Use UnauthorizedException, not NotFoundException
    }
    // 3. Verify the provided password against stored password hash
    if (!user.password || typeof user.password !== 'string') {
      throw new NotFoundException('User password not found or invalid');
    }
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password,
    );

    // 4. Check if password is valid (throw error if incorrect)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials'); // Same message as step 2 (security)
    }
    // 5. Generate new access token (JWT) with user data
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      merchantId: user.merchantId,
      // todo add role
    });

    // 6. Generate new refresh token (JWT) for session extension

    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id,
    });
    // 7. Save refresh token to database for later validation
    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

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
