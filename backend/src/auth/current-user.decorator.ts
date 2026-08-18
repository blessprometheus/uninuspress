import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest<{
      user: CurrentUserType;
    }>();
    return request.user;
  },
);
