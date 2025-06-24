import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { BffModule } from './routes/bff.module';
import { HealthController } from './healthz/healthz.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,
      envFilePath: [
       `.env.${process.env.NODE_ENV}`,
       '.env'
      ]
     },),
    HttpModule,
    BffModule],
  controllers: [GatewayController, HealthController],
  providers: [],
})
export class GatewayModule {}
