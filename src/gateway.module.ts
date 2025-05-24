import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { BffModule } from './routes/bff.module';
import { HealthController } from './healthz/healthz.controller';

@Module({
  imports: [ BffModule],
  controllers: [GatewayController, HealthController],
  providers: [],
})
export class GatewayModule {}
