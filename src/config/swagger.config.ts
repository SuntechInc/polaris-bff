import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupRedoc } from './redoc.middleware';
import { CoreServicePublicModule } from '@/modules/core-service/core-service-public.module';
import { AuthModule } from '@/modules/auth/auth.module';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Qualityflow API Documentation')
    .setDescription(`
# Qualityflow API

This is the complete documentation of the Qualityflow API.

## Authentication

Most endpoints require JWT authentication.

## API Structure

- **Branch**: Branch management
- **Department**: Department management
- **JobTitle**: Job title management
- **JobTitleVersion**: Job title version management
- **JobTitleLevel**: Job title level management
- **Employee**: Employee management
- **Auth**: Authentication and authorization

## Filters

Many endpoints support dynamic filters using operators like:
- \`eq:\` (equals)
- \`in:\` (in list)
- \`contains:\` (contains text)
- \`gte:\` (greater than or equal)
- \`lte:\` (less than or equal)

Example: \`GET /employees/filter?companyId=123&status=eq:ACTIVE&or.name=contains:John\`
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Branch', 'Branch management')
    .addTag('Department', 'Department management')
    .addTag('JobTitle', 'Job title management')
    .addTag('JobTitleVersion', 'Job title version management')
    .addTag('JobTitleLevel', 'Job title level management')
    .addTag('Employee', 'Employee management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [CoreServicePublicModule, AuthModule],
  });

  // Expose Swagger JSON
  app.use('/api-json', (_req, res) => res.json(document));

  // Setup ReDoc
  setupRedoc(app.getHttpAdapter().getInstance());

  console.log('📚 Documentation available at:');
  console.log('   • ReDoc: http://localhost:3333/docs');
  console.log('   • OpenAPI JSON: http://localhost:3333/api-json');
}
