import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { GatewayModule } from './gateway.module';
import { setupSwagger } from './config/swagger.config';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CustomLogger } from './custom.logger';

async function bootstrap() {
  
  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayModule,
    new FastifyAdapter(),
  );
  app.useLogger(app.get(CustomLogger));

  const jwtGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtGuard);

  setupSwagger(app);  

  await app.register(fastifyCors, {
    origin: true,                    // qualquer domínio pode chamar
    credentials: true,            // todos os headers são permitidos
  });



  await app.register(fastifyCookie, {
    secret: process.env.IRON_SESSION_SECRET || '12345678901234567890123456789012',
  });

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');

  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'undefined';
  const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL ?? 'undefined';

  console.log(`➡️  AUTH_SERVICE_URL = ${AUTH_SERVICE_URL}`);
  console.log(`➡️  CORE_SERVICE_URL = ${CORE_SERVICE_URL}`);

  console.log(`🚀 Polaris API Gateway is running`);
}
bootstrap();
