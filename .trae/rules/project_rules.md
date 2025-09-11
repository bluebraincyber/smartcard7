# Project Rules

## Contexto do Projeto
- Nome: <preencher>
- Domínio: <preencher>
- Banco/ORM: <Postgres /Drizzle>
- Auth: <NextAuth/Clerk>
- Deploy: <Vercel/Outro>
- Integrações: <ex.: Stripe, Notion, WhatsApp, etc.>

## Convenções
- Pastas: `app/`, `lib/`, `components/`, `server/`, `db/`, `tests/`, `e2e/`.
- Nomenclatura: kebab-case para rotas, PascalCase para componentes, camelCase para helpers.
- `use client` somente no topo de componentes interativos.
- Variáveis de ambiente tipadas em `env.mjs`; nunca expor segredo no client.

## Fluxos críticos
- <Fluxo 1> (ex.: CRUD de itens): usar Server Actions + validação zod; revalidate das rotas públicas.
- <Fluxo 2> (ex.: checkout): edge runtime + webhooks assinados.
- <Fluxo 3> (ex.: painel lojista): RSC com tabelas paginadas no servidor.

## Qualidade e Observabilidade
- Lint e testes no CI.
- Sentry/Logger configurado em `server/observability.ts`.
- Feature flags para mudanças arriscadas.

## Segurança
- Validação de entrada em todas as rotas/actions.
- Rate-limit: rotas de auth e webhook.
- Cabeçalhos de segurança via `next.config.js` (CSP quando possível).

## Perf
- Imagens: `next/image`.
- Import dinâmico para libs pesadas.
- Revalidações definidas (evitar `force-dynamic` sem motivo).

## Definições de Pronto
- [ ] Aceita critérios de A11y mínimos.
- [ ] Testes críticos verdes.
- [ ] Logs sem erro/aviso em produção.
- [ ] Docs curtas no README com comandos e variáveis.

## Playbooks por Situação

### 1) **Codegen de Feature**
- Criar rota/segmento em `app/`.
- Server Component + Server Actions.
- Zod no input, erros tratados, `revalidatePath`.
- Entregar testes unit + e2e smoke.

### 2) **Refactor**
- Mapear pontos quentes (bundle, N+1, `use client`).
- Dividir por responsabilidade; mover fetch pro servidor.
- Medir antes/depois.

### 3) **Debug em Produção**
- Reproduzir local com seed.
- Ver logs/Sentry → hipótese → fix minimal-intrusive.
- Adicionar teste que falhava.

### 5) **Hardening**
- Passar checklist de segurança e headers.
- Testar inputs malformados.
- Rate-limit + logs de tentativa.

