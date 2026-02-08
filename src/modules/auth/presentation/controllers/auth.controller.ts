import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  Get,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterUserUseCase } from '../../application/user-cases/register-user.use-case';
import { RefreshTokenUseCase } from '../../application/user-cases/refresh-token.use-case';
import { VerifyEmailUseCase } from '../../application/user-cases/verify-email-use-case';
import { ResendVerificationUseCase } from '../../application/user-cases/resend-verification.use-case';
import { LoginUserUseCase } from '../../application/user-cases/login-user-use-case.service';
import { LogoutUseCase } from '../../application/user-cases/logout-user.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { VerifyEmailDto } from '../../application/dto/verify-email.dto';
import { ResendVerificationDto } from '../../application/dto/resend-verification.dto';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { RequestPasswordResetDto } from '../../application/dto/request-password-reset.dto';
import { ResetPasswordUseCase } from '../../application/user-cases/password/reset-password.use-case';
import { RequestPasswordResetUseCase } from '../../application/user-cases/password/request-password-reset-use-case.service';

interface AuthRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      // phoneNumber: dto.phoneNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      // merchantId: dto.merchantId,
    });

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    // Set new refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser('userId') userId: string,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    console.log(
      'Debug: Logout user with ID:',
      userId,
      'and token:',
      refreshToken,
    );

    await this.logoutUserUseCase.execute({
      userId,
      refreshToken,
    });

    res.clearCookie('refreshToken');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.verifyEmailUseCase.execute({ token: dto.token });

    return {
      message: 'Email verified successfully',
    };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.resendVerificationUseCase.execute({ email: dto.email });

    return {
      message: 'Verification email sent successfully',
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: RequestPasswordResetDto) {
    await this.requestPasswordResetUseCase.execute({ email: dto.email });

    return {
      message: 'Password reset email sent successfully',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute({
      token: dto.token,
      newPassword: dto.newPassword,
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
