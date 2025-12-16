import { EmailVerificationToken } from '../entities/email-verification-token.entity';

export interface IEmailVerificationTokenRepository {
  findById(id: string): Promise<EmailVerificationToken | null>;
  findByToken(tokenHash: string): Promise<EmailVerificationToken | null>;
  findByUserId(userId: string): Promise<EmailVerificationToken[]>;
  save(token: EmailVerificationToken): Promise<EmailVerificationToken>;
  update(token: EmailVerificationToken): Promise<EmailVerificationToken>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}

export const IEmailVerificationTokenRepository = Symbol(
  'IEmailVerificationTokenRepository',
);
