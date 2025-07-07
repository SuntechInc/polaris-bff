import { Module } from '@nestjs/common';
import { BffModule } from './routes/bff.module';
import { HealthController } from './healthz/healthz.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/jwt.config';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './custom.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'local' ? '.env.local' : undefined,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'trace'
      }
    }),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    BffModule],
  controllers: [HealthController],
  providers: [JwtAuthGuard, AdminGuard, CustomLogger],
  exports: [CustomLogger],
})
export class GatewayModule {}
