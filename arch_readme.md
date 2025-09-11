# Arquitetura Smartcard7

## Visão Geral

O Smartcard7 é uma plataforma SaaS multi-tenant para criação de cardápios digitais e lojas online. Cada usuário pode criar múltiplas lojas com subdomínios únicos, gerenciar categorias e itens com upload de imagens.

## Stack Tecnológica

### Frontend
- **Next.js 14+** com App Router (Server Components por padrão)
- **React 18** com TypeScript para tipagem forte
- **Tailwind CSS** para estilização utilitária
- **shadcn/ui** para componentes de interface padronizados

### Backend
- **Next.js API Routes** (Node.js runtime)
- **NextAuth.js** para autenticação e gestão de sessões
- **PostgreSQL** como banco de dados principal
- **pg** (node-postgres) como driver de conexão

### Observabilidade
- **Pino** para logs estruturados
- **Request ID** para correlação de logs
- Sistema de auditoria customizado

## Arquitetura de Alto Nível

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ • Server Comp.  │────│ • Auth Guard    │────│ • Multi-tenant  │
│ • Client Comp.  │    │ • Validation    │    │ • ACID Trans.   │
│ • Image Upload  │    │ • Rate Limit    │    │ • Índices Opt.  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   File System   │──────────────┘
                        │                 │
                        │ • public/uploads│
                        │ • Validação MIME│
                        │ • Controle Size │
                        └─────────────────┘
```

## Isolamento Multi-Tenant

### Estratégia de Segurança
- **Nível 1**: Verificação de `userid` na tabela `stores`
- **Nível 2**: JOIN obrigatório com `stores` para validar propriedade
- **Nível 3**: Filtros automáticos por `storeid` em todas as consultas

### Fluxo de Autorização
```sql
-- Exemplo: Buscar item verificando propriedade
SELECT i.* FROM items i
JOIN categories c ON i.categoryid = c.id
JOIN stores s ON c.storeid = s.id
WHERE i.id = $1 AND s.userid = $2
```

## Gestão de Estado e Cache

### Server Components (Padrão)
- Renderização no servidor
- Acesso direto ao banco de dados
- `dynamic = 'force-dynamic'` para dados dinâmicos

### Client Components (Seletivo)
- Marcados com `"use client"`
- Para interatividade (hooks, eventos)
- Estado otimista para operações de toggle

### Estratégia de Cache
```javascript
// Páginas públicas - ISR recomendado
export const revalidate = 60; // 60 segundos

// Painel admin - dados sempre frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

## Modelo de Dados

### Hierarquia Principal
```
Users (1:N) → Stores (1:N) → Categories (1:N) → Items
```

### Campos Críticos
- **Preços**: `price_cents` (INTEGER) para precisão monetária
- **Status**: `isactive`, `isarchived` para soft delete
- **Slugs**: `slug` UNIQUE para URLs amigáveis

## Segurança OWASP

### Headers de Segurança
```javascript
// next.config.js
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:;"
  }
]
```

### Validação de Entrada
- **Zod** para validação de schemas
- Sanitização de uploads (tipo MIME, tamanho)
- Rate limiting para endpoints críticos

## Performance e Otimização

### Índices de Banco
```sql
-- Consultas frequentes otimizadas
CREATE INDEX items_storeid_isactive_idx ON items (storeid, isactive);
CREATE INDEX stores_slug_idx ON stores (slug);
CREATE INDEX categories_storeid_idx ON categories (storeid);
```

### Bundle Optimization
- Code-splitting automático por rota
- `next/image` para otimização de imagens
- Tree-shaking de dependências

## Deploy e Ambientes

### Vercel (Recomendado)
- Deploy automático via Git
- Preview por Pull Request
- Edge Functions para performance global

### Variáveis de Ambiente
```bash
# Essenciais
POSTGRES_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

# Upload de imagens
NEXT_PUBLIC_UPLOAD_URL=/api/upload
```

## Pontos de Atenção

### Riscos Atuais
1. **Falta de rollback** em operações otimistas
2. **Ausência de rate limiting** para APIs públicas
3. **Sem sistema de estoque** implementado
4. **Gestão manual de migrações** SQL

### Próximos Passos
1. Implementar ISR para páginas públicas (`revalidate = 60`)
2. Adicionar monitoramento com Sentry
3. Criar testes E2E com Playwright
4. Configurar CI/CD pipeline completo

## Estrutura de Arquivos

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── [slug]/            # Páginas públicas das lojas
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   └── dashboard/         # Painel administrativo
├── components/
│   ├── ui/                # Componentes base (shadcn)
│   └── molecules/         # Componentes compostos
├── lib/                   # Utilities e configurações
└── types/                 # Definições TypeScript
```

Este documento serve como guia arquitetural para desenvolvedores e stakeholders compreenderem as decisões técnicas e padrões adotados no Smartcard7.