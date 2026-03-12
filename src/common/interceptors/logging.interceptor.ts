import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    //   Log Request
    this.logger.log(`[Request] ${method} ${url} - ${userAgent}`);

    //   Log Request body in development(sanitized)

    if (process.env.NODE_ENV !== 'development') {
      // todo fix this sanitize bug : Sanitize 😎😎
      const sanitizedBody = this.sanitizeBody(body);
      if (Object.keys(sanitizedBody).length > 0) {
        this.logger.debug(`[Request] ${JSON.stringify(sanitizedBody)}`);
      }
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log(
            `[Response] ${method}  ${url} ${statusCode}  - ${responseTime}ms `,
          );
        },

        error: (err) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[Error] ${method}  ${url}  - ${responseTime}ms `,
            err.message,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'newPassword',
      'currentPassword',
      'token',
      'refreshToken',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
