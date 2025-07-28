import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupRedoc } from './redoc.middleware';
import { CoreServicePublicModule } from '@/modules/core-service/core-service-public.module';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Polaris BFF API Documentation')
    .setDescription(`
# Polaris BFF API

Esta é a documentação completa da API do Polaris BFF (Backend for Frontend).

## Autenticação

A maioria dos endpoints requer autenticação JWT. Para endpoints administrativos, é necessário ter permissão de **GLOBAL_ADMIN**.

## Desenvolvimento Local

Para desenvolvimento local, você pode usar a variável de ambiente \`SKIP_AUTH=true\` para pular a autenticação.

## Estrutura da API

- **Branch**: Gerenciamento de filiais
- **Department**: Gerenciamento de departamentos
- **JobTitle**: Gerenciamento de cargos
- **JobTitleVersion**: Gerenciamento de versões de cargos
- **JobTitleLevel**: Gerenciamento de níveis de cargos
- **Employee**: Gerenciamento de funcionários
- **Auth**: Autenticação e autorização

## Filtros

Muitos endpoints suportam filtros dinâmicos usando operadores como:
- \`eq:\` (equals)
- \`in:\` (in list)
- \`contains:\` (contains text)
- \`gte:\` (greater than or equal)
- \`lte:\` (less than or equal)

Exemplo: \`GET /employees/filter?companyId=123&status=eq:ACTIVE&or.name=contains:João\`
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
    .addTag('Branch', 'Gerenciamento de filiais')
    .addTag('Department', 'Gerenciamento de departamentos')
    .addTag('JobTitle', 'Gerenciamento de cargos')
    .addTag('JobTitleVersion', 'Gerenciamento de versões de cargos')
    .addTag('JobTitleLevel', 'Gerenciamento de níveis de cargos')
    .addTag('Employee', 'Gerenciamento de funcionários')
    .addTag('Auth', 'Autenticação e autorização')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [CoreServicePublicModule],
  });

  // Expose Swagger JSON
  app.use('/api-json', (_req, res) => res.json(document));

  // Setup ReDoc
  setupRedoc(app.getHttpAdapter().getInstance());

  console.log('📚 Documentation available at:');
  console.log('   • ReDoc: http://localhost:3333/docs');
  console.log('   • OpenAPI JSON: http://localhost:3333/api-json');
}
