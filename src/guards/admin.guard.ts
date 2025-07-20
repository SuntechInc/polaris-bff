import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserPayload } from '../interfaces/user.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    // Skip admin check if SKIP_AUTH is enabled
    const skipAuth = this.configService.get<string>('SKIP_AUTH');
    if (skipAuth === 'true') {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.userType !== 'GLOBAL_ADMIN') {
      throw new ForbiddenException('Acesso negado. Apenas GLOBAL_ADMIN pode acessar esta rota');
    }

    return true;
  }
} 