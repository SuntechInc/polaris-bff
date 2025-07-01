import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET') || 'secret',
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
  },
  verifyOptions: {
    ignoreExpiration: false,
  },
});
