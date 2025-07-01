import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserPayload } from '../interfaces/user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.userType !== 'GLOBAL_ADMIN') {
      throw new ForbiddenException('Acesso negado. Apenas GLOBAL_ADMIN pode acessar esta rota');
    }

    return true;
  }
} 