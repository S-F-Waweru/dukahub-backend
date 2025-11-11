import { JwtPayload } from '../../application/services/jwt.service';

export interface IRefreshTokenRepository {
  save(params: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
  findByToken(token: string): Promise<JwtPayload | null>;

  delete(token: JwtPayload): Promise<void>;

  deleteAllForUser(userId: string): Promise<void>;
}

export const IRefreshTokenRepository = Symbol('IRefreshTokenRepository');
