import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface IPassswordTokenRepository {
  findByToken(token: string): Promise<PasswordResetToken | null>;
  save(token: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;
  markAsUsed(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>; // optional, clean old tokens
}

export const IPassswordTokenRepository = Symbol('IPassswordTokenRepository');
