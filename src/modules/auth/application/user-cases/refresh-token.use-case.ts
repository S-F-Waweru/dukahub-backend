import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { JwtService } from '../services/jwt.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { refreshToken } = input;

    // 1. Find the refresh token in the repository
    const tokenEntity =
      await this.refreshTokenRepository.findByToken(refreshToken);

    // 2. Validate existence and validity
    if (!tokenEntity || !tokenEntity.isValid()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 3. Get user data for token generation
    const user = await this.userRepository.findById(tokenEntity.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 4. Revoke old token
    tokenEntity.revoke();
    await this.refreshTokenRepository.update(tokenEntity);

    // 5. Generate new refresh token
    const newRefreshTokenString = this.jwtService.generateRefreshToken({
      userId: user.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 6. Create new refresh token entity
    const newTokenEntity = RefreshToken.create(
      newRefreshTokenString,
      user.id,
      expiresAt,
    );

    await this.refreshTokenRepository.save(newTokenEntity);

    // 7. Generate new access token
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      merchantId: user.merchantId,
      email: user.email.value,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}
