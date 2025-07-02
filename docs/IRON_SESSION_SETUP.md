# Configuração do Iron Session no BFF

## Visão Geral

O frontend utiliza `iron-session` para criptografar o JWT antes de salvar no cookie. O BFF precisa descriptografar esse cookie para extrair o JWT puro e validar a autenticação.

## Configuração

### 1. Variável de Ambiente

Adicione a seguinte variável de ambiente ao seu arquivo `.env`:

```env
IRON_SESSION_SECRET=12345678901234567890123456789012
```

**IMPORTANTE**: Esta chave deve ser **exatamente igual** à usada no frontend.

### 2. Configuração do Frontend

O frontend deve estar configurado assim:

```typescript
const secret = '12345678901234567890123456789012' // Deve ser igual ao BFF
const ttl = 60 * 60 * 24 * 7

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<{ token: string }>(cookieStore, {
    password: secret,
    cookieName: 'auth',
    ttl,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // só HTTPS em produção
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ajuste para desenvolvimento
      domain: process.env.NODE_ENV === 'production' ? '.qualityflow.com.br' : undefined, // só em produção
      maxAge: (ttl === 0 ? 2147483647 : ttl) - 60,
      path: '/',
    },
  })
}
```

## Como Funciona

1. **Frontend**: Salva o JWT criptografado no cookie `auth` usando iron-session
2. **BFF**: Detecta que o cookie é do iron-session (formato `Fe26.2*...`)
3. **BFF**: Descriptografa o cookie usando a mesma chave secreta e configurações
4. **BFF**: Extrai o JWT puro e valida normalmente

## Compatibilidade

O sistema mantém compatibilidade com:
- Tokens JWT diretos no header `Authorization: Bearer <token>`
- Cookies JWT não criptografados
- Cookies iron-session criptografados

## Teste

Para testar se a descriptografia está funcionando, acesse:

```
GET /auth/test-iron-session
```

Este endpoint retornará:
- `success: true` se a descriptografia funcionar
- Detalhes do erro se houver problemas

## Troubleshooting

### Erro: "Token inválido ou expirado"

1. Verifique se `IRON_SESSION_SECRET` está igual no frontend e BFF
2. Confirme se o cookie está sendo enviado corretamente
3. Verifique se o formato do cookie está correto (deve começar com `Fe26.2`)
4. Use o endpoint `/auth/test-iron-session` para testar a descriptografia

### Erro: "Token não fornecido"

1. Verifique se o cookie `auth` está sendo enviado
2. Confirme se o domínio do cookie está correto
3. Verifique se `sameSite` e `secure` estão configurados adequadamente

### Erro na descriptografia

1. Verifique se a chave secreta está correta
2. Confirme se as configurações de ambiente (dev/prod) estão iguais
3. Verifique os logs do `IronSessionService` para detalhes do erro

## Segurança

- A chave secreta deve ter pelo menos 32 caracteres
- Use variáveis de ambiente para a chave secreta
- Nunca commite a chave secreta no repositório
- Use HTTPS em produção
- As configurações de cookie são diferentes para desenvolvimento e produção 