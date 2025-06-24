import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GatewayModule } from './gateway.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayModule,
    new FastifyAdapter(),
  );


  setupSwagger(app);  

  // app.setGlobalPrefix('api');
  app.enableCors();

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Polaris API Gateway is running`);
}
bootstrap();
