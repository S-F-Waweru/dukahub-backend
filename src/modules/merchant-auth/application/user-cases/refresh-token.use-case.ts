import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { JwtService, RefreshTokenPayload } from '../services/jwt.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';
import * as crypto from 'crypto';

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

  async execute(
    refreshTokenString: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verify JWT signature
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshTokenString);
    } catch (error: any) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Hash the token to find it in DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenString)
      .digest('hex');

    // 3. Find token in database
    const storedToken =
      await this.refreshTokenRepository.findByToken(tokenHash);
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // 4. Validate using entity business logic
    if (!storedToken.isValid()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // 5. Verify user still exists and is active
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 6. Revoke old token (Token Rotation Pattern)
    storedToken.revoke();
    await this.refreshTokenRepository.save(storedToken);

    // 7. Generate new tokens
    const newAccessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      merchantId: user.merchantId,
      email: user.email.value,
    });

    const newRefreshTokenString = this.jwtService.generateRefreshToken({
      userId: user.id,
    });

    // 8. Store new refresh token
    const newTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshTokenString)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = RefreshToken.create(
      newTokenHash,
      user.id,
      expiresAt,
    );

    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}
