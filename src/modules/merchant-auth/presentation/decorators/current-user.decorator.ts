import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Define the user type that JWT Strategy attaches to request
export interface AuthUser {
  userId: string;
  merchantId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Type assertion for request.user
    const user = request.user as AuthUser;

    if (!user) {
      return undefined;
    }

    if (data) {
      // Return specific property with type safety
      return user[data];
    }

    // Return entire user object
    return user;
  },
);
