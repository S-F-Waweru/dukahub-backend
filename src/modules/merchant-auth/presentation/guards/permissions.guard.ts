// presentation/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CheckUserPermissionUseCase } from '../../application/user-cases/check-user-permission.use-case';

export interface JwtPayload {
  userId: string;
  email: string;
  merchantId: string;
  roles?: string[];
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly checkPermissionUseCase: CheckUserPermissionUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.checkPermissionUseCase.execute({
        userId: user.userId,
        permission,
      });

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}
