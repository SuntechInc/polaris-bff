import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActionCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.actionCompanyId) {
      throw new Error('actionCompanyId not found in JWT token');
    }
    
    return user.actionCompanyId;
  },
); 