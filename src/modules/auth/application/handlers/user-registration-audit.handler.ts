// src/application/handlers/user-registration-audit.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';


@Injectable()
export class UserRegistrationAuditHandler {
  private readonly logger = new Logger(UserRegistrationAuditHandler.name);

  @OnEvent(UserRegisteredEvent.name)
  async handle(event: UserRegisteredEvent): Promise<void> {
    // Log registration for analytics
    this.logger.log(
      `User registered: ${event.email} for merchant: ${event.merchantId}`,
    );

    // You could:
    // 1. Send to analytics service
    // 2. Update registration metrics
    // 3. Trigger welcome workflows
    // 4. Notify admin users
  }
}
