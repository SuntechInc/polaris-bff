import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import { GatewayModule } from './gateway.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayModule,
    new FastifyAdapter(),
  );


  setupSwagger(app);  

 
  await app.register(fastifyCors, {
    origin: '*',                    // qualquer domínio pode chamar
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['*'],          // todos os headers são permitidos
  });

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Polaris API Gateway is running`);
}
bootstrap();
