import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupRedoc } from './redoc.middleware';
import { CoreServiceAdminModule } from '@/modules/core-service/core-service-admin.module';
import { AuthModule } from '@/modules/auth/auth.module';

export function setupAdminDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Qualityflow - Administration Management API')
    .setDescription(`
# Qualityflow - Administration Management API

## ⚠️ Restricted Access

**ATTENTION**: All endpoints in this documentation require **GLOBAL_ADMIN** permission.

## Authentication

- **JWT Token**: Required in all endpoints
- **Role**: GLOBAL_ADMIN
- **Local Development**: Use \`SKIP_AUTH=true\` in .env to bypass authentication

## Available Endpoints

### Authentication
- **POST** \`/auth/login\` - User login
- **GET** \`/auth/profile\` - Authenticated user profile

### Company Management
- **GET** \`/companies/filter\` - Filter companies
- **POST** \`/company\` - Create new company
- **PUT** \`/companies/:id\` - Update company
- **GET** \`/companies/modules\` - List available modules
- **GET** \`/companies/:companyId/modules\` - List modules for company
- **POST** \`/companies/:companyId/modules\` - Activate module for company

## Available Filters

All filter endpoints support dynamic operators:
- \`eq:\` (equals)
- \`in:\` (in list)
- \`contains:\` (contains text)
- \`gte:\` (greater than or equal)
- \`lte:\` (less than or equal)

Example: \`GET /companies/filter?status=eq:ACTIVE&or.tradingName=contains:Tech\`
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
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Company', 'Administrative management of companies')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [CoreServiceAdminModule, AuthModule],
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
    title: 'Qualityflow - Administration Management API',
    version: '1.0',
    specUrl: '/admin-api-json',
        theme: {
          typography: { 
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5em',
            code: {
              fontSize: '13px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
            },
            headings: {
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: '600',
            },
          },
          colors: {
            primary: { main: '#dc2626' },
            text: { 
              primary: '#ffffff', 
              secondary: '#bbbbbb' 
            },
            http: {
              get: '#61affe',
              post: '#49cc90',
              put: '#fca130',
              delete: '#f93e3e',
            },
            responses: {
              '2xx': '#4caf50',
              '3xx': '#2196f3',
              '4xx': '#ff9800',
              '5xx': '#f44336',
            },
            background: {
              page: '#121212',
              content: '#1e1e1e',
            },
            sidebar: {
              backgroundColor: '#1e1e1e',
              textColor: '#ffffff',
              groupItems: '#333333',
            },
          },
        },
  };

  app.use('/admin-docs', require('redoc-express')(redocOptions));
} 