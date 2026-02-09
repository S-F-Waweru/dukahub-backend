import { Email } from '../value-objects/email.vo';

export class EmailVerificationRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: Email,
    public readonly token: string,
  ) { }
}
