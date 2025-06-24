import { HttpService } from "@nestjs/axios";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { map, Observable } from "rxjs";
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
    login(@Body() credentials: CredentialDto): Observable<any> {
      // encaminha para http://<auth-service>/login
      return this.httpService
        .post(`${this.authUrl}/auth/login`, credentials)
        .pipe(
          map(response => response.data)
        );
    }
}