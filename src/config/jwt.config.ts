import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const jwtSecret = configService.get<string>('JWT_SECRET') || 'your-secret-key';
  
  return {
    secret: jwtSecret,
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
    },
    verifyOptions: {
      ignoreExpiration: false,
    },
  };
};
