# Sistema de Autenticação e Autorização

Este BFF implementa um sistema de autenticação JWT global e autorização específica para rotas administrativas.

## Como Funciona

### 1. Autenticação Global
- **Todas as rotas** da aplicação validam automaticamente o token JWT
- O guard JWT está configurado globalmente no `main.ts`
- Não é necessário adicionar guards em cada rota

### 2. Estrutura do Token JWT

O token JWT deve conter as seguintes informações:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "companyId": "company-123",
  "actionCompanyId": "company-123",
  "userType": "GLOBAL_ADMIN|COMPANY_ADMIN|EMPLOYEE",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 3. Tipos de Usuário (userType)

- **GLOBAL_ADMIN**: Acesso total ao sistema, pode acessar rotas administrativas
- **COMPANY_ADMIN**: Admin de empresa específica
- **EMPLOYEE**: Funcionário comum

## Como Usar

### 1. Rotas Normais (Qualquer usuário autenticado)

```typescript
@Controller('example')
export class ExampleController {
  @Get('profile')
  async getProfile(@CurrentUser() user: UserPayload) {
    return { user };
  }
}
```

### 2. Rotas Administrativas (Apenas GLOBAL_ADMIN)

```typescript
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin')
export class AdminController {
  @UseGuards(AdminGuard)
  @Post('create-admin')
  async createAdmin() {
    return { message: 'Apenas GLOBAL_ADMIN pode acessar' };
  }
}
```

### 3. Acessar Informações do Usuário

```typescript
import { CurrentUser } from '../decorators/user.decorator';
import { UserPayload } from '../interfaces/user.interface';

@Controller('example')
export class ExampleController {
  @Get('profile')
  async getProfile(@CurrentUser() user: UserPayload) {
    return {
      id: user.sub,
      email: user.email,
      userType: user.userType,
      companyId: user.companyId
    };
  }
}
```

### 4. Acessar Campo Específico do Usuário

```typescript
@Get('user-email')
async getUserEmail(@CurrentUser('email') email: string) {
  return { email };
}

@Get('user-type')
async getUserType(@CurrentUser('userType') userType: string) {
  return { userType };
}
```

## Exemplos Práticos

### Rota Normal (Qualquer usuário autenticado)

```typescript
@ApiOperation({ summary: 'Perfil do usuário' })
@Get('profile')
async getProfile(@CurrentUser() user: UserPayload) {
  return {
    message: 'Perfil do usuário',
    user: {
      id: user.sub,
      email: user.email,
      userType: user.userType
    }
  };
}
```

### Rota Administrativa (Apenas GLOBAL_ADMIN)

```typescript
@ApiOperation({ summary: 'Criar admin - apenas GLOBAL_ADMIN' })
@UseGuards(AdminGuard)
@Post('admin')
async createAdmin(
  @Body() createAdminDto: CreateAdminDto,
  @CurrentUser() currentUser: UserPayload
) {
  return {
    message: 'Admin criado com sucesso',
    createdBy: currentUser.email
  };
}
```

### Rota de Teste Administrativa

```typescript
@ApiOperation({ summary: 'Rota administrativa de teste' })
@UseGuards(AdminGuard)
@Get('admin/test')
async adminTestRoute(@CurrentUser() currentUser: UserPayload) {
  return {
    message: 'Esta é uma rota administrativa de teste!',
    user: currentUser.email,
    userType: currentUser.userType,
    timestamp: new Date().toISOString()
  };
}
```

## Configuração

### Variáveis de Ambiente

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
AUTH_SERVICE_URL=http://auth-service:3000
```

### Estrutura de Arquivos

```
src/
├── guards/
│   ├── jwt.guard.ts          # Guard global de autenticação
│   └── admin.guard.ts        # Guard para rotas administrativas
├── decorators/
│   └── user.decorator.ts     # Decorator para extrair usuário
├── interfaces/
│   └── user.interface.ts     # Tipagem do usuário
├── config/
│   └── jwt.config.ts         # Configuração do JWT
└── main.ts                   # Configuração do guard global
```

## Fluxo de Autenticação

1. **Login**: Usuário faz login via `/auth/login`
2. **Token**: Recebe um JWT token
3. **Requisições**: Inclui token no header `Authorization: Bearer <token>`
4. **Guard Global**: `JwtAuthGuard` valida automaticamente todas as rotas
5. **Guard Específico**: `AdminGuard` valida apenas rotas administrativas
6. **Controller**: Acessa informações do usuário via `@CurrentUser()`

## Tratamento de Erros

- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não é GLOBAL_ADMIN para rotas administrativas

## Rotas de Exemplo

### Rotas Públicas (Qualquer usuário autenticado)
- `GET /auth/profile` - Perfil do usuário
- `GET /admin` - Listar admins
- `GET /admin/dashboard` - Dashboard

### Rotas Administrativas (Apenas GLOBAL_ADMIN)
- `GET /admin/test` - Rota de teste administrativa
- `POST /admin` - Criar admin
- `PUT /admin/:id` - Atualizar admin
- `DELETE /admin/:id` - Deletar admin
- `GET /auth/admin-only` - Rota administrativa de teste

## Boas Práticas

1. **Use o AdminGuard apenas quando necessário**: Apenas para rotas que realmente precisam de GLOBAL_ADMIN
2. **Aproveite o guard global**: Não precisa adicionar JwtAuthGuard em cada rota
3. **Use o decorator @CurrentUser()**: Para acessar informações do usuário facilmente
4. **Valide no frontend**: Implemente validação também no frontend para melhor UX 