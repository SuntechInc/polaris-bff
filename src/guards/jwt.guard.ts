import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../interfaces/user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Lista de rotas que não precisam de autenticação
    const publicRoutes = [
      '/healthz',
      '/auth/login',
      '/docs',
      'api-docs'
    ];
    
    // Verifica se a rota atual está na lista de rotas públicas
    const currentRoute = request.route?.path || request.url;
    if (publicRoutes.some(route => currentRoute.includes(route))) {
      return true;
    }

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const payload = this.jwtService.verify(token) as UserPayload;
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromRequest(request: any): string | undefined {
    // Primeiro tenta extrair do header Authorization
    const authHeader = this.extractTokenFromHeader(request);
    if (authHeader) {
      return authHeader;
    }

    // Se não encontrar no header, tenta extrair do cookie
    const cookieToken = this.extractTokenFromCookie(request);
    if (cookieToken) {
      return cookieToken;
    }

    return undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: any): string | undefined {
    // Verifica se existe cookie 'auth'
    const authCookie = request.cookies?.auth;
    if (authCookie) {
      return authCookie;
    }

    // Se não encontrar cookie 'auth', tenta extrair de outros cookies
    // Pode ser necessário ajustar conforme o formato do seu cookie
    const allCookies = request.headers.cookie;
    if (allCookies) {
      const cookies = allCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      // Tenta encontrar token em diferentes formatos de cookie
      return cookies.auth || cookies.token || cookies.jwt;
    }

    return undefined;
  }
}
