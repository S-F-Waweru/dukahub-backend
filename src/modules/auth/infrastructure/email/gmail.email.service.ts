import { IEmailService } from '../../application/services/email-sender.service';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class GmailEmailService implements IEmailService {
  private readonly logger = new Logger(GmailEmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASSWORD;

    if (!user || !pass) {
      this.logger.error(
        'EMAIL_FROM or EMAIL_APP_PASSWORD env vars are missing. Email sending will fail.',
      );
    }
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }
  // todo
  // async  sendEmailVerificationEmail(to, token){
  //
  // }
}
