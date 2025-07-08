import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../interfaces/user.interface';
import { IronSessionService } from '../services/iron-session.service';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../custom.logger';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private jwtService: JwtService,
    private ironSessionService: IronSessionService,
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
      '/auth/test-iron-session',
      '/docs',
      'api-docs',
    ];
    const currentRoute = request.route?.path || request.url;
    const method = request.method;
    if (publicRoutes.some(route => currentRoute.includes(route))) {
      return true;
    }
    const token = await this.extractTokenFromRequest(request);
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

  private async extractTokenFromRequest(request: any): Promise<string | undefined> {
    const authHeader = this.extractTokenFromHeader(request);
    if (authHeader) {
      return authHeader;
    }
    const cookieToken = await this.extractTokenFromCookie(request);
    if (cookieToken) {
      return cookieToken;
    }
    return undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async extractTokenFromCookie(request: any): Promise<string | undefined> {

    const authCookie = request.cookies?.auth;
    if (authCookie) {

      if (this.ironSessionService.isIronSessionCookie(authCookie)) {
    
        const decryptedToken = await this.ironSessionService.decryptCookie(authCookie);
        return decryptedToken || undefined;
      }
      return authCookie;
    }
    const allCookies = request.headers.cookie;
    if (allCookies) {
      const cookies = allCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      const cookieValue = cookies.auth || cookies.token || cookies.jwt;
      if (cookieValue) {
        if (this.ironSessionService.isIronSessionCookie(cookieValue)) {
          const decryptedToken = await this.ironSessionService.decryptCookie(cookieValue);
          return decryptedToken || undefined;
        }
        return cookieValue;
      }
    }
    return undefined;
  }
}
