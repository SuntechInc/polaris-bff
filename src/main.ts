import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import { GatewayModule } from './gateway.module';
import { setupSwagger } from './config/swagger.config';
import { JwtAuthGuard } from './guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayModule,
    new FastifyAdapter(),
  );

  // Configurar guard JWT global para todas as rotas
  const jwtGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtGuard);

  setupSwagger(app);  

 
  await app.register(fastifyCors, {
    origin: true,                    // qualquer domínio pode chamar
    credentials: true,            // todos os headers são permitidos
  });

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');
  const NODE_ENV = process.env.NODE_ENV ?? 'undefined';
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'undefined';
  console.log(`➡️  NODE_ENV = ${NODE_ENV}`);
  console.log(`➡️  AUTH_SERVICE_URL = ${AUTH_SERVICE_URL}`);

  console.log(`🚀 Polaris API Gateway is running`);
}
bootstrap();
