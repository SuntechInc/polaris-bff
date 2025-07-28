import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupRedoc } from './redoc.middleware';
import { CoreServiceAdminModule } from '@/modules/core-service/core-service-admin.module';
import { CompanyAdminController } from '@/modules/core-service/admin/company-admin.controller';

export function setupAdminDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Polaris BFF - Company Management API')
    .setDescription(`
# Polaris BFF - Company Management API

Esta é a documentação dos endpoints de gerenciamento de empresas do Polaris BFF (Backend for Frontend).

## ⚠️ Acesso Restrito

**ATENÇÃO**: Todos os endpoints nesta documentação requerem permissão de **GLOBAL_ADMIN**.

## Autenticação

- **JWT Token**: Obrigatório em todos os endpoints
- **Role**: GLOBAL_ADMIN
- **Desenvolvimento Local**: Use \`SKIP_AUTH=true\` no .env para pular autenticação

## Endpoints Disponíveis

### Company Management
- **GET** \`/companies/filter\` - Filtrar empresas
- **POST** \`/company\` - Criar nova empresa
- **PUT** \`/companies/:id\` - Atualizar empresa
- **GET** \`/companies/modules\` - Listar módulos disponíveis
- **GET** \`/companies/:companyId/modules\` - Listar módulos da empresa
- **POST** \`/companies/:companyId/modules\` - Ativar módulo para empresa

## Filtros Disponíveis

Todos os endpoints de filtro suportam operadores dinâmicos:
- \`eq:\` (equals)
- \`in:\` (in list)
- \`contains:\` (contains text)
- \`gte:\` (greater than or equal)
- \`lte:\` (less than or equal)

Exemplo: \`GET /companies/filter?status=eq:ACTIVE&or.tradingName=contains:Tech\`
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token with GLOBAL_ADMIN role',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Company', 'Gerenciamento administrativo de empresas')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [CoreServiceAdminModule],
  });

  // Expose Admin Swagger JSON
  app.use('/admin-api-json', (_req, res) => res.json(document));

  // Setup Admin ReDoc
  setupAdminRedoc(app.getHttpAdapter().getInstance());

  console.log('📚 Company Management Documentation available at:');
  console.log('   • ReDoc: http://localhost:3333/admin-docs');
  console.log('   • OpenAPI JSON: http://localhost:3333/admin-api-json');
}

function setupAdminRedoc(app: any) {
  const redocOptions = {
    title: 'Polaris BFF - Company Management API',
    version: '1.0',
    specUrl: '/admin-api-json',
    theme: {
      colors: {
        primary: {
          main: '#dc3545', // Vermelho para indicar área administrativa
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
        },
        gray: {
          50: '#f8f9fa',
          100: '#e9ecef',
        },
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5em',
        code: {
          fontSize: '13px',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        },
        headings: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '600',
        },
      },
      sidebar: {
        backgroundColor: '#f8f9fa',
        textColor: '#2c3e50',
      },
    },
  };

  app.use('/admin-docs', require('redoc-express')(redocOptions));
} 