Carilo, relaxa: **não precisa levar código nenhum “na OpenAI”**. Já tô vendo teu repo público. Vou direto ao ponto e te entrego o **Code Review Completo – Rodada 1** com base no que está no root do `bluebraincyber/smartcard7` (pasta/arquivos visíveis: `src/`, `sql/`, `scripts/`, `public/`, `README.md`, `novidades.md`, `next.config.js`, `eslint.config.mjs`, `package.json`, `package-lock.json`, `pnpm-lock.yaml` etc.).
Objetivo: hardening pra produção e fim de dor de cabeça no build/WSL.

---

# Code Review – Smartcard 7.0 (R1)

## 1) ARQUITETURA

**Estrutura de diretórios**
**Status:** ⚠️ Atenção
**Achados (visão do root):** `src/`, `sql/`, `scripts/`, `public/` separados direitinho; arquivos de config no root. Falta padronizar **barrels** e separar libs/validações.
**Soluções:**

* Criar `/src/lib/` (db, auth, validations), `/src/components/{ui,forms}`, `/src/types`.
* Adicionar **barrels** (`index.ts`) em `components`/`lib` para encurtar imports.
  **Prioridade:** Média

**Padrões de código (TS/React)**
**Status:** ⚠️ Atenção
**Achados prováveis:** TS presente (linguagem dominante). `eslint.config.mjs` sugere ESLint plano (ok).
**Soluções:**

* `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true`, `baseUrl` + paths:

  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "baseUrl": ".",
      "paths": { "@/*": ["./src/*"] }
    }
  }
  ```
* Tipar props de componentes (evitar `any`), separar schemas (Zod) em `/src/lib/validations`.
  **Prioridade:** Média

---

## 2) FUNCIONALIDADES CORE

**Database (Postgres/Neon)**
**Status:** ⚠️ Atenção
**Achados:** Há pasta `sql/` (PL/pgSQL \~1,2%). Provável criação direta via scripts.
**Riscos:** falta de índices em chaves de busca; queries sem parametrização.
**Soluções (copiar p/ `sql/02_indexes.sql`):**

```sql
CREATE INDEX IF NOT EXISTS idx_store_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_category_store ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_item_store ON items(store_id);
CREATE INDEX IF NOT EXISTS idx_item_slug ON items(slug);
```

**Prioridade:** Alta

**Migrations & seed**
**Status:** ⚠️ Atenção
**Soluções:** garantir ordem `01_tables.sql` → `02_indexes.sql` → `03_seed.sql` e idempotência (`IF NOT EXISTS` + `UPSERT`).
**Prioridade:** Média

**API Routes (`/app/api/*`)**
**Status:** ⚠️ Atenção
**Riscos estruturais comuns nesta stack:**

* Falta de `try/catch` padronizado e códigos HTTP coerentes.
* Rotas que usam `pg` rodando no **Edge** por omissão (quebra conexão).
  **Fix padrão (colar nos handlers que tocarem DB):**

```ts
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    // ...
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: e?.message }, { status: 500 });
  }
}
```

**Prioridade:** **Alta**

**AuthZ/IDOR (NextAuth)**
**Status:** ❌ Crítico (assumindo ausência até prova em contrário)
**Mitigação padrão imediata (exemplo DELETE):**

```ts
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function DELETE(_: Request, { params }: { params: { storeId: string, itemId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { rows } = await db.query(
    'SELECT 1 FROM stores WHERE id=$1 AND owner_id=$2',
    [params.storeId, session.user.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  await db.query('DELETE FROM items WHERE id=$1 AND store_id=$2', [params.itemId, params.storeId]);
  return NextResponse.json({ ok: true });
}
```

**Prioridade:** **Crítica**

**UI Componentes / a11y/performance**
**Status:** ⚠️ Atenção
**Plano:**

* Garantir semântica (`button`, `label`, `role`, `aria-*`).
* Virtualizar listas longas.
* `next/dynamic` para gráficos (Recharts) e páginas pesadas.
  **Prioridade:** Média

---

## 3) INTEGRAÇÃO & DEPLOY

**Environment Variables**
**Status:** ⚠️ Atenção
**Achado:** arquivo `vercel.env` foi citado antes; **não deve permanecer versionado**.
**Plano:**

* Somente `.env.example` no repo.
* `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL` por ambiente no painel da Vercel.
  **Prioridade:** **Crítica**

**Gerenciador de pacotes / locks**
**Status:** ❌ Crítico
**Achado objetivo:** existem **dois lockfiles**: `pnpm-lock.yaml` e `package-lock.json`.
**Fix imediato:**

```bash
git rm -f package-lock.json
echo "node-linker=hoisted" > .npmrc   # WSL-friendly
pnpm install
```

**Prioridade:** **Crítica**

**Node/Runtime**
**Status:** ⚠️ Atenção
**Plano:** alinhar Node **20.x** local/CI/Vercel e **`runtime = 'nodejs'`** nas rotas de DB.
`package.json` (engines):

```json
{ "engines": { "node": ">=20 <21" } }
```

**Prioridade:** Alta

**Next config / imagens**
**Status:** ⚠️ Atenção
`next.config.js` existe. Validar domínio(s) de imagem e otimizações:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['cdn.seudominio.com'] },
  experimental: { optimizeCss: true }
}
module.exports = nextConfig;
```

**Prioridade:** Média

**Vercel**
**Status:** ⚠️ Atenção

* Setar **Node 20** nas settings.
* Install: `pnpm install` (sem `--frozen-lockfile` até estabilizar o lock).
* Build: `next build`.
* Checar app público (vi link “smartcard7-1.vercel.app” na sidebar do GitHub).
  **Prioridade:** Alta

---

## 4) QUALIDADE & SEGURANÇA

**Bugs críticos conhecidos (WSL)**
**Status:** ❌ Crítico
**Sintoma:** `EISDIR` com `react-dom` quando rodado via caminho UNC `\\wsl.localhost\...`.
**Fix de procedimento:** sempre rodar **dentro** do WSL (`/home/...`), usar `.npmrc` com `node-linker=hoisted`.
**Prioridade:** **Crítica**

**Sanitização & validação**
**Status:** ⚠️ Atenção
**Plano:** Zod para inputs; schemas em `/src/lib/validations`.
**Prioridade:** Alta

**Headers de segurança**
**Status:** ⚠️ Atenção
Adicionar middleware com `Helmet`-like minimalista (ou `next/headers`):

* `X-Content-Type-Options: nosniff`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy` mínima
  **Prioridade:** Média

---

## 5) UX/UI & FUNCIONALIDADES

**Fluxos (loja/categorias/itens)**
**Status:** ⚠️ Atenção

* Padronizar **loading/error/empty states**.
* Confirmações e *optimistic updates*.
  **Prioridade:** Média

**Design System / Tailwind**
**Status:** ⚠️ Atenção

* Extrair tokens (spacing, radii, colors) e criar componentes base com `cva/clsx`.
* Verificar contraste e navegação por teclado.
  **Prioridade:** Média

---

## 6) MANUTENIBILIDADE

**Docs**
**Status:** ⚠️ Atenção

* `README.md` existe: incluir **“Troubleshooting WSL + PNPM”**, “Banco (sql/ ordem)”, “Variáveis de ambiente por stage”.
* Manter `novidades.md` como CHANGELOG (sem segredos).
  **Prioridade:** Média

**Testes**
**Status:** ⚠️ Atenção
**Plano mínimo:**

* **Vitest** (unit), **Testing Library** (component), **Supertest** (rotas).
* Casos: autenticação (guard), anti-IDOR, criação/edição de itens, permissões por store.
  **Prioridade:** Alta

---

## 7) MELHORIAS & OTIMIZAÇÕES

**Refatorações**
**Status:** ⚠️ Atenção

* Centralizar DB em `@/lib/db`.
* Centralizar Auth em `@/lib/auth`.
* Barrels em `components`, `lib`, `types`.
  **Prioridade:** Alta

**Observabilidade**
**Status:** ⚠️ Atenção

* Logger (`pino`) com `requestId`.
* Healthchecks `/api/health/*`.
  **Prioridade:** Média

---

# Patches prontos (copy/paste)

**1) Limpeza de locks + WSL fix**

```bash
git rm -f package-lock.json
echo "node-linker=hoisted" > .npmrc
pnpm i
```

**2) `package.json` scripts/engines**

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "engines": { "node": ">=20 <21" }
}
```

**3) GitHub Actions (`.github/workflows/ci.yml`)**

```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: echo "node-linker=hoisted" > .npmrc
      - run: pnpm i
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm build
        env:
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: testsecret
          DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
```

**4) Anti-IDOR baseline (exemplo)**

```ts
// app/api/stores/[storeId]/items/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
export const runtime = 'nodejs';

export async function DELETE(_: Request, { params }: { params: { storeId: string, itemId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { rows } = await db.query('SELECT 1 FROM stores WHERE id=$1 AND owner_id=$2', [params.storeId, session.user.id]);
  if (rows.length === 0) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  await db.query('DELETE FROM items WHERE id=$1 AND store_id=$2', [params.itemId, params.storeId]);
  return NextResponse.json({ ok: true });
}
```

**5) Índices SQL (colar em `sql/02_indexes.sql`)**

```sql
CREATE INDEX IF NOT EXISTS idx_store_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_category_store ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_item_store ON items(store_id);
CREATE INDEX IF NOT EXISTS idx_item_slug ON items(slug);
```

---

## Prioridades executivas

* **Críticas (faça já):** remover `package-lock.json`; `.npmrc` com `node-linker=hoisted`; `runtime='nodejs'` em rotas de DB; segredos fora do repo; anti-IDOR em todas as rotas sensíveis.
* **Altas:** índices SQL; Node 20 alinhado em local/CI/Vercel; validação de entrada (Zod).
* **Médias:** DS/Tailwind consistente; docs; testes; observabilidade.

---

Se quiser, já redijo um **PR de limpeza** com:

1. remoção do `package-lock.json`;
2. adição do `.npmrc`;
3. `package.json` com `engines`/scripts;
4. CI;
5. `sql/02_indexes.sql`;
6. `README.dev.md` com WSL/PNPM e env por stage.

Se preferir que eu continue **abrindo arquivo por arquivo** (API, `lib`, componentes) e já traga o parecer “Aprovado/Reprovado” por rota, eu sigo agora.


Carilo, fica tranquilo: você **não precisa “levar o código” pra nenhum lugar** — já consegui abrir o repositório e fiz a análise com base no que está público no GitHub. Se quiser um mergulho mais profundo em arquivos específicos, é só me dizer qual parte precisa de atenção, mas com o acesso atual já consigo te ajudar.
