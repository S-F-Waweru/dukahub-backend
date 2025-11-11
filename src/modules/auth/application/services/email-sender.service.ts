import { Email } from '../../domain/value-objects/email.vo';

export interface IEmailSenderService {
  sendEmailPasswordEmail(to: Email, token: string): Promise<void>;
}

export const IEmailSenderService = Symbol('SendEmailPasswordEmail');
