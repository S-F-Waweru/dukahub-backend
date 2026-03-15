import {
  BadRequestException,
  Inject,
  Injectable, Logger,
  NotFoundException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { Email } from '../../domain/value-objects/email.vo';
import {UserRegisteredEvent} from "../../domain/events/user-registered.events";
import {TokenGeneratorService} from "../services/token-generator.service";
import {IEmailSenderService} from "../services/email-sender.service";
import {EmailVerificationToken} from "../../domain/entities/email-verification-token.entity";
import * as eventPublisherInterface from "../../domain/interfaces/event-publisher.interface";

export interface ResendVerificationInput {
  email: string;
}

export interface ResendVerificationOutput {
  success: boolean;
  message: string;
}

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IEmailVerificationTokenRepository)
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly tokenGenerator: TokenGeneratorService,
    @Inject(eventPublisherInterface.IEventPublisher)
    private readonly eventPublisher: eventPublisherInterface.IEventPublisher,
  ) {}

  logger = new Logger(ResendVerificationUseCase.name)

  async execute(
    input: ResendVerificationInput,
  )
      // : Promise<ResendVerificationOutput>
  {
    // 1. Find user by email
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if user is already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // 3. Delete any existing verification tokens for this user
    await this.emailVerificationTokenRepository.deleteByUserId(user.id);

    // todo  : fix this use case and its dependencies
    // 4. Generate new verification token
    const verificationTokenString = this.tokenGenerator.generate(32); // 64 hex characters

    const verificationToken = EmailVerificationToken.create(
        verificationTokenString,
        user.id,
        new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    await this.emailVerificationTokenRepository.save(verificationToken);

    // 6. Send verification email
    // const emailSent = await this.emailSender.sendVerificationEmail(
    //   user.email.value,
    //   user.getFullName(),
    //   verificationToken,
    // );

    this.logger.debug("Reaching the email verification token");
    await this.eventPublisher.publish(
        new UserRegisteredEvent(
            user.id,
            user.email,
            user.firstName,
            user.merchantId,
        ),
    );

  }
}
