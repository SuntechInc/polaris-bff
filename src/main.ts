import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from '@/gateway.module';
import { setupSwagger } from '@/config/swagger.config';
import { setupAdminDocs } from '@/config/admin-docs.config';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { CustomLogger } from '@/custom.logger';
import { ValidationInterceptor } from '@/interceptors/validation.interceptor';

async function bootstrap() {
  
  const app = await NestFactory.create(GatewayModule);
  app.useLogger(app.get(CustomLogger));

  const jwtGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtGuard);

  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar interceptor de validação
  app.useGlobalInterceptors(new ValidationInterceptor());

  // Configurar CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configurar Swagger/ReDoc ANTES de iniciar o servidor
  setupSwagger(app);
  setupAdminDocs(app);

  const PORT = process.env.PORT || 3000;
  
  await app.listen(PORT, '0.0.0.0');

  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'undefined';
  const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL ?? 'undefined';

  console.log(`➡️  AUTH_SERVICE_URL = ${AUTH_SERVICE_URL}`);
  console.log(`➡️  CORE_SERVICE_URL = ${CORE_SERVICE_URL}`);

  console.log(`🚀 Polaris API Gateway is running`);
}
bootstrap();
