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
import type {Response, Request} from 'express';
import {RegisterUserUseCase} from '../../application/user-cases/register-user.use-case';
import {RefreshTokenUseCase} from '../../application/user-cases/refresh-token.use-case';
import {VerifyEmailUseCase} from '../../application/user-cases/verify-email-use-case';
import {ResendVerificationUseCase} from '../../application/user-cases/resend-verification.use-case';
import {LoginUserUseCase} from '../../application/user-cases/login-user-use-case.service';
import {LogoutUseCase} from '../../application/user-cases/logout-user.use-case';
import {RegisterDto} from '../../application/dto/register.dto';
import {LoginDto} from '../../application/dto/login.dto';
import {VerifyEmailDto} from '../../application/dto/verify-email.dto';
import {ResendVerificationDto} from '../../application/dto/resend-verification.dto';
import {Public} from '../decorators/public.decorator';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {CurrentUser} from '../decorators/current-user.decorator';
import {ResetPasswordDto} from '../../application/dto/reset-password.dto';
import {RequestPasswordResetDto} from '../../application/dto/request-password-reset.dto';
import {ResetPasswordUseCase} from '../../application/user-cases/password/reset-password.use-case';
import {
    RequestPasswordResetUseCase
} from '../../application/user-cases/password/request-password-reset-use-case.service';
import {Throttle} from '@nestjs/throttler';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiCookieAuth,
} from '@nestjs/swagger';

interface AuthRequest extends Request {
    cookies: {
        refreshToken?: string;
    };
}

@ApiTags('Merchant Auth')
@Controller('merchant-auth')
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
    ) {
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    // @Throttle({ default: { limit: 3, ttl: 3600000 } })
    @ApiOperation({summary: 'Register a new user'})
    @ApiResponse({status: 201, description: 'Registration successful. Please verify your email.'})
    @ApiResponse({status: 400, description: 'Validation error'})
    @ApiResponse({status: 429, description: 'Too many requests'})
    async register(@Body() dto: RegisterDto) {
        const user = await this.registerUserUseCase.execute({
            email: dto.email,
            password: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
        });

        return {
            message: 'Registration successful. Please verify your email.',
            userId: user.id,
        };
    }

    @Public()
    @Post('login')
    @Throttle({default: {limit: 5, ttl: 60000}})
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Login user'})
    @ApiResponse({status: 200, description: 'Login successful, returns access token and sets refresh token cookie'})
    @ApiResponse({status: 401, description: 'Invalid credentials'})
    @ApiResponse({status: 429, description: 'Too many requests'})
    async login(
        @Body() dto: LoginDto,
        @Res({passthrough: true}) res: Response,
    ) {
        const result = await this.loginUserUseCase.execute({
            email: dto.email,
            password: dto.password,
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
        };
    }

    @Public()
    @Post('refresh')
    @Throttle({default: {limit: 10, ttl: 60000}})
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('refreshToken')
    @ApiOperation({summary: 'Refresh access token using refresh token cookie'})
    @ApiResponse({status: 200, description: 'Returns new access token and rotates refresh token cookie'})
    @ApiResponse({status: 400, description: 'Refresh token not found'})
    @ApiResponse({status: 401, description: 'Invalid or expired refresh token'})
    async refresh(
        @Req() req: AuthRequest,
        @Res({passthrough: true}) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new BadRequestException('Refresh token not found');
        }

        const result = await this.refreshTokenUseCase.execute(refreshToken);

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
    @ApiBearerAuth()
    @ApiCookieAuth('refreshToken')
    @ApiOperation({summary: 'Logout user and invalidate refresh token'})
    @ApiResponse({status: 204, description: 'Logout successful'})
    @ApiResponse({status: 401, description: 'Unauthorized'})
    async logout(
        @CurrentUser('userId') userId: string,
        @Req() req: AuthRequest,
        @Res({passthrough: true}) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'];

        await this.logoutUserUseCase.execute({userId, refreshToken});

        res.clearCookie('refreshToken');
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({summary: 'Get current authenticated user profile'})
    @ApiResponse({status: 200, description: 'Returns current user profile'})
    @ApiResponse({status: 401, description: 'Unauthorized'})
    getProfile(@CurrentUser() user: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return user;
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Verify email address with token'})
    @ApiResponse({status: 200, description: 'Email verified successfully'})
    @ApiResponse({status: 400, description: 'Invalid or expired token'})
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        await this.verifyEmailUseCase.execute({token: dto.token});

        return {message: 'Email verified successfully'};
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Resend email verification link'})
    @ApiResponse({status: 200, description: 'Verification email sent successfully'})
    @ApiResponse({status: 400, description: 'Invalid email or already verified'})
    async resendVerification(@Body() dto: ResendVerificationDto) {
        await this.resendVerificationUseCase.execute({email: dto.email});

        return {message: 'Verification email sent successfully'};
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Request a password reset email'})
    @ApiResponse({status: 200, description: 'Password reset email sent successfully'})
    async forgotPassword(@Body() dto: RequestPasswordResetDto) {
        await this.requestPasswordResetUseCase.execute({email: dto.email});

        return {message: 'Password reset email sent successfully'};
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Reset password using reset token'})
    @ApiResponse({status: 200, description: 'Password reset successfully'})
    @ApiResponse({status: 400, description: 'Invalid or expired token'})
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.resetPasswordUseCase.execute({
            token: dto.token,
            newPassword: dto.newPassword,
        });

        return {message: 'Password reset successfully'};
    }
}
