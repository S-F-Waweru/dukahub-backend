import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';
import { JwtService } from '../services/jwt.service';

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
    private readonly refreshTokenReposotory: IRefreshTokenRepository,
    private jwtService: JwtService,
  ) {}

  async execute(input: RefreshTokenInput) {
    const { refreshToken } = input;
    // 1. Find the refresh token in the repository
    const tokenEntity =
      await this.refreshTokenReposotory.findByToken(refreshToken);
    // 2. Validate existence and expiry
    //   || tokenEntity.expiresAt < new Date()
    if (!tokenEntity) {
      throw new UnauthorizedException('invalid or expired refresh token');
    }
    // 3. Rotate refresh token (optional)
    const userId = tokenEntity.userId;
    const newRefreshToken = this.jwtService.generateRefreshToken({
      userId: userId,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenReposotory.save({
      userId: userId,
      token: newRefreshToken,
      expiresAt,
    });
    // 4. Generate new access token

    const accessToken = this.jwtService.generateAccessToken({
      userId: tokenEntity.userId,
      merchantId: tokenEntity.merchantId,
      //   todo : role tokenEntity.role
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
