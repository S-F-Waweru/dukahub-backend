import { Email } from '../../domain/value-objects/email.vo';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface IEmailService {
  // sendEmailPasswordEmail(to: Email, token: string): Promise<void>;
  sendEmailVerificationEmail(to: Email, token: RefreshToken): Promise<void>;
}

export const IEmailService = Symbol('IEmailService');
