# SmartCard — Guia Definitivo de Rebuild (Neon + Host Togo)

## Sobre o Projeto
Plataforma para criação de catálogos/menus digitais com painel administrativo, páginas públicas e pedidos via WhatsApp.

## Stack Atual
- Next.js 15 + TypeScript
- Tailwind CSS 4
- PostgreSQL (Neon) via `@vercel/postgres` (+ `pg`)
- Autenticação: NextAuth.js + `@auth/pg-adapter`
- Charts: Recharts

---

## 1) Banco Neon (já feito)
Você já criou o banco no Neon e aplicou os SQLs da pasta `sql/`.
Garanta que o `.env.local` aponta para o Neon:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

---

## 2) Estrutura SQL do Projeto
No diretório `sql/`:
- `01_tables.sql` → Tabelas (`users`, `accounts`, `sessions`, `verification_token`, `stores`, `categories`, `items`)
- `02_indexes.sql` → Índices
- `03_triggers.sql` → Triggers `updated_at`
- `99_seed.sql` → Usuário admin + loja + categorias + itens (opcional)

Aplicação manual (se necessário): 01 → 02 → 03 → (99 opcional).

---

## 3) Ajustes no Código (padrões)
- Sempre usar snake_case no banco
- Sempre aliasar para o frontend (ex.: `active AS "isActive"`, `userid AS "userid"`)
- Converter preço: `price_cents` ⇄ `price` (em reais) no boundary da API

---

## 4) Rebuild/Deploy no Host Togo
### 4.1 Criar `.env.local`
```env
NEXTAUTH_SECRET=sua_chave_randomica
NEXTAUTH_URL=https://smartcard.togo.host   # ajuste para o domínio real

DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```
> Nota: Gere `NEXTAUTH_SECRET` com `openssl rand -base64 32`

### 4.2 Build/Start no Togo
```bash
npm run build
npm start
```

### 4.3 Verificar saúde
- `GET /api/health/db` → `{ ok: true }`
- `GET /api/auth/session` → JSON da sessão (ou null sem login)
- `GET /api/stores` → lista de lojas

---

## 5) Testes Essenciais
1. Login → cria sessão no Neon
2. Criar loja → grava em `stores` com `userid` do usuário
3. Toggle → altera `active` da loja
4. Criar categoria/item → persiste em `categories` e `items`
5. Listagem/analytics → retorna sem erro

---

## 6) Plano de Contingência
- Se der bug no Togo, rode localmente (`npm run dev`) apontando para o mesmo Neon
- Confirme queries direto no Neon Console
- Só depois re-subir no Togo

---

## Resultado
- Neon limpo e padronizado
- SQL do projeto organizado (arquivos 01/02/03/99)
- Código com convenções unificadas (snake_case no DB, alias para o frontend)
- Host Togo com passos claros para rebuild
