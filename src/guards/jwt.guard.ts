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
    this.logger.debug(`[JwtAuthGuard] Verificando rota: ${method} ${currentRoute}`, 'JwtAuthGuard');
    this.logger.debug(`[JwtAuthGuard] URL completa: ${request.url}`, 'JwtAuthGuard');
    this.logger.debug(`[JwtAuthGuard] Headers: ${JSON.stringify(request.headers, null, 2)}`, 'JwtAuthGuard');
    if (publicRoutes.some(route => currentRoute.includes(route))) {
      this.logger.debug(`[JwtAuthGuard] Rota pública detectada: ${currentRoute}`, 'JwtAuthGuard');
      return true;
    }
    this.logger.debug(`[JwtAuthGuard] Rota protegida, verificando autenticação...`, 'JwtAuthGuard');
    const token = await this.extractTokenFromRequest(request);
    if (!token) {
      this.logger.error(`[JwtAuthGuard] Token não encontrado`, undefined, 'JwtAuthGuard');
      throw new UnauthorizedException('Token não fornecido');
    }
    this.logger.debug(`[JwtAuthGuard] Token encontrado: ${token.substring(0, 20)}...`, 'JwtAuthGuard');
    try {
      const decoded = this.jwtService.decode(token);
      this.logger.debug(`[JwtAuthGuard] Token decodificado (sem verificar): ${JSON.stringify(decoded, null, 2)}`, 'JwtAuthGuard');
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret }) as UserPayload;
      this.logger.debug(`[JwtAuthGuard] Token válido, payload: ${JSON.stringify(payload, null, 2)}`, 'JwtAuthGuard');
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`[JwtAuthGuard] Erro ao verificar token: ${error.message}`, error.stack, 'JwtAuthGuard');
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private async extractTokenFromRequest(request: any): Promise<string | undefined> {
    this.logger.debug(`[JwtAuthGuard] Extraindo token da requisição...`, 'JwtAuthGuard');
    const authHeader = this.extractTokenFromHeader(request);
    if (authHeader) {
      this.logger.debug(`[JwtAuthGuard] Token encontrado no header Authorization`, 'JwtAuthGuard');
      return authHeader;
    }
    const cookieToken = await this.extractTokenFromCookie(request);
    if (cookieToken) {
      this.logger.debug(`[JwtAuthGuard] Token encontrado no cookie`, 'JwtAuthGuard');
      return cookieToken;
    }
    this.logger.debug(`[JwtAuthGuard] Nenhum token encontrado`, 'JwtAuthGuard');
    return undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    this.logger.debug(`[JwtAuthGuard] Header Authorization: ${type} ${token ? token.substring(0, 20) + '...' : 'undefined'}`, 'JwtAuthGuard');
    return type === 'Bearer' ? token : undefined;
  }

  private async extractTokenFromCookie(request: any): Promise<string | undefined> {
    this.logger.debug(`[JwtAuthGuard] Verificando cookies...`, 'JwtAuthGuard');
    this.logger.debug(`[JwtAuthGuard] request.cookies: ${JSON.stringify(request.cookies)}`, 'JwtAuthGuard');
    this.logger.debug(`[JwtAuthGuard] request.headers.cookie: ${request.headers.cookie}`, 'JwtAuthGuard');
    const authCookie = request.cookies?.auth;
    if (authCookie) {
      this.logger.debug(`[JwtAuthGuard] Cookie 'auth' encontrado: ${authCookie.substring(0, 20)}...`, 'JwtAuthGuard');
      if (this.ironSessionService.isIronSessionCookie(authCookie)) {
        this.logger.debug(`[JwtAuthGuard] Cookie é do iron-session, descriptografando...`, 'JwtAuthGuard');
        const decryptedToken = await this.ironSessionService.decryptCookie(authCookie);
        this.logger.debug(`[JwtAuthGuard] Token descriptografado: ${decryptedToken ? decryptedToken.substring(0, 20) + '...' : 'null'}`, 'JwtAuthGuard');
        return decryptedToken || undefined;
      }
      this.logger.debug(`[JwtAuthGuard] Cookie não é iron-session, usando valor direto`, 'JwtAuthGuard');
      return authCookie;
    }
    const allCookies = request.headers.cookie;
    if (allCookies) {
      this.logger.debug(`[JwtAuthGuard] Parsing cookies do header...`, 'JwtAuthGuard');
      const cookies = allCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      this.logger.debug(`[JwtAuthGuard] Cookies parseados: ${JSON.stringify(cookies)}`, 'JwtAuthGuard');
      const cookieValue = cookies.auth || cookies.token || cookies.jwt;
      if (cookieValue) {
        this.logger.debug(`[JwtAuthGuard] Cookie encontrado: ${cookieValue.substring(0, 20)}...`, 'JwtAuthGuard');
        if (this.ironSessionService.isIronSessionCookie(cookieValue)) {
          this.logger.debug(`[JwtAuthGuard] Cookie é do iron-session, descriptografando...`, 'JwtAuthGuard');
          const decryptedToken = await this.ironSessionService.decryptCookie(cookieValue);
          this.logger.debug(`[JwtAuthGuard] Token descriptografado: ${decryptedToken ? decryptedToken.substring(0, 20) + '...' : 'null'}`, 'JwtAuthGuard');
          return decryptedToken || undefined;
        }
        this.logger.debug(`[JwtAuthGuard] Cookie não é iron-session, usando valor direto`, 'JwtAuthGuard');
        return cookieValue;
      }
    }
    this.logger.debug(`[JwtAuthGuard] Nenhum cookie de autenticação encontrado`, 'JwtAuthGuard');
    return undefined;
  }
}
