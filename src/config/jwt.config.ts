import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const jwtSecret = configService.get<string>('JWT_SECRET') || 'your-secret-key';
  console.log(`🔧 [JwtConfig] JWT_SECRET configurado: ${jwtSecret.substring(0, 10)}...`);
  console.log(`🔧 [JwtConfig] JWT_SECRET completo: ${jwtSecret}`);
  
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
