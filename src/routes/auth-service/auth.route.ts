import { HttpService } from "@nestjs/axios";
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Get, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { CredentialDto } from "./dto/credential.dto";
import { AdminGuard } from "../../guards/admin.guard";
import { CurrentUser } from "../../decorators/user.decorator";
import { UserPayload } from "../../interfaces/user.interface";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    private readonly authUrl: string;

    constructor(private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.authUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    }

    @ApiOperation({ summary: 'Login' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() credentials: CredentialDto): Promise<any> {
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.authUrl}/auth/login`, credentials)
        );
        return response.data;
      } catch (error: any) {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const payload = error.response?.data || { message: 'Unknown error' };
        throw new HttpException(payload, status);
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
    async adminOnlyRoute(@CurrentUser() user: UserPayload) {
        return {
            message: 'Acesso permitido apenas para GLOBAL_ADMIN',
            user: user
        };
    }
}