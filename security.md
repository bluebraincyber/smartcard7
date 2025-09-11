# Segurança - Smartcard7

## Visão Geral

Este documento detalha as práticas e mecanismos de segurança implementados no Smartcard7, incluindo controles de autenticação, autorização, validação de entrada e proteção contra ameaças comuns da OWASP Top 10.

## Autenticação

### NextAuth.js
O sistema utiliza NextAuth.js para gerenciamento completo de autenticação:

- **Sessões JWT**: Tokens assinados com `NEXTAUTH_SECRET`
- **Hashing de senhas**: bcryptjs com salt rounds de 10
- **Expiração**: Sessões expiram em 30 dias
- **Refresh automático**: Tokens renovados automaticamente

```typescript
// Configuração de segurança da sessão
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 dias
}
```

### Provedores Suportados
- **Credentials**: Email/senha com validação bcrypt
- **OAuth** (futuro): Google, GitHub, Facebook

### Proteção de Rotas
```typescript
// Verificação em Server Components
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  notFound();
}

// Verificação em API Routes
const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Não autorizado' });
}
```

## Autorização Multi-Tenant

### Princípios de Isolamento
1. **Nivel 1**: Verificação de `userid` na tabela `stores`
2. **Nivel 2**: JOIN obrigatório com `stores` para validar propriedade
3. **Nivel 3**: Filtros automáticos por `storeid` em todas as consultas

### Padrão de Consultas Seguras
```sql
-- ✅ CORRETO: Sempre incluir userid na consulta
SELECT s.* FROM stores s 
WHERE s.id = $1 AND s.userid = $2;

-- ✅ CORRETO: Validar propriedade via JOIN
SELECT i.* FROM items i
JOIN categories c ON i.categoryid = c.id
JOIN stores s ON c.storeid = s.id
WHERE i.id = $1 AND s.userid = $2;

-- ❌ INCORRETO: Confiar apenas no ID do recurso
SELECT * FROM items WHERE id = $1;
```

### Testes de Vazamento de Tenant
```bash
# Cenário de teste obrigatório
# 1. Criar usuário A com loja A
# 2. Criar usuário B com loja B  
# 3. Tentar acessar loja B com sessão do usuário A
# Resultado esperado: 404 Not Found
```

## Validação de Entrada

### Zod Schemas
Validação rigorosa de todos os dados de entrada:

```typescript
// Schema para criação de item
const createItemSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Preço inválido'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  categoryId: z.string().uuid('ID da categoria inválido'),
});

// Uso nas rotas de API
try {
  const validatedData = createItemSchema.parse(body);
  // Processar dados validados...
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ 
      errors: error.errors,
      message: 'Dados inválidos' 
    }, { status: 400 });
  }
}
```

### Sanitização de Uploads
```typescript
// Validações de arquivo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Validação de tipo MIME
if (!ALLOWED_TYPES.includes(file.type)) {
  return { error: 'Tipo de arquivo não permitido' };
}

// Validação de tamanho
if (file.size > MAX_SIZE) {
  return { error: 'Arquivo muito grande' };
}

// Validação de nome do arquivo
const sanitizedName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
```

## Cabeçalhos de Segurança

### Configuração no next.config.js
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // Previne ataques de clickjacking
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        // Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'"
          ].join('; ')
        },
        // Força HTTPS em produção
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        // Previne MIME sniffing
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        // Proteção XSS do navegador
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        // Controla informações do referrer
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        // Remove informações do servidor
        {
          key: 'X-Powered-By',
          value: 'Smartcard7'
        }
      ]
    }
  ];
}
```

## CORS e CSRF

### CORS
```typescript
// Configuração CORS para API pública
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://smartcard7.com' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
```

### Proteção CSRF
- **NextAuth.js**: Proteção automática para rotas de autenticação
- **SameSite Cookies**: Configuração segura de cookies
- **Origin Verification**: Verificação de origem em rotas sensíveis

```typescript
// Verificação de origem em APIs críticas
const origin = req.headers.get('origin');
const allowedOrigins = ['https://smartcard7.com', 'https://app.smartcard7.com'];

if (!allowedOrigins.includes(origin)) {
  return new Response('Origem não permitida', { status: 403 });
}
```

## Rate Limiting

### Implementação com Middleware
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit excedido', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  }

  return NextResponse.next();
}

// Configuração por rota
export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/upload/:path*',
    '/api/stores/:path*'
  ]
};
```

### Limites por Endpoint
| Endpoint | Limite | Janela | Justificativa |
|----------|---------|---------|---------------|
| `POST /api/auth/login` | 5 req | 15 min | Prevenir brute force |
| `POST /api/auth/register` | 3 req | 1 hora | Prevenir spam de contas |
| `POST /api/upload` | 10 req | 5 min | Controlar uso de storage |
| `POST /api/stores` | 3 req | 1 hora | Prevenir criação em massa |
| Endpoints gerais | 100 req | 15 min | Uso normal da API |

## Gestão de Secrets

### Variáveis de Ambiente Obrigatórias
```bash
# Autenticação
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Banco de dados
POSTGRES_URL=postgresql://user:pass@host:5432/db
DATABASE_URL=postgresql://user:pass@host:5432/db

# Upload (se usando serviço externo)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoramento
SENTRY_DSN=https://your-sentry-dsn
```

### Rotação de Secrets
```bash
# Procedimento de rotação de NEXTAUTH_SECRET
# 1. Gerar novo secret
openssl rand -base64 32

# 2. Atualizar variável de ambiente
# 3. Reiniciar aplicação
# 4. Invalidar todas as sessões ativas (opcional)
```

## Segurança de Upload

### Validação Rigorosa
```typescript
// Verificação de tipo real do arquivo (não apenas extensão)
import { fromBuffer } from 'file-type';

async function validateFileType(buffer: Buffer): Promise<boolean> {
  const fileType = await fromBuffer(buffer);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  return fileType && allowedTypes.includes(fileType.mime);
}

// Escaneamento de malware (integração futura)
async function scanForMalware(filePath: string): Promise<boolean> {
  // Integração com ClamAV ou serviço similar
  return true; // Placeholder
}
```

### Quarentena e Processamento
```typescript
// Diretório de quarentena temporária
const QUARANTINE_DIR = '/tmp/uploads/quarantine';
const SAFE_DIR = '/public/uploads';

async function processUpload(file: File) {
  // 1. Salvar em quarentena
  const quarantinePath = `${QUARANTINE_DIR}/${generateSafeFileName(file.name)}`;
  
  // 2. Validar tipo e conteúdo
  const isValid = await validateFileType(buffer);
  const isSafe = await scanForMalware(quarantinePath);
  
  // 3. Mover para diretório seguro ou rejeitar
  if (isValid && isSafe) {
    await moveFile(quarantinePath, `${SAFE_DIR}/${fileName}`);
  } else {
    await deleteFile(quarantinePath);
    throw new Error('Arquivo rejeitado pela verificação de segurança');
  }
}
```

## Auditoria e Logs

### Log de Eventos de Segurança
```typescript
// Função de auditoria
async function logSecurityEvent(
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMITED',
  details: {
    userId?: string;
    ip: string;
    userAgent: string;
    resource?: string;
  }
) {
  await pool.query(`
    INSERT INTO security_logs (event, user_id, ip_address, user_agent, resource, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [event, details.userId, details.ip, details.userAgent, details.resource]);
}
```

### Monitoramento de Anomalias
```sql
-- Query para detectar tentativas de login suspeitas
SELECT ip_address, COUNT(*) as attempts, 
       MIN(created_at) as first_attempt,
       MAX(created_at) as last_attempt
FROM security_logs 
WHERE event = 'LOGIN_FAILED' 
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) >= 5
ORDER BY attempts DESC;

-- Query para detectar acessos a recursos de outros tenants
SELECT user_id, ip_address, resource, COUNT(*) as violations
FROM security_logs 
WHERE event = 'UNAUTHORIZED_ACCESS'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address, resource
ORDER BY violations DESC;
```

## Backup e Recuperação

### Estratégia de Backup
```bash
# Backup automático do banco (cron job)
#!/bin/bash
pg_dump $POSTGRES_URL > "/backups/smartcard7-$(date +%Y%m%d_%H%M%S).sql"

# Retenção de 30 dias
find /backups -name "smartcard7-*.sql" -mtime +30 -delete

# Backup de uploads
rsync -av --delete /public/uploads/ /backups/uploads/
```

### Teste de Recuperação
```bash
# Procedimento de teste mensal
# 1. Restaurar backup em ambiente de teste
createdb smartcard7_test
psql smartcard7_test < /backups/latest.sql

# 2. Verificar integridade dos dados
psql smartcard7_test -c "SELECT COUNT(*) FROM users;"
psql smartcard7_test -c "SELECT COUNT(*) FROM stores;"

# 3. Testar funcionalidades críticas
curl -X POST http://test.smartcard7.com/api/auth/login
```

## Compliance e Regulamentações

### LGPD (Lei Geral de Proteção de Dados)
- **Minimização de dados**: Coletamos apenas dados necessários
- **Consentimento**: Termos claros de uso e privacidade
- **Portabilidade**: API para exportação de dados do usuário
- **Direito ao esquecimento**: Funcionalidade de exclusão de conta

```typescript
// Exportação de dados do usuário (LGPD)
async function exportUserData(userId: string) {
  const userData = await pool.query(`
    SELECT 
      u.name, u.email, u.created_at,
      JSON_AGG(s.*) as stores
    FROM users u
    LEFT JOIN stores s ON u.id = s.userid
    WHERE u.id = $1
    GROUP BY u.id
  `, [userId]);

  return {
    personal_data: userData.rows[0],
    export_date: new Date().toISOString(),
    retention_policy: "30 dias após exclusão da conta"
  };
}
```

## Checklist de Segurança

### Deploy
- [ ] HTTPS habilitado com certificado válido
- [ ] Cabeçalhos de segurança configurados
- [ ] Rate limiting ativo
- [ ] Logs de segurança funcionando
- [ ] Backup automatizado configurado
- [ ] Variáveis de ambiente seguras
- [ ] CSP sem `unsafe-inline` em produção

### Desenvolvimento
- [ ] Validação Zod em todas as APIs
- [ ] Queries SQL parametrizadas
- [ ] Testes de vazamento de tenant
- [ ] Auditoria de dependências (`npm audit`)
- [ ] Revisão de código obrigatória
- [ ] Testes de segurança automatizados

### Monitoramento
- [ ] Alertas para tentativas de login falhas
- [ ] Monitoramento de rate limiting
- [ ] Detecção de anomalias de acesso
- [ ] Verificação de integridade de arquivos
- [ ] Análise de logs de segurança

## Plano de Resposta a Incidentes

### Severidade Alta (Vazamento de dados)
1. **Contenção imediata** (0-1h)
   - Isolar sistema afetado
   - Bloquear acesso suspeito
   - Preservar evidências

2. **Análise** (1-4h)
   - Determinar escopo do incidente
   - Identificar dados comprometidos
   - Rastrear origem do ataque

3. **Comunicação** (4-24h)
   - Notificar stakeholders internos
   - Preparar comunicação aos usuários
   - Reportar às autoridades (se necessário)

4. **Recuperação** (24-72h)
   - Aplicar correções de segurança
   - Restaurar serviços seguros
   - Monitorar atividade anômala

### Contatos de Emergência
- **CTO**: emergency@smartcard7.com
- **DevOps**: devops@smartcard7.com  
- **Legal**: legal@smartcard7.com

Este documento deve ser revisado trimestralmente e atualizado conforme novas ameaças e regulamentações.