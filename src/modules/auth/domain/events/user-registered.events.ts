import { Email } from "../value-objects/email.vo";

export class UserRegistedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: Email,
    public readonly firstName: string,
    public readonly merchantId: string,
  ) {}
}
}
