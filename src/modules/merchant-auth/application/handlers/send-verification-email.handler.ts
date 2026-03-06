import { Injectable, Logger, Inject } from '@nestjs/common';
import { EmailVerificationRequestedEvent } from '../../domain/events/email-verification-requested.event';
import { IEmailSenderService } from '../services/email-sender.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SendVerificationEmailHanlder {
  private readonly logger = new Logger(SendVerificationEmailHanlder.name);

  constructor(
    @Inject(IEmailSenderService)
    private readonly emailService: IEmailSenderService,
  ) {}

  @OnEvent(EmailVerificationRequestedEvent.name)
  async handle(event: EmailVerificationRequestedEvent) {
    try {
      this.logger.log(`Sending verification email to: ${event.email}`);
      await this.emailService.sendVerificationEmail(event.email, event.token);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${event.email}:`,
        error.message,
      );
      // Don't rethrow - event handlers should handle their own errors
      // Consider implementing a retry mechanism here
    }
  }
}
