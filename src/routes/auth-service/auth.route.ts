import { HttpService } from "@nestjs/axios";
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Get, UseGuards, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { CredentialDto } from "./dto/credential.dto";
import { AdminGuard } from "../../guards/admin.guard";
import { CurrentUser } from "../../decorators/user.decorator";
import { UserPayload } from "../../interfaces/user.interface";
import { IronSessionService } from "../../services/iron-session.service";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    private readonly authUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly ironSessionService: IronSessionService
    ) {
        this.authUrl = this.configService.get<string>('AUTH_SERVICE_URL');
        console.log(`🔧 [AuthController] AUTH_SERVICE_URL configurado: ${this.authUrl}`);
    }

    @ApiOperation({ summary: 'Login' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() credentials: CredentialDto): Promise<any> {
      console.log(`🚀 [AuthController] Login iniciado`);
      console.log(`📝 [AuthController] Credenciais recebidas:`, JSON.stringify(credentials, null, 2));
      console.log(`🔗 [AuthController] Fazendo requisição para: ${this.authUrl}/auth/login`);
      
      try {
        console.log(`📤 [AuthController] Enviando requisição POST...`);
        const response = await firstValueFrom(
          this.httpService.post(`${this.authUrl}/auth/login`, credentials)
        );
        console.log(`✅ [AuthController] Resposta recebida:`, JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error: any) {
        console.log(`❌ [AuthController] Erro na requisição:`, error.message);
        console.log(`❌ [AuthController] Status do erro:`, error.response?.status);
        console.log(`❌ [AuthController] Dados do erro:`, error.response?.data);
        console.log(`❌ [AuthController] Headers do erro:`, error.response?.headers);
        
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const payload = error.response?.data || { message: 'Unknown error' };
        console.log(`🚨 [AuthController] Lançando HttpException com status ${status}`);
        throw new HttpException(payload, status);
      }
    }

    @ApiOperation({ summary: 'Teste de descriptografia do iron-session' })
    @Get('test-iron-session')
    async testIronSession(@Req() request: any): Promise<any> {
      console.log(`🧪 [AuthController] Teste de iron-session iniciado`);
      
      const authCookie = request.cookies?.auth;
      if (!authCookie) {
        return { error: 'Cookie auth não encontrado' };
      }

      console.log(`🍪 [AuthController] Cookie auth encontrado: ${authCookie.substring(0, 50)}...`);

      if (!this.ironSessionService.isIronSessionCookie(authCookie)) {
        return { error: 'Cookie não é do iron-session' };
      }

      try {
        const decryptedToken = await this.ironSessionService.decryptCookie(authCookie);
        if (decryptedToken) {
          return {
            success: true,
            token: decryptedToken.substring(0, 50) + '...',
            tokenLength: decryptedToken.length
          };
        } else {
          return { error: 'Falha na descriptografia' };
        }
      } catch (error) {
        return { error: 'Erro na descriptografia', details: error.message };
      }
    }

    @ApiOperation({ summary: 'Perfil do usuário - qualquer usuário autenticado' })
    @ApiBearerAuth()
    @Get('profile')
    async getProfile(@CurrentUser() user: UserPayload) {
        return {
            message: 'Perfil do usuário',
            user: {
                id: user.sub,
                email: user.email,
                userType: user.userType,
                companyId: user.companyId,
                actionCompanyId: user.actionCompanyId
            }
        };
    }

    @ApiOperation({ summary: 'Rota apenas para GLOBAL_ADMIN' })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('admin-only')
    async adminOnlyRoute(@CurrentUser() user: UserPayload, @Req() request: any) {
        console.log(`🔐 [AuthController] Endpoint admin-only acessado`);
        console.log(`👤 [AuthController] Usuário autenticado:`, JSON.stringify(user, null, 2));
        
        // Teste adicional da descriptografia do iron-session
        const authCookie = request.cookies?.auth;
        if (authCookie) {
            console.log(`🍪 [AuthController] Cookie auth encontrado: ${authCookie.substring(0, 50)}...`);
            
            if (this.ironSessionService.isIronSessionCookie(authCookie)) {
                console.log(`🔓 [AuthController] Cookie é do iron-session, testando descriptografia...`);
                try {
                    const decryptedToken = await this.ironSessionService.decryptCookie(authCookie);
                    if (decryptedToken) {
                        console.log(`✅ [AuthController] Descriptografia bem-sucedida! Token: ${decryptedToken.substring(0, 50)}...`);
                    } else {
                        console.log(`❌ [AuthController] Descriptografia falhou - token null`);
                    }
                } catch (error) {
                    console.log(`❌ [AuthController] Erro na descriptografia:`, error.message);
                }
            } else {
                console.log(`🍪 [AuthController] Cookie não é do iron-session`);
            }
        } else {
            console.log(`❌ [AuthController] Cookie auth não encontrado`);
        }
        
        return {
            message: 'Acesso permitido apenas para GLOBAL_ADMIN',
            user: user,
            ironSessionTest: {
                cookieFound: !!authCookie,
                isIronSession: authCookie ? this.ironSessionService.isIronSessionCookie(authCookie) : false,
                decryptionSuccess: authCookie && this.ironSessionService.isIronSessionCookie(authCookie) ? 
                    await this.ironSessionService.decryptCookie(authCookie).then(token => !!token).catch(() => false) : false
            }
        };
    }

    @ApiOperation({ summary: 'Rota exclusiva para GLOBAL_ADMIN - Dashboard de Administração' })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('global-admin/dashboard')
    async globalAdminDashboard(@CurrentUser() user: UserPayload) {
        console.log(`👑 [AuthController] Dashboard GLOBAL_ADMIN acessado por: ${user.email}`);
        
        return {
            message: 'Dashboard de Administração Global',
            user: {
                id: user.sub,
                email: user.email,
                userType: user.userType,
                companyId: user.companyId,
                actionCompanyId: user.actionCompanyId
            },
            dashboard: {
                title: 'Painel de Controle Global',
                description: 'Acesso exclusivo para administradores globais',
                features: [
                    'Gerenciamento de usuários globais',
                    'Configurações de sistema',
                    'Relatórios administrativos',
                    'Monitoramento de atividades'
                ],
                stats: {
                    totalUsers: 1250,
                    activeCompanies: 45,
                    systemHealth: 'excellent',
                    lastUpdate: new Date().toISOString()
                }
            }
        };
    }

    @ApiOperation({ summary: 'Rota exclusiva para GLOBAL_ADMIN - Configurações do Sistema' })
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('global-admin/system-config')
    async globalAdminSystemConfig(@CurrentUser() user: UserPayload) {
        console.log(`⚙️ [AuthController] Configurações do sistema acessadas por: ${user.email}`);
        
        return {
            message: 'Configurações do Sistema',
            user: {
                id: user.sub,
                email: user.email,
                userType: user.userType
            },
            systemConfig: {
                environment: process.env.NODE_ENV || 'development',
                version: '1.0.0',
                features: {
                    ironSession: true,
                    jwtAuth: true,
                    cors: true,
                    rateLimit: true
                },
                security: {
                    jwtExpiration: '1h',
                    ironSessionTTL: '7d',
                    corsEnabled: true
                }
            }
        };
    }
}