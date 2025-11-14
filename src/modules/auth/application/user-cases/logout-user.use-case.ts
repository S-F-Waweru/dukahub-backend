import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';

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

    // 1. Find the token in the repository
    const token = await this.refreshTokenRepository.findByToken(tokenString);
    // 2. If not found, optionally throw an exception or silently return
    if (!token) {
      throw new UnauthorizedException('Invalis refresh Token');
    }
    // 3. Delete or revoke the token
    await this.refreshTokenRepository.delete(token.id);
    // 4. Optionally, you can emit a UserLoggedOutEvent via EventBus here
  }
}
