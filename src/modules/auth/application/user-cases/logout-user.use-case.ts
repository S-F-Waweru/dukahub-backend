import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(tokenStr: string) {
    // 1. Find the token in the repository
    const token = await this.refreshTokenRepository.findByToken(tokenStr);
    // 2. If not found, optionally throw an exception or silently return
    if (!token) {
      throw new UnauthorizedException('Invalis refresh Token');
    }
    // 3. Delete or revoke the token
    await this.refreshTokenRepository.delete(token);
    // 4. Optionally, you can emit a UserLoggedOutEvent via EventBus here
  }
}
