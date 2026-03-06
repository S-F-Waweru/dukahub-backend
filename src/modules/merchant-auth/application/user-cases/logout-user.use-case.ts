import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';
import * as crypto from 'crypto';

export interface LogoutUserInput {
  userId: string;
  refreshToken?: string;
}
@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: LogoutUserInput) {
    const tokenString = input.refreshToken;
    if (!tokenString) {
      throw new UnauthorizedException('No Token Provided');
    }
    const tokenHash = crypto
      .createHash('sha256')
      .update(tokenString)
      .digest('hex');

    // 1. Find the token in the repository
    const token = await this.refreshTokenRepository.findByToken(tokenHash);
    // 2. If not found, optionally throw an exception or silently return
    if (!token) {
      throw new UnauthorizedException('Invalis refresh Token');
    }
    if (token && token.isValid()) {
      token.revoke();
      await this.refreshTokenRepository.save(token);
    }
  }
}
