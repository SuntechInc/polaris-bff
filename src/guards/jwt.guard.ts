import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../interfaces/user.interface';
import { IronSessionService } from '../services/iron-session.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private ironSessionService: IronSessionService,
    private configService: ConfigService
  ) {
    this.configService.get<string>('JWT_SECRET') || 'secret';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Lista de rotas que não precisam de autenticação
    const publicRoutes = [
      '/healthz',
      '/auth/login',
      '/auth/test-iron-session',
      '/docs',
      'api-docs'
    ];
    
    // Verifica se a rota atual está na lista de rotas públicas
    const currentRoute = request.route?.path || request.url;
    const method = request.method;
    
    console.log(`🔍 [JwtAuthGuard] Verificando rota: ${method} ${currentRoute}`);
    console.log(`🔍 [JwtAuthGuard] URL completa: ${request.url}`);
    console.log(`🔍 [JwtAuthGuard] Headers:`, JSON.stringify(request.headers, null, 2));
    
    if (publicRoutes.some(route => currentRoute.includes(route))) {
      console.log(`✅ [JwtAuthGuard] Rota pública detectada: ${currentRoute}`);
      return true;
    }

    console.log(`🔐 [JwtAuthGuard] Rota protegida, verificando autenticação...`);

    const token = await this.extractTokenFromRequest(request);

    if (!token) {
      console.log(`❌ [JwtAuthGuard] Token não encontrado`);
      throw new UnauthorizedException('Token não fornecido');
    }

    console.log(`🔑 [JwtAuthGuard] Token encontrado: ${token.substring(0, 20)}...`);

    try {
      const payload = this.jwtService.verify(token) as UserPayload;
      console.log(`✅ [JwtAuthGuard] Token válido, payload:`, JSON.stringify(payload, null, 2));
      request.user = payload;
      return true;
    } catch (error) {
      console.log(`❌ [JwtAuthGuard] Erro ao verificar token:`, error.message);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private async extractTokenFromRequest(request: any): Promise<string | undefined> {
    console.log(`🔍 [JwtAuthGuard] Extraindo token da requisição...`);
    
    // Primeiro tenta extrair do header Authorization
    const authHeader = this.extractTokenFromHeader(request);
    if (authHeader) {
      console.log(`🔑 [JwtAuthGuard] Token encontrado no header Authorization`);
      return authHeader;
    }

    // Se não encontrar no header, tenta extrair do cookie
    const cookieToken = await this.extractTokenFromCookie(request);
    if (cookieToken) {
      console.log(`🍪 [JwtAuthGuard] Token encontrado no cookie`);
      return cookieToken;
    }

    console.log(`❌ [JwtAuthGuard] Nenhum token encontrado`);
    return undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(`🔍 [JwtAuthGuard] Header Authorization: ${type} ${token ? token.substring(0, 20) + '...' : 'undefined'}`);
    return type === 'Bearer' ? token : undefined;
  }

  private async extractTokenFromCookie(request: any): Promise<string | undefined> {
    console.log(`🔍 [JwtAuthGuard] Verificando cookies...`);
    console.log(`🍪 [JwtAuthGuard] request.cookies:`, request.cookies);
    console.log(`🍪 [JwtAuthGuard] request.headers.cookie:`, request.headers.cookie);
    
    // Verifica se existe cookie 'auth'
    const authCookie = request.cookies?.auth;
    if (authCookie) {
      console.log(`🍪 [JwtAuthGuard] Cookie 'auth' encontrado: ${authCookie.substring(0, 20)}...`);
      
      // Verifica se é um cookie do iron-session
      if (this.ironSessionService.isIronSessionCookie(authCookie)) {
        console.log(`🔓 [JwtAuthGuard] Cookie é do iron-session, descriptografando...`);
        // Descriptografa o cookie do iron-session
        const decryptedToken = await this.ironSessionService.decryptCookie(authCookie);
        console.log(`🔓 [JwtAuthGuard] Token descriptografado: ${decryptedToken ? decryptedToken.substring(0, 20) + '...' : 'null'}`);
        return decryptedToken || undefined;
      }
      // Se não for iron-session, retorna o valor direto (compatibilidade)
      console.log(`🍪 [JwtAuthGuard] Cookie não é iron-session, usando valor direto`);
      return authCookie;
    }

    // Se não encontrar cookie 'auth', tenta extrair de outros cookies
    const allCookies = request.headers.cookie;
    if (allCookies) {
      console.log(`🔍 [JwtAuthGuard] Parsing cookies do header...`);
      const cookies = allCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      console.log(`🍪 [JwtAuthGuard] Cookies parseados:`, cookies);
      
      // Tenta encontrar token em diferentes formatos de cookie
      const cookieValue = cookies.auth || cookies.token || cookies.jwt;
      if (cookieValue) {
        console.log(`🍪 [JwtAuthGuard] Cookie encontrado: ${cookieValue.substring(0, 20)}...`);
        
        // Verifica se é um cookie do iron-session
        if (this.ironSessionService.isIronSessionCookie(cookieValue)) {
          console.log(`🔓 [JwtAuthGuard] Cookie é do iron-session, descriptografando...`);
          // Descriptografa o cookie do iron-session
          const decryptedToken = await this.ironSessionService.decryptCookie(cookieValue);
          console.log(`🔓 [JwtAuthGuard] Token descriptografado: ${decryptedToken ? decryptedToken.substring(0, 20) + '...' : 'null'}`);
          return decryptedToken || undefined;
        }
        // Se não for iron-session, retorna o valor direto
        console.log(`🍪 [JwtAuthGuard] Cookie não é iron-session, usando valor direto`);
        return cookieValue;
      }
    }

    console.log(`❌ [JwtAuthGuard] Nenhum cookie de autenticação encontrado`);
    return undefined;
  }
}
