import { HttpService } from "@nestjs/axios";
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {firstValueFrom } from "rxjs";
import { CredentialDto } from "./dto/credential.dto";


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
    @HttpCode(HttpStatus.OK)
    async login(@Body() credentials: CredentialDto): Promise<any> {
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.authUrl}/auth/login`, credentials)
        );
        return response;
      } catch (error) {
        throw new HttpException(error.response.data, error.response.status);
      }
    }
}