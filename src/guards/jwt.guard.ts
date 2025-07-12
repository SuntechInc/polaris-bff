import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../interfaces/user.interface';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../custom.logger';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'secret';
    this.logger.log(`JWT_SECRET configurado: ${this.jwtSecret.substring(0, 10)}...`, 'JwtAuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const publicRoutes = [
      '/healthz',
      '/auth/login',
      '/docs',
      'api-docs',
    ];
    const currentRoute = request.route?.path || request.url;
    const method = request.method;
    if (publicRoutes.some(route => currentRoute.includes(route))) {
      return true;
    }
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.error(`[JwtAuthGuard] Token não encontrado`, undefined, 'JwtAuthGuard');
      throw new UnauthorizedException('Token não fornecido');
    }
    try {
      const decoded = this.jwtService.decode(token);
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret }) as UserPayload;
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`[JwtAuthGuard] Erro ao verificar token: ${error.message}`, error.stack, 'JwtAuthGuard');
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
