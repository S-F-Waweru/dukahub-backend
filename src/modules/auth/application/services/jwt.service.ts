import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  userId: string;
  merchantId: string;
  role?: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload) {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });
  }

  generateRefreshToken(payload: { userId: string }) {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
  }

  verifyRefreshToken(token: string): { userId: string } {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }
}
