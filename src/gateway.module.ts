import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { BffModule } from './routes/bff.module';
import { HealthController } from './healthz/healthz.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'local' ? '.env.local' : undefined,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    BffModule],
  controllers: [GatewayController, HealthController],
  providers: [],
})
export class GatewayModule {}
